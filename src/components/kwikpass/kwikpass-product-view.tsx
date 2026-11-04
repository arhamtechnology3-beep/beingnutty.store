"use client";

import { useEffect } from "react";
import { absoluteUrl } from "@/lib/site";
import { trackKwikPassProduct } from "./kwikpass-pageviews";

export function KwikPassProductView({
  productId,
  variantId,
  imageUrl,
  name,
  price,
  handle,
}: {
  productId: string;
  variantId?: string;
  imageUrl: string | null;
  name: string;
  price: number;
  handle: string;
}) {
  useEffect(() => {
    trackKwikPassProduct({
      product_id: productId,
      variant_id: variantId,
      image_url: imageUrl?.startsWith("http") ? imageUrl : absoluteUrl(imageUrl || "/brand/mascot.png"),
      name,
      price: price / 100,
      handle,
    });
  }, [productId, variantId, imageUrl, name, price, handle]);

  return null;
}
