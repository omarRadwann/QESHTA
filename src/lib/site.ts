const githubPagesUrl = "https://omarradwann.github.io/QESHTA";
const productionUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.GITHUB_PAGES === "true" ? githubPagesUrl : "https://qeshta.com");

export const siteConfig = {
  name: "QESHTA",
  legalName: "QESHTA Apparel",
  siteUrl: productionUrl,
  description:
    "QESHTA is a quiet luxury clothing house for sculpted leather, evening tailoring, and refined wardrobe essentials.",
  locale: "en_US",
  currency: "EGP",
  keywords: [
    "QESHTA",
    "QESHTA clothing",
    "luxury womenswear",
    "leather jacket",
    "tailored trousers",
    "Egypt fashion ecommerce",
    "designer clothing store",
  ],
};
