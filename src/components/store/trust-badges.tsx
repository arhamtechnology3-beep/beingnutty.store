import { BadgeCheck, Banknote, PackageCheck, ShieldCheck } from "lucide-react";

export function TrustBadges({ codEnabled }: { codEnabled: boolean }) {
  const badges = [
    { icon: ShieldCheck, title: "Secure payments", text: "UPI, cards & netbanking via Razorpay" },
    ...(codEnabled ? [{ icon: Banknote, title: "Cash on delivery", text: "Pay when it arrives" }] : []),
    { icon: PackageCheck, title: "Sealed fresh can", text: "Air-tight, reusable, no crushed nuts" },
    { icon: BadgeCheck, title: "FSSAI licensed", text: "Packed hygienically in India" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-3">
      {badges.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex items-start gap-3 rounded-2xl border border-line px-3.5 py-3">
          <Icon className="mt-0.5 size-5 shrink-0 text-pista" aria-hidden />
          <span className="min-w-0">
            <span className="block text-sm font-semibold">{title}</span>
            <span className="block text-xs leading-snug text-roast">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
