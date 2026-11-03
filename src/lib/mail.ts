import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { site } from "./site";
import { formatINR } from "./utils";

export type MailOrder = {
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
  courier?: string | null;
  trackingNumber?: string | null;
  items: {
    productTitle: string;
    variantTitle: string;
    quantity: number;
    price: number;
    imageUrl?: string | null;
  }[];
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

const INK = "#2a1a10";
const PAPER = "#f7f1e8";
const CREAM = "#fffaf3";
const CARAMEL = "#c4843a";
const ROAST = "#7a5a45";
const LINE = "#e8dccb";

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

/** Reject placeholders like "your inbox for new-order alerts". */
export function isRealEmail(value: string | undefined | null) {
  if (!value) return false;
  const v = value.trim();
  if (!v.includes("@") || /\s/.test(v)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

let transporter: Transporter | null = null;

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
  const recipients = (Array.isArray(to) ? to : [to]).map((t) => t.trim()).filter(isRealEmail);
  if (!recipients.length) {
    console.warn("[mail] no valid recipients — skipped:", subject, "→", to);
    return { ok: false as const, reason: "invalid_recipient" };
  }
  try {
    await getTransporter().sendMail({
      from: fromAddress(),
      to: recipients.join(", "),
      replyTo: process.env.EMAIL_REPLY_TO?.trim() || site.email,
      subject,
      html,
    });
    return { ok: true as const, to: recipients };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[mail] SMTP send failed", message);
    return { ok: false as const, reason: message };
  }
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || site.url).replace(/\/$/, "");
}

function brandShell(opts: {
  preheader: string;
  title: string;
  eyebrow?: string;
  body: string;
  cta?: { label: string; href: string };
}) {
  const logo = `${siteBase()}/brand/mascot.png`;
  const shop = siteBase();
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${esc(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};color:${INK};font-family:Georgia,'Times New Roman',serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:${CREAM};border:1px solid ${LINE};border-radius:28px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 18px;text-align:center;background:${CREAM};border-bottom:1px solid ${LINE};">
              <a href="${shop}" style="text-decoration:none;color:${INK};">
                <img src="${logo}" width="64" height="70" alt="Being Nutty" style="display:block;margin:0 auto 10px;border:0;" />
                <div style="font-size:22px;font-weight:800;letter-spacing:-0.02em;">Being<span style="color:${CARAMEL}">·</span>Nutty</div>
                <div style="margin-top:4px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${ROAST};">Go a little nutty.</div>
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;">
              ${opts.eyebrow ? `<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${CARAMEL};font-weight:700;">${esc(opts.eyebrow)}</p>` : ""}
              <h1 style="margin:0 0 14px;font-size:32px;line-height:1.05;font-weight:800;letter-spacing:-0.03em;color:${INK};">${esc(opts.title)}</h1>
              ${opts.body}
              ${
                opts.cta
                  ? `<p style="margin:28px 0 8px;text-align:center;">
                       <a href="${opts.cta.href}" style="display:inline-block;background:${INK};color:${CREAM};text-decoration:none;padding:14px 26px;border-radius:999px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;font-weight:700;">${esc(opts.cta.label)}</a>
                     </p>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:22px 28px 28px;border-top:1px solid ${LINE};">
              <p style="margin:0 0 8px;font-size:13px;line-height:1.55;color:${ROAST};">
                Packed fresh in cans · Ships across India<br/>
                WhatsApp <a href="https://wa.me/${site.whatsapp}" style="color:${INK};">${site.phone}</a>
                · <a href="mailto:${site.email}" style="color:${INK};">${site.email}</a>
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:${ROAST};opacity:0.8;">© ${new Date().getFullYear()} ${esc(site.legalName)} · FSSAI ${site.fssaiLicence}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function itemsTable(order: MailOrder) {
  const rows = order.items
    .map((i) => {
      const thumb = i.imageUrl
        ? `<td style="padding:14px 0;border-bottom:1px solid ${LINE};width:72px;vertical-align:top;">
             <img src="${esc(i.imageUrl)}" width="64" height="64" alt="" style="display:block;width:64px;height:64px;object-fit:cover;border-radius:14px;border:1px solid ${LINE};background:${PAPER};" />
           </td>`
        : `<td style="padding:14px 0;border-bottom:1px solid ${LINE};width:72px;vertical-align:top;">
             <div style="width:64px;height:64px;border-radius:14px;background:${PAPER};border:1px solid ${LINE};"></div>
           </td>`;
      return `
      <tr>
        ${thumb}
        <td style="padding:14px 12px 14px 0;border-bottom:1px solid ${LINE};vertical-align:middle;">
          <div style="font-weight:700;font-size:15px;color:${INK};">${esc(i.productTitle)}</div>
          <div style="margin-top:4px;font-size:13px;color:${ROAST};">${esc(i.variantTitle)} × ${i.quantity}</div>
        </td>
        <td style="padding:14px 0;border-bottom:1px solid ${LINE};text-align:right;vertical-align:middle;white-space:nowrap;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:700;color:${INK};">${formatINR(i.price * i.quantity)}</td>
      </tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">${rows}</table>`;
}

function totalsBlock(order: MailOrder) {
  const row = (label: string, value: string, bold = false) =>
    `<tr>
      <td style="padding:6px 0;font-size:14px;color:${ROAST};">${label}</td>
      <td style="padding:6px 0;text-align:right;font-size:14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;${bold ? `font-weight:800;font-size:18px;color:${INK};` : `color:${INK};`}">${value}</td>
    </tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;border-top:1px solid ${LINE};">
    ${row("Subtotal", formatINR(order.subtotal))}
    ${order.discountTotal ? row(`Discount${order.discountCode ? ` (${esc(order.discountCode)})` : ""}`, `− ${formatINR(order.discountTotal)}`) : ""}
    ${row("Shipping", order.shippingTotal ? formatINR(order.shippingTotal) : "Free")}
    ${row("Total", formatINR(order.total), true)}
  </table>`;
}

function addressBlock(order: MailOrder) {
  const a = order.shippingAddress;
  const mapLine = a.line2?.match(/https?:\/\/\S+/)?.[0];
  const landmark =
    a.line2 && mapLine ? a.line2.replace(mapLine, "").replace(/^[\s\-–—]+|[\s\-–—]+$/g, "") : a.line2;
  return `
    <div style="margin-top:22px;padding:16px 18px;background:${PAPER};border-radius:18px;border:1px solid ${LINE};">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${CARAMEL};font-weight:700;">Ship to</p>
      <p style="margin:0;font-size:15px;line-height:1.55;color:${INK};">
        <strong>${esc(a.name)}</strong><br/>
        ${esc(a.line1)}${landmark ? `<br/>${esc(landmark)}` : ""}<br/>
        ${esc(a.city)}, ${esc(a.state)} ${esc(a.pincode)}<br/>
        ${esc(a.phone)}
        ${mapLine ? `<br/><a href="${esc(mapLine)}" style="color:${CARAMEL};">Open in Google Maps</a>` : ""}
      </p>
    </div>`;
}

export async function sendOrderConfirmationEmail(order: MailOrder) {
  const a = order.shippingAddress;
  const first = a.name.split(" ")[0] || "there";
  const trackUrl = `${siteBase()}/orders/${order.id}`;
  const payment = order.paymentMethod === "COD" ? "Cash on delivery" : "Paid online";

  const html = brandShell({
    preheader: `Order #${order.number} confirmed — ${formatINR(order.total)}. We'll pack your cans soon.`,
    eyebrow: "Order confirmed",
    title: `Thanks, ${first}.`,
    cta: { label: "View your order", href: trackUrl },
    body: `
      <p style="margin:0 0 18px;font-size:16px;line-height:1.55;color:${ROAST};">
        Your Being Nutty order <strong style="color:${INK};">#${order.number}</strong> is in.
        We'll pack your cans and ship them across India.
      </p>
      <div style="display:inline-block;margin:0 0 18px;padding:8px 14px;border-radius:999px;background:${PAPER};border:1px solid ${LINE};font-size:13px;color:${INK};">
        ${esc(payment)} · ${formatINR(order.total)}
      </div>
      ${itemsTable(order)}
      ${totalsBlock(order)}
      ${addressBlock(order)}
    `,
  });

  return sendEmail(order.email, `Being Nutty — order #${order.number} confirmed`, html);
}

/**
 * Seller inboxes for new-order alerts.
 * Do NOT use ADMIN_EMAIL here — that is often only a login id (e.g. admin@beingnutty.in)
 * and may not be a real mailbox (bounce: domain not found).
 */
export function sellerNotifyRecipients() {
  const candidates = [process.env.ORDER_NOTIFY_EMAIL, process.env.EMAIL_REPLY_TO, site.email];
  const unique = new Set<string>();
  for (const c of candidates) {
    if (isRealEmail(c)) unique.add(c!.trim().toLowerCase());
  }
  // Avoid mailing the SMTP "from" mailbox only to itself unless it's also listed above.
  return [...unique];
}

export async function sendAdminNewOrderEmail(order: MailOrder) {
  const recipients = sellerNotifyRecipients();
  if (!recipients.length) return { ok: false as const, reason: "no_admin_email" };

  const a = order.shippingAddress;
  const adminUrl = `${siteBase()}/admin/orders/${order.id}`;
  const payment = order.paymentMethod === "COD" ? "Cash on delivery" : "Razorpay";

  const html = brandShell({
    preheader: `New order #${order.number} — ${formatINR(order.total)} from ${a.name}`,
    eyebrow: "New store order",
    title: `Order #${order.number}`,
    cta: { label: "Open in admin", href: adminUrl },
    body: `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:${ROAST};">
        <strong style="color:${INK};">${formatINR(order.total)}</strong>
        · ${esc(payment)}
        · ${esc(order.sourceChannel ?? "Direct / Website")}
      </p>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.5;color:${INK};">
        <strong>${esc(a.name)}</strong><br/>
        <a href="mailto:${esc(order.email)}" style="color:${CARAMEL};">${esc(order.email)}</a>
        · <a href="tel:${esc(order.phone)}" style="color:${CARAMEL};">${esc(order.phone)}</a>
      </p>
      ${itemsTable(order)}
      ${totalsBlock(order)}
      ${addressBlock(order)}
    `,
  });

  return sendEmail(recipients, `New order #${order.number} — ${formatINR(order.total)}`, html);
}

export async function sendShippingUpdateEmail(order: MailOrder) {
  const trackUrl = `${siteBase()}/orders/${order.id}`;
  const courier = order.courier?.trim();
  const tracking = order.trackingNumber?.trim();
  const html = brandShell({
    preheader: tracking
      ? `Order #${order.number} is on the way${courier ? ` via ${courier}` : ""}. Tracking: ${tracking}`
      : `Order #${order.number} is on the way.`,
    eyebrow: "On the way",
    title: "Your cans have shipped.",
    cta: { label: "Track your order", href: trackUrl },
    body: `
      <p style="margin:0 0 18px;font-size:16px;line-height:1.55;color:${ROAST};">
        Good news — order <strong style="color:${INK};">#${order.number}</strong> has left our kitchen shelf.
      </p>
      ${
        tracking
          ? `<div style="margin:0 0 18px;padding:16px 18px;background:${PAPER};border-radius:18px;border:1px solid ${LINE};">
               <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${CARAMEL};font-weight:700;">Tracking</p>
               <p style="margin:0;font-size:16px;color:${INK};"><strong>${esc(courier || "Courier")}</strong> · ${esc(tracking)}</p>
             </div>`
          : ""
      }
      ${itemsTable(order)}
      ${addressBlock(order)}
    `,
  });
  return sendEmail(order.email, `Being Nutty — order #${order.number} shipped`, html);
}

export async function notifyOrderPlaced(order: MailOrder) {
  const [customer, admin] = await Promise.all([sendOrderConfirmationEmail(order), sendAdminNewOrderEmail(order)]);
  return { customer, admin };
}
