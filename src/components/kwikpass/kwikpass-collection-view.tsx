"use client";

import { useEffect } from "react";
import { absoluteUrl } from "@/lib/site";
import { trackKwikPassCollection } from "./kwikpass-pageviews";

export function KwikPassCollectionView({
  collectionId,
  name,
  imageUrl,
  handle,
}: {
  collectionId: string;
  name: string;
  imageUrl?: string | null;
  handle: string;
}) {
  useEffect(() => {
    trackKwikPassCollection({
      collection_id: collectionId,
      name,
      image_url: imageUrl ? (imageUrl.startsWith("http") ? imageUrl : absoluteUrl(imageUrl)) : undefined,
      handle,
    });
  }, [collectionId, name, imageUrl, handle]);

  return null;
}
