import "server-only";
import nodemailer from "nodemailer";
import { site } from "./site";
import { formatINR } from "./utils";

type MailOrder = {
  id: string;
  number: number;
  email: string;
  phone: string;
  total: number;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  paymentMethod: string;
  discountCode: string | null;
  sourceChannel: string | null;
  items: { productTitle: string; variantTitle: string; quantity: number; price: number }[];
  shippingAddress: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
};

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim() &&
      process.env.EMAIL_FROM?.trim(),
  );
}

function fromAddress() {
  return process.env.EMAIL_FROM!.trim();
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const port = Number(process.env.SMTP_PORT || 465);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

async function sendEmail(to: string | string[], subject: string, html: string) {
  if (!smtpConfigured()) {
    console.warn("[mail] SMTP not configured — skipped:", subject, "→", to);
    return { ok: false as const, reason: "not_configured" };
  }
  try {
    await getTransporter().sendMail({
      from: fromAddress(),
      to: Array.isArray(to) ? to.join(", ") : to,
      replyTo: process.env.EMAIL_REPLY_TO?.trim() || site.email,
      subject,
      html,
    });
    return { ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[mail] SMTP send failed", message);
    return { ok: false as const, reason: message };
  }
}

function itemsHtml(order: MailOrder) {
  return order.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee">${i.productTitle}<br/><span style="color:#777;font-size:13px">${i.variantTitle} × ${i.quantity}</span></td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${formatINR(i.price * i.quantity)}</td>
        </tr>`,
    )
    .join("");
}

function wrap(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f6f1ea;font-family:Georgia,serif;color:#1a100c">
  <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:16px;padding:28px 24px">
    <p style="margin:0 0 4px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#a67c52">${site.name}</p>
    <h1 style="margin:0 0 20px;font-size:26px">${title}</h1>
    ${body}
    <p style="margin:28px 0 0;font-size:13px;color:#777">Questions? Reply to this email or WhatsApp us on ${site.phone}.</p>
  </div></body></html>`;
}

export async function sendOrderConfirmationEmail(order: MailOrder) {
  const a = order.shippingAddress;
  const trackUrl = `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || site.url}/orders/${order.id}`;
  const html = wrap(
    `Order #${order.number} confirmed`,
    `<p style="line-height:1.55">Thanks ${a.name.split(" ")[0]} — we got your order and will pack it soon.</p>
     <table style="width:100%;border-collapse:collapse;margin:20px 0">${itemsHtml(order)}
       <tr><td style="padding-top:12px">Subtotal</td><td style="padding-top:12px;text-align:right">${formatINR(order.subtotal)}</td></tr>
       ${order.discountTotal ? `<tr><td>Discount${order.discountCode ? ` (${order.discountCode})` : ""}</td><td style="text-align:right">− ${formatINR(order.discountTotal)}</td></tr>` : ""}
       <tr><td>Shipping</td><td style="text-align:right">${order.shippingTotal ? formatINR(order.shippingTotal) : "Free"}</td></tr>
       <tr><td style="padding-top:8px;font-weight:700">Total</td><td style="padding-top:8px;text-align:right;font-weight:700">${formatINR(order.total)}</td></tr>
     </table>
     <p style="margin:0 0 8px"><strong>Payment:</strong> ${order.paymentMethod === "COD" ? "Cash on delivery" : "Paid online"}</p>
     <p style="margin:0 0 16px;line-height:1.5"><strong>Ship to:</strong><br/>${a.name}<br/>${a.line1}${a.line2 ? `<br/>${a.line2}` : ""}<br/>${a.city}, ${a.state} ${a.pincode}<br/>${a.phone}</p>
     <p><a href="${trackUrl}" style="display:inline-block;background:#1a100c;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px">View your order</a></p>`,
  );
  return sendEmail(order.email, `Being Nutty — order #${order.number} confirmed`, html);
}

export async function sendAdminNewOrderEmail(order: MailOrder) {
  const to = process.env.ORDER_NOTIFY_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim();
  if (!to) return { ok: false as const, reason: "no_admin_email" };
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || site.url}/admin/orders/${order.id}`;
  const html = wrap(
    `New order #${order.number}`,
    `<p><strong>${formatINR(order.total)}</strong> · ${order.paymentMethod === "COD" ? "COD" : "Razorpay"} · ${order.sourceChannel ?? "Unknown source"}</p>
     <p>${order.email} · ${order.phone}</p>
     <table style="width:100%;border-collapse:collapse;margin:16px 0">${itemsHtml(order)}</table>
     <p><a href="${adminUrl}" style="display:inline-block;background:#1a100c;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px">Open in admin</a></p>`,
  );
  return sendEmail(to, `New Being Nutty order #${order.number} — ${formatINR(order.total)}`, html);
}

export async function notifyOrderPlaced(order: MailOrder) {
  const [customer, admin] = await Promise.all([sendOrderConfirmationEmail(order), sendAdminNewOrderEmail(order)]);
  return { customer, admin };
}
