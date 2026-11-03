import { NextResponse } from "next/server";
import { getCartCatalog } from "@/lib/cart-catalog";

export const revalidate = 120;

export async function GET() {
  const catalog = await getCartCatalog();
  const { shipping: _shipping, ...rest } = catalog;
  return NextResponse.json(rest, {
    headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" },
  });
}
