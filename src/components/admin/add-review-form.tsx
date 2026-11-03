"use client";

import { useActionState, useEffect, useRef } from "react";
import { addReceivedReview, importReviews } from "@/app/admin/(panel)/reviews/actions";
import { buttonClass, Card, Checkbox, Field, inputClass } from "./ui";

type ProductOption = { id: string; title: string; sizes: string[] };

export function AddReviewForm({ products }: { products: ProductOption[] }) {
  const [state, action, pending] = useActionState(addReceivedReview, null);
  const form = useRef<HTMLFormElement>(null);
  const sizes = [...new Set(products.flatMap((p) => p.sizes))];

  useEffect(() => {
    if (state?.ok) form.current?.reset();
  }, [state]);

  return (
    <Card>
      <details>
        <summary className="cursor-pointer font-semibold">Add a review a customer sent you</summary>
        <p className="mt-2 text-sm text-black/60">
          For genuine reviews received on WhatsApp, Instagram, email or in person. Use the customer&apos;s real name (first name and
          initial is fine) and their own words. It goes live straight away.
        </p>
        <form ref={form} action={action} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Product">
            <select name="productId" required className={inputClass} defaultValue="">
              <option value="" disabled>
                Choose…
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Rating">
            <select name="rating" defaultValue="5" className={inputClass}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)} ({n})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Customer name" hint="e.g. Priya S.">
            <input name="name" required className={inputClass} />
          </Field>
          <Field label="City (optional)" hint="Shown next to the name, e.g. Pune">
            <input name="location" className={inputClass} />
          </Field>
          <Field label="Customer email (optional)" hint="Not shown. If it matches a delivered order, the review is marked Verified buyer.">
            <input name="email" type="email" className={inputClass} />
          </Field>
          <Field label="Size bought (optional)">
            <input name="size" list="review-sizes" placeholder="e.g. 400g" className={inputClass} />
            <datalist id="review-sizes">
              {sizes.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field label="Date received" hint="Leave empty for today.">
            <input name="date" type="date" className={inputClass} />
          </Field>
          <div className="flex items-end pb-2.5">
            <Checkbox name="verified" label="They bought from us (show Verified buyer)" />
          </div>
          <Field label="Title (optional)" className="sm:col-span-2">
            <input name="title" className={inputClass} />
          </Field>
          <Field label="Review" className="sm:col-span-2">
            <textarea name="body" required rows={3} className={inputClass} />
          </Field>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button type="submit" disabled={pending} className={buttonClass()}>
              {pending ? "Adding…" : "Add review"}
            </button>
            {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
            {state?.ok ? <p className="text-sm text-green-700">Review added.</p> : null}
          </div>
        </form>
      </details>
    </Card>
  );
}

const COLUMNS: [string, string][] = [
  ["product_handle", "Which product — already filled in the template (see handles below). The product title works too."],
  ["rating", "1 to 5. Required."],
  ["body", "The customer's review, in their words. Required."],
  ["reviewer_name", "As they'd like it shown, e.g. Priya S. Required."],
  ["title", "Optional headline."],
  ["reviewer_email", "Optional, never shown. Matches orders for the Verified buyer badge."],
  ["location", "Optional city, e.g. Pune."],
  ["size", "Optional size bought, e.g. 400g."],
  ["review_date", "Optional. DD/MM/YYYY (14/09/2026) or 2026-09-14. Empty = today."],
  ["verified", "Optional. yes if they bought from you."],
  ["reply", "Optional public reply from Being Nutty."],
];

export function ImportReviewsForm({ products }: { products: { slug: string; title: string }[] }) {
  const [state, action, pending] = useActionState(importReviews, null);

  return (
    <Card>
      <details>
        <summary className="cursor-pointer font-semibold">Import reviews from a CSV</summary>
        <p className="mt-2 text-sm text-black/60">
          Bring over real reviews from Shopify (Judge.me, Shopify Product Reviews, Loox), Amazon seller exports or a spreadsheet. Reviews
          already imported are skipped, so it&apos;s safe to upload the same file twice.
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-black/70">
          <li>
            <a href="/admin/reviews/template" download className="font-semibold text-ink underline underline-offset-4">
              Download the template
            </a>{" "}
            — it has one row per product with the handle filled in.
          </li>
          <li>Fill in rating, body and reviewer name for each real review. Copy a row for more reviews of the same product.</li>
          <li>Rows you leave empty are ignored. Save as CSV and upload below.</li>
        </ol>

        <details className="mt-4 rounded-xl bg-black/[0.03] px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium">Column guide and product handles</summary>
          <dl className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-[10rem_1fr]">
            {COLUMNS.map(([col, help]) => (
              <div key={col} className="contents">
                <dt>
                  <code className="text-xs font-semibold">{col}</code>
                </dt>
                <dd className="text-black/60">{help}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 font-medium">Product handles</p>
          <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-[14rem_1fr]">
            {products.map((p) => (
              <div key={p.slug} className="contents">
                <dt>
                  <code className="text-xs">{p.slug}</code>
                </dt>
                <dd className="text-black/60">{p.title}</dd>
              </div>
            ))}
          </dl>
        </details>

        <form action={action} className="mt-4 flex flex-wrap items-center gap-4">
          <input name="file" type="file" accept=".csv,text/csv" required className="text-sm" />
          <Checkbox name="publish" label="Publish straight away" defaultChecked />
          <button type="submit" disabled={pending} className={buttonClass()}>
            {pending ? "Importing…" : "Import"}
          </button>
        </form>
        {state?.error ? <p className="mt-3 text-sm text-red-600">{state.error}</p> : null}
        {state && !state.error ? (
          <div className="mt-3 text-sm">
            <p className="text-green-700">
              Imported {state.imported} review{state.imported === 1 ? "" : "s"}.
              {state.skipped?.length ? ` Skipped ${state.skipped.length}:` : ""}
            </p>
            {state.skipped?.length ? (
              <ul className="mt-1 list-disc pl-5 text-black/60">
                {state.skipped.slice(0, 20).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </details>
    </Card>
  );
}
