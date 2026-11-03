"use client";

import Link from "next/link";
import { Heart, X } from "lucide-react";
import { storeButton } from "@/components/store/fields";
import { ProductStage } from "@/components/store/product-stage";
import { cart } from "@/lib/cart-store";
import { useWishlist, wishlistStore } from "@/lib/local-store";
import { formatINR } from "@/lib/utils";

export function WishlistView() {
  const items = useWishlist();

  if (!items.length) {
    return (
      <div className="rounded-[2rem] bg-paper p-12 text-center">
        <Heart className="mx-auto size-10 text-caramel" aria-hidden />
        <p className="mt-4 font-display text-3xl font-bold">Nothing saved yet.</p>
        <p className="mt-2 text-roast">Tap the heart on any product to keep it here.</p>
        <Link href="/collections/dry-fruits" className={`${storeButton} mt-6`}>
          Browse the range
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {items.map((item) => (
        <li
          key={item.slug}
          className="group relative flex flex-col rounded-[1.75rem] bg-paper p-1.5 ring-1 ring-line transition duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(42,26,16,0.45)] sm:p-2"
        >
          <Link href={`/products/${item.slug}`} className="block">
            <ProductStage
              slug={item.slug}
              label={item.title.split("—")[0].trim()}
              accentColor={item.accentColor}
              image={item.image ? { url: item.image, alt: item.title } : null}
              sizes="(min-width: 1024px) 22vw, 45vw"
              className="aspect-[4/5] rounded-[1.4rem]"
            />
            <p className="mt-3 line-clamp-1 px-1.5 font-semibold hover:text-roast sm:px-2.5">{item.title}</p>
          </Link>
          <p className="mb-3 mt-0.5 px-1.5 text-sm text-roast sm:px-2.5">
            {item.variantTitle} · <span className="font-semibold text-ink">{formatINR(item.price)}</span>
          </p>
          <button
            type="button"
            onClick={() => {
              cart.add({
                variantId: item.variantId,
                slug: item.slug,
                title: item.title,
                variantTitle: item.variantTitle,
                price: item.price,
                accentColor: item.accentColor,
                image: item.image,
              });
            }}
            className="mt-auto w-full rounded-full bg-ink py-3 text-sm font-semibold text-paper transition-colors hover:bg-roast"
          >
            Add to cart
          </button>
          <button
            type="button"
            onClick={() => wishlistStore.remove(item.slug)}
            className="absolute right-3 top-3 grid size-9 sm:right-4 sm:top-4 sm:size-10 place-items-center rounded-full bg-paper/90 shadow-sm backdrop-blur"
            aria-label={`Remove ${item.title} from wishlist`}
          >
            <X className="size-5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
