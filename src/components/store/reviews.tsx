import { submitReview } from "@/app/(store)/actions";
import { ActionForm } from "@/components/action-form";
import { Honeypot } from "./contact-form";
import { Field, storeButton, storeField } from "./fields";
import { ReviewBrowser, type ReviewItem } from "./review-browser";
import { Star } from "lucide-react";

export { Stars } from "./stars";

type Review = {
  id: string;
  name: string;
  rating: number;
  title: string | null;
  body: string;
  location: string | null;
  size: string | null;
  verified: boolean;
  reply: string | null;
  createdAt: Date;
};

const day = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export function ProductReviews({ productId, productName, reviews }: { productId: string; productName: string; reviews: Review[] }) {
  const items: ReviewItem[] = reviews.map((r) => ({
    id: r.id,
    name: r.name,
    rating: r.rating,
    title: r.title,
    body: r.body,
    location: r.location,
    size: r.size,
    verified: r.verified,
    reply: r.reply,
    time: r.createdAt.getTime(),
    date: day(r.createdAt),
  }));

  const form = (
    <ActionForm
      action={submitReview.bind(null, productId)}
      submitLabel="Submit review"
      pendingLabel="Submitting…"
      resetOnSuccess
      className="space-y-4"
      buttonClassName={storeButton}
      tone="store"
    >
      <Honeypot />
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Your rating</legend>
        <div className="flex flex-row-reverse justify-end gap-1">
          {[5, 4, 3, 2, 1].map((n) => (
            <label
              key={n}
              className="peer cursor-pointer text-line transition has-[:checked]:text-caramel has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-caramel hover:text-caramel peer-hover:text-caramel peer-has-[:checked]:text-caramel"
            >
              <input type="radio" name="rating" value={n} required className="sr-only" />
              <Star className="size-8 fill-current" aria-hidden />
              <span className="sr-only">
                {n} star{n === 1 ? "" : "s"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input name="name" required autoComplete="name" placeholder="e.g. Priya S." className={storeField} />
        </Field>
        <Field label="City (optional)">
          <input name="location" autoComplete="address-level2" className={storeField} />
        </Field>
      </div>
      <Field label="Email (not published)">
        <input name="email" type="email" autoComplete="email" className={storeField} />
      </Field>
      <p className="-mt-2 text-xs text-roast">Use the email you ordered with and we&apos;ll add a Verified buyer badge.</p>
      <Field label="Title (optional)">
        <input name="title" placeholder="Sum it up in a few words" className={storeField} />
      </Field>
      <Field label="Review">
        <textarea name="body" required rows={4} placeholder={`How did you find the ${productName}?`} className={storeField} />
      </Field>
    </ActionForm>
  );

  return (
    <section id="reviews" className="mt-24 scroll-mt-28 md:mt-32" aria-labelledby="reviews-title">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-roast">Reviews</p>
      <h2 id="reviews-title" className="mt-3 scroll-mt-32 font-display text-4xl font-black tracking-tight md:text-5xl">
        What snackers say about {productName}
      </h2>
      <ReviewBrowser productName={productName} reviews={items} form={form} />
    </section>
  );
}
