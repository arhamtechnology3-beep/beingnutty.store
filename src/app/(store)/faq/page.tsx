import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { FaqList } from "@/components/store/faq-list";
import { storeFaqs } from "@/lib/faq-builder";
import { getShippingSettings } from "@/lib/orders";
import { faqLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ — Dry Fruits, Sizes, Delivery & Payments",
  description:
    "Answers to common questions about Being Nutty dry fruits: what we sell, pack sizes, raw vs smoked nuts, storage, delivery across India and payment options.",
  alternates: { canonical: "/faq" },
};

export const revalidate = 300;

export default async function FaqPage() {
  const faqs = storeFaqs(await getShippingSettings());
  return (
    <div className="mx-auto max-w-4xl px-5 pb-28 pt-32 md:pt-40">
      <JsonLd data={faqLd(faqs)} />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ]}
      />
      <h1 className="mt-6 font-display text-6xl font-black leading-[0.9] tracking-tight md:text-7xl">
        Frequently asked <span className="italic text-caramel">questions</span>
      </h1>
      <div className="mt-14">
        <FaqList faqs={faqs} />
      </div>
    </div>
  );
}
