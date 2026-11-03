export const site = {
  name: "Being Nutty",
  legalName: "Arham Foods",
  tagline: "Go a little nutty.",
  description:
    "Being Nutty sells premium dry fruits packed in cans — whole kaju, badam and pista, smoked nuts and dry fruit mixes. Order online with delivery across India.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_IN",
  currency: "INR",
  country: "IN",
  email: "support@arhamfoods.co.in",
  phone: "+91 93248 09074",
  fssaiLicence: "21521053000490",
  manufacturer: "Arham Foods, Meghdoot Signature, Virar East, Palghar, Maharashtra 401305",
  address: {
    street: "Meghdoot Signature, Virar East",
    locality: "Palghar",
    region: "Maharashtra",
    postalCode: "401305",
    country: "IN",
  },
  whatsapp: "919324809074",
  dispatchDays: [1, 2],
  transitDays: [3, 7],
  social: {
    instagram: "",
    facebook: "",
    youtube: "",
  },
} as const;

export const absoluteUrl = (path = "/") => `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
