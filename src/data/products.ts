import { siteConfig } from "@/lib/site";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  alt: string;
  category: string;
  description: string;
};

export const featuredProducts: Product[] = [
  {
    id: "araz-jacket",
    name: "Araz Sculpted Jacket",
    price: 1500,
    image: "/images/product-structured-jacket.png",
    alt: "Dark charcoal sculpted zip-front jacket on a warm off-white background",
    category: "Jackets",
    description:
      "A dark charcoal zip-front jacket with a shaped waist and refined tailoring.",
  },
  {
    id: "rose-earrings",
    name: "Moon Rose Earrings",
    price: 350,
    image: "/images/product-rose-earrings.png",
    alt: "Pair of gold rose earrings on a warm off-white background",
    category: "Accessories",
    description:
      "Polished gold rose earrings with a slim stem silhouette and sculptural shine.",
  },
];

export const selectedProducts: Product[] = [
  {
    id: "cocoa-bomber",
    name: "Cocoa Leather Bomber",
    price: 1000,
    image: "/images/product-leather-bomber.png",
    alt: "Cropped brown leather bomber jacket with belt on a warm off-white background",
    category: "Jackets",
    description:
      "Cropped brown leather bomber jacket with a soft volume sleeve and narrow belt.",
  },
  {
    id: "hera-trouser",
    name: "Hera Split Trouser",
    price: 850,
    image: "/images/product-black-trouser.png",
    alt: "Black tailored trousers with a front split detail on a warm off-white background",
    category: "Trousers",
    description:
      "High-waisted black tailored trousers with a clean front seam and split detail.",
  },
  {
    id: "araz-jacket-selected",
    name: "Araz Sculpted Jacket",
    price: 900,
    image: "/images/product-structured-jacket.png",
    alt: "Dark charcoal sculpted jacket on a warm off-white background",
    category: "Jackets",
    description:
      "Structured jacket with a zipped center line and architectural waist shaping.",
  },
  {
    id: "grape-ruched-top",
    name: "Grape Ruched Top",
    price: 650,
    image: "/images/product-ruched-top.png",
    alt: "Caramel tan ruched strapless top on a warm off-white background",
    category: "Tops",
    description:
      "A warm tan ruched strapless top with sculptural gathers and soft volume.",
  },
];

export const allProducts = [...featuredProducts, ...selectedProducts];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(price);
}

export function productSchema(product: Product) {
  return {
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    image: `${siteConfig.siteUrl}${product.image}`,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: siteConfig.currency,
      price: product.price,
      availability: "https://schema.org/InStock",
      url: siteConfig.siteUrl,
    },
  };
}
