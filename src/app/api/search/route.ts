import { searchProducts, shortTitle } from "@/lib/catalog";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  const products = q ? await searchProducts(q, 6) : [];
  return Response.json(
    {
      results: products.map((p) => ({
        slug: p.slug,
        title: p.title,
        name: shortTitle(p.title),
        image: p.images[0]?.url ?? null,
        accentColor: p.accentColor ?? "#d08a3c",
        price: Math.min(...p.variants.map((v) => v.price)),
      })),
    },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } },
  );
}
