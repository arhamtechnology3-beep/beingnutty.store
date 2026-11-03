import type { Metadata } from "next";
import { ActionForm } from "@/components/action-form";
import { Field, StorePage, storeButton, storeField } from "@/components/store/fields";
import { trackOrder } from "./actions";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check the status of your Being Nutty order with your order number and the email or mobile number used at checkout.",
  alternates: { canonical: "/track-order" },
};

export default function TrackOrderPage() {
  return (
    <StorePage
      title="Track your order"
      intro="Enter your order number (from your confirmation) and the email or mobile number you used at checkout."
      width="max-w-md"
    >
      <ActionForm action={trackOrder} submitLabel="Track order" pendingLabel="Looking up…" className="space-y-5" buttonClassName={`${storeButton} w-full`} tone="store">
        <Field label="Order number">
          <input name="number" required inputMode="numeric" placeholder="e.g. 1001" className={storeField} />
        </Field>
        <Field label="Email or mobile number">
          <input name="contact" required autoComplete="email" className={storeField} />
        </Field>
      </ActionForm>
    </StorePage>
  );
}
