import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/catalog";
import { formatINR } from "@/lib/utils";

const size = { width: 1200, height: 630 };

export const revalidate = 86400;

export async function GET(_req: Request, { params }: RouteContext<"/og/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const title = product?.title ?? "Being Nutty";
  const color = product?.accentColor ?? "#d08a3c";
  const from = product ? Math.min(...product.variants.map((v) => v.price)) : null;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#f6efe2", color: "#2a1a10", padding: 72 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: 4 }}>BEING NUTTY</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1 }}>{title}</div>
            {from ? <div style={{ fontSize: 40, marginTop: 24, color: "#6b3e1f" }}>{`From ${formatINR(from)} · Packed in cans`}</div> : null}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: 300,
            height: 440,
            alignSelf: "center",
            borderRadius: 28,
            background: color,
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 40px 60px rgba(42,26,16,0.35)",
          }}
        >
          <div style={{ display: "flex", background: "#fbf7ef", width: "100%", padding: "36px 0", justifyContent: "center", fontSize: 40, fontWeight: 900 }}>
            {title.split("—")[0].trim()}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
