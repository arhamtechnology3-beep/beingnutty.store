import { submitContact } from "@/app/(store)/actions";
import { ActionForm } from "@/components/action-form";
import { Field, storeButton, storeField } from "./fields";

export function Honeypot() {
  return (
    <label className="hidden" aria-hidden>
      Website
      <input name="website" tabIndex={-1} autoComplete="off" />
    </label>
  );
}

export function ContactForm() {
  return (
    <section aria-labelledby="contact-form-title" className="mt-14 rounded-[2rem] bg-paper p-6 md:p-10">
      <h2 id="contact-form-title" className="font-display text-3xl font-bold">
        Send us a message
      </h2>
      <ActionForm action={submitContact} submitLabel="Send message" pendingLabel="Sending…" resetOnSuccess className="mt-6 space-y-4" buttonClassName={storeButton} tone="store">
        <Honeypot />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input name="name" required autoComplete="name" className={storeField} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" required autoComplete="email" className={storeField} />
          </Field>
        </div>
        <Field label="Mobile number (optional)">
          <input name="phone" type="tel" autoComplete="tel-national" className={storeField} />
        </Field>
        <Field label="Message" hint="Include your order number if your question is about an order.">
          <textarea name="message" required rows={5} className={storeField} />
        </Field>
      </ActionForm>
    </section>
  );
}
