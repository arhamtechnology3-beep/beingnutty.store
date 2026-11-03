import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { introBootScript } from "@/components/home/intro-boot";
import { JsonLd, organizationLd, returnPolicyLd, websiteLd } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Premium Dry Fruits in Cans | Kaju, Badam, Pista & Mixes`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  category: "food",
  creator: site.legalName,
  publisher: site.legalName,
  keywords: [
    "dry fruits online",
    "buy cashews online India",
    "California almonds",
    "pistachio kernels",
    "smoked cashews",
    "smoked almonds",
    "mix dry fruits",
    "kaju badam pista",
    "Being Nutty",
  ],
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: "/",
    images: [{ url: "/images/lifestyle/range-trio.jpg", width: 1500, height: 2000, alt: "The Being Nutty range of cashews, almonds and pistachios in clear cans" }],
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#f6efe2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${instrument.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introBootScript }} />
      </head>
      <body className="min-h-dvh bg-cream text-ink">
        <JsonLd data={[organizationLd(), returnPolicyLd(), websiteLd()]} />
        {children}
      </body>
    </html>
  );
}
