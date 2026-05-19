import { siteConfig } from "@/lib/site";

export const shopCategories = [
  "View All",
  "Coats & Jackets",
  "Bottoms",
  "Tops",
  "Dresses",
  "Accessories",
  "Shoes",
] as const;

export const shopSortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price, low to high", value: "price-asc" },
  { label: "Price, high to low", value: "price-desc" },
  { label: "Newest", value: "newest" },
] as const;

export type ShopCategory = (typeof shopCategories)[number];
export type ShopSort = (typeof shopSortOptions)[number]["value"];

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  alt: string;
  category: Exclude<ShopCategory, "View All">;
  color: string;
  material: string;
  collection: string;
  description: string;
  tags: string[];
  featured?: boolean;
  isNew?: boolean;
};

export const shopProducts: Product[] = [
  {
    id: "cocoa-bomber",
    name: "Cocoa Leather Bomber",
    price: 1000,
    image: "/images/product-leather-bomber.png",
    alt: "Cropped brown leather bomber jacket with belt on a warm off-white background",
    category: "Coats & Jackets",
    color: "Cocoa",
    material: "Leather",
    collection: "Spring 26",
    description:
      "Cropped brown leather bomber jacket with a soft volume sleeve and narrow belt.",
    tags: ["jacket", "leather", "brown", "outerwear", "new"],
    featured: true,
    isNew: true,
  },
  {
    id: "hera-trouser",
    name: "Hera Split Trouser",
    price: 850,
    image: "/images/product-black-trouser.png",
    alt: "Black tailored trousers with a front split detail on a warm off-white background",
    category: "Bottoms",
    color: "Black",
    material: "Wool blend",
    collection: "Spring 26",
    description:
      "High-waisted black tailored trousers with a clean front seam and split detail.",
    tags: ["trouser", "bottom", "black", "tailoring"],
    featured: true,
  },
  {
    id: "araz-jacket",
    name: "Araz Sculpted Jacket",
    price: 1500,
    image: "/images/product-structured-jacket.png",
    alt: "Dark charcoal sculpted zip-front jacket on a warm off-white background",
    category: "Coats & Jackets",
    color: "Charcoal",
    material: "Wool blend",
    collection: "Spring 26",
    description:
      "A dark charcoal zip-front jacket with a shaped waist and refined tailoring.",
    tags: ["jacket", "charcoal", "tailoring", "structured"],
    featured: true,
  },
  {
    id: "grape-ruched-top",
    name: "Grape Ruched Top",
    price: 650,
    image: "/images/product-ruched-top.png",
    alt: "Caramel tan ruched strapless top on a warm off-white background",
    category: "Tops",
    color: "Caramel",
    material: "Silk blend",
    collection: "Spring 26",
    description:
      "A warm tan ruched strapless top with sculptural gathers and soft volume.",
    tags: ["top", "strapless", "ruched", "caramel"],
    featured: true,
  },
  {
    id: "rond-wrap-jacket",
    name: "Rond Leather Wrap Jacket",
    price: 1500,
    image: "/images/product-espresso-wrap-jacket.png",
    alt: "Dark espresso leather wrap jacket on a warm off-white background",
    category: "Coats & Jackets",
    color: "Espresso",
    material: "Leather",
    collection: "Spring 26",
    description:
      "A fitted espresso leather wrap jacket with a sharp lapel and waist tie.",
    tags: ["jacket", "leather", "espresso", "wrap"],
  },
  {
    id: "moon-ivory-slingback",
    name: "Moon Ivory Slingback",
    price: 1000,
    image: "/images/product-ivory-slingback.png",
    alt: "Ivory leather slingback heels on a warm off-white background",
    category: "Shoes",
    color: "Ivory",
    material: "Leather",
    collection: "Spring 26",
    description:
      "Ivory slingback heels with a pointed toe and slim sculptural heel.",
    tags: ["shoe", "heel", "ivory", "slingback"],
  },
  {
    id: "onyx-split-skirt",
    name: "Onyx Split Skirt",
    price: 1200,
    image: "/images/product-graphite-skirt.png",
    alt: "Graphite gray midi skirt with a front slit on a warm off-white background",
    category: "Bottoms",
    color: "Graphite",
    material: "Wool blend",
    collection: "Spring 26",
    description:
      "Graphite midi skirt with a precise front split and clean waistband.",
    tags: ["skirt", "bottom", "graphite", "tailoring"],
  },
  {
    id: "selene-ruched-dress",
    name: "Selene Ruched Dress",
    price: 2000,
    image: "/images/product-espresso-ruched-dress.png",
    alt: "Espresso brown ruched dress on a warm off-white background",
    category: "Dresses",
    color: "Espresso",
    material: "Jersey",
    collection: "Spring 26",
    description:
      "Espresso ruched dress with a high neck and sculptural gathered body.",
    tags: ["dress", "ruched", "espresso", "evening"],
  },
  {
    id: "noir-bow-bustier",
    name: "Noir Bow Bustier",
    price: 550,
    image: "/images/product-black-bow-bustier.png",
    alt: "Black sculptural bow bustier top on a warm off-white background",
    category: "Tops",
    color: "Black",
    material: "Satin",
    collection: "Spring 26",
    description:
      "Black strapless bustier with a sculptural folded bow silhouette.",
    tags: ["top", "black", "bustier", "evening"],
  },
  {
    id: "dalia-top-handle",
    name: "Dalia Top Handle Bag",
    price: 1000,
    image: "/images/product-burgundy-bag.png",
    alt: "Burgundy top-handle leather bag on a warm off-white background",
    category: "Accessories",
    color: "Burgundy",
    material: "Leather",
    collection: "Spring 26",
    description:
      "Compact burgundy leather top-handle bag with a rounded profile.",
    tags: ["bag", "accessory", "burgundy", "leather"],
  },
  {
    id: "nocturne-sculpted-dress",
    name: "Nocturne Sculpted Dress",
    price: 2500,
    image: "/images/product-black-sculpted-dress.png",
    alt: "Black sculpted sleeveless dress on a warm off-white background",
    category: "Dresses",
    color: "Black",
    material: "Taffeta",
    collection: "Spring 26",
    description:
      "Sleeveless black dress with a high neck and sculptural gathered skirt.",
    tags: ["dress", "black", "evening", "sculpted"],
    isNew: true,
  },
  {
    id: "atlas-shearling",
    name: "Atlas Shearling Jacket",
    price: 1800,
    image: "/images/product-beige-shearling-jacket.png",
    alt: "Beige oversized shearling jacket on a warm off-white background",
    category: "Coats & Jackets",
    color: "Beige",
    material: "Shearling",
    collection: "Spring 26",
    description:
      "Oversized beige shearling jacket with a soft collar and relaxed sleeve.",
    tags: ["jacket", "beige", "shearling", "outerwear"],
  },
  {
    id: "black-moon-mule",
    name: "Black Moon Mule",
    price: 1200,
    image: "/images/product-black-mule.png",
    alt: "Black leather mule heel on a warm off-white background",
    category: "Shoes",
    color: "Black",
    material: "Leather",
    collection: "Spring 26",
    description:
      "Black leather mule with a pointed toe and slim curved heel.",
    tags: ["shoe", "heel", "black", "mule"],
  },
  {
    id: "ivory-column-coat",
    name: "Ivory Column Coat",
    price: 1300,
    image: "/images/product-ivory-trench.png",
    alt: "Ivory long trench coat on a warm off-white background",
    category: "Coats & Jackets",
    color: "Ivory",
    material: "Cotton blend",
    collection: "Spring 26",
    description:
      "Long ivory coat with a high collar and soft A-line sweep.",
    tags: ["coat", "ivory", "outerwear", "trench"],
  },
  {
    id: "pearl-rose-earrings",
    name: "Pearl Rose Earrings",
    price: 450,
    image: "/images/product-pearl-rose-earrings.png",
    alt: "Silver rose pearl earrings on a warm off-white background",
    category: "Accessories",
    color: "Silver",
    material: "Pearl",
    collection: "Spring 26",
    description:
      "Silver rose-shaped earrings finished with a single pearl drop.",
    tags: ["earrings", "jewelry", "pearl", "silver"],
  },
  {
    id: "cocoa-flare-trouser",
    name: "Cocoa Flare Trouser",
    price: 950,
    image: "/images/product-chocolate-flare-trousers.png",
    alt: "Dark chocolate flared trousers on a warm off-white background",
    category: "Bottoms",
    color: "Chocolate",
    material: "Wool blend",
    collection: "Spring 26",
    description:
      "Dark chocolate high-waisted flared trousers with a clean front crease.",
    tags: ["trouser", "bottom", "chocolate", "tailoring"],
  },
];

const moonRoseEarrings: Product = {
  id: "moon-rose-earrings",
  name: "Moon Rose Earrings",
  price: 350,
  image: "/images/product-rose-earrings.png",
  alt: "Gold rose drop earrings on a warm off-white background",
  category: "Accessories",
  color: "Gold",
  material: "Gold-tone brass",
  collection: "Spring 26",
  description: "Gold-tone rose earrings with a delicate long-stem silhouette.",
  tags: ["earrings", "jewelry", "gold", "rose"],
  featured: true,
};

const featuredIds = new Set(["araz-jacket"]);
const selectedIds = ["cocoa-bomber", "hera-trouser", "araz-jacket", "grape-ruched-top"];

export const featuredProducts = [
  ...shopProducts.filter((product) => featuredIds.has(product.id)),
  moonRoseEarrings,
];

export const selectedProducts = selectedIds
  .map((id) => shopProducts.find((product) => product.id === id))
  .filter((product): product is Product => Boolean(product));

export const allProducts = [...shopProducts, moonRoseEarrings];

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
    color: product.color,
    material: product.material,
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
      url: `${siteConfig.siteUrl}/shop/`,
    },
  };
}
