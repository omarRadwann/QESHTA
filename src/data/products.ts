import { siteConfig } from "@/lib/site";
import { siteAssetUrl } from "@/lib/assets";

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

export const productSizes = ["XS", "S", "M", "L", "XL"] as const;

export type ProductSize = (typeof productSizes)[number];

export type ProductDetailTab = {
  id: "description" | "size-fit" | "material" | "care";
  label: string;
  body: string;
};

export type ProductVariant = {
  id: string;
  label: string;
  color: string;
  image: string;
  detailHeroImage?: string;
  detailHeroAlt?: string;
  thumbnail?: string;
};

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
  detailHeroImage?: string;
  detailHeroAlt?: string;
  detailTabs?: ProductDetailTab[];
  fitNote?: string;
  variants?: ProductVariant[];
};

export const shopProducts: Product[] = [
  {
    id: "cocoa-bomber",
    name: "Cocoa Leather Bomber",
    price: 1000,
    image: "/images/product-leather-bomber.jpg",
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
    image: "/images/product-black-trouser.jpg",
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
    image: "/images/product-structured-jacket.jpg",
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
    image: "/images/product-ruched-top.jpg",
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
    id: "ansel-opulent-leather-jacket",
    name: "Ansel Opulent Leather Jacket",
    price: 1500,
    image: "/images/product-espresso-wrap-jacket.jpg",
    alt: "Dark espresso leather wrap jacket on a warm off-white background",
    category: "Coats & Jackets",
    color: "Espresso",
    material: "Leather",
    collection: "Spring 26",
    description:
      "A fitted espresso leather wrap jacket with a sharp lapel and waist tie.",
    tags: ["jacket", "leather", "espresso", "wrap", "new"],
    isNew: true,
    detailHeroImage: "/images/product-detail-leather-jacket-chair.jpg",
    detailHeroAlt:
      "Model wearing an espresso leather wrap jacket while seated in a black leather lounge chair",
    detailTabs: [
      {
        id: "description",
        label: "Description",
        body:
          "A lustrous leather jacket cut with sculptural grace and a sharply wrapped waist. The lapel sits clean and the body is shaped for a close, confident fit.",
      },
      {
        id: "size-fit",
        label: "Size & Fit",
        body:
          "True to size. Recommended to take your normal size. Model is 178 / 5'8 and is wearing a size 36.",
      },
      {
        id: "material",
        label: "Material",
        body:
          "Smooth espresso leather with a soft lining, structured collar, and concealed interior finishing.",
      },
      {
        id: "care",
        label: "Care",
        body:
          "Specialist leather clean only. Hang on a shaped hanger and avoid moisture, heat, and direct sunlight.",
      },
    ],
  },
  {
    id: "moon-ivory-slingback",
    name: "Moon Ivory Slingback",
    price: 1000,
    image: "/images/product-ivory-slingback.jpg",
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
    id: "ansel-opulent-skirt",
    name: "Ansel Opulent Leather Skirt",
    price: 1000,
    image: "/images/product-skirt-burgundy.jpg",
    alt: "Burgundy opulent leather skirt with a sculptural flared shape on a warm off-white background",
    category: "Bottoms",
    color: "Burgundy",
    material: "Suede leather",
    collection: "Spring 26",
    description:
      "A lustrous suede skirt cut with sculptural grace and dramatic flare.",
    tags: ["skirt", "bottom", "burgundy", "leather", "suede", "new"],
    isNew: true,
    detailHeroImage: "/images/product-detail-skirt-chair.jpg",
    detailHeroAlt:
      "Burgundy suede leather skirt draped over a black tubular chair in a clean studio",
    detailTabs: [
      {
        id: "description",
        label: "Description",
        body:
          "A lustrous suede skirt cut with sculptural grace and dramatic flare. Sits high on the waist with paneled seams that curve, release, and move.",
      },
      {
        id: "size-fit",
        label: "Size & Fit",
        body:
          "True to size. Recommended to take your normal size. Model is 178 / 5'8 and is wearing a size 36.",
      },
      {
        id: "material",
        label: "Material",
        body:
          "Soft suede leather with a paneled interior construction and a hidden side zip for a clean line.",
      },
      {
        id: "care",
        label: "Care",
        body:
          "Specialist leather clean only. Store on a padded hanger away from direct sunlight and moisture.",
      },
    ],
    variants: [
      {
        id: "burgundy",
        label: "Burgundy",
        color: "#4b1719",
        image: "/images/product-skirt-burgundy.jpg",
        detailHeroImage: "/images/product-detail-skirt-chair.jpg",
        detailHeroAlt:
          "Burgundy suede leather skirt draped over a black tubular chair in a clean studio",
      },
      {
        id: "caramel",
        label: "Caramel",
        color: "#a86735",
        image: "/images/product-skirt-caramel.jpg",
        detailHeroImage: "/images/product-detail-skirt-chair-caramel.jpg",
        detailHeroAlt:
          "Caramel suede leather skirt draped over a black tubular chair in a clean studio",
      },
      {
        id: "black",
        label: "Black",
        color: "#111111",
        image: "/images/product-skirt-black.jpg",
        detailHeroImage: "/images/product-detail-skirt-chair-black.jpg",
        detailHeroAlt:
          "Black suede leather skirt draped over a black tubular chair in a clean studio",
      },
      {
        id: "navy",
        label: "Navy",
        color: "#171b3d",
        image: "/images/product-skirt-navy.jpg",
        detailHeroImage: "/images/product-detail-skirt-chair-navy.jpg",
        detailHeroAlt:
          "Navy suede leather skirt draped over a black tubular chair in a clean studio",
      },
    ],
  },
  {
    id: "selene-ruched-dress",
    name: "Selene Ruched Dress",
    price: 2000,
    image: "/images/product-espresso-ruched-dress.jpg",
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
    image: "/images/product-black-bow-bustier.jpg",
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
    image: "/images/product-burgundy-bag.jpg",
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
    image: "/images/product-black-sculpted-dress.jpg",
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
    image: "/images/product-beige-shearling-jacket.jpg",
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
    image: "/images/product-black-mule.jpg",
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
    image: "/images/product-ivory-trench.jpg",
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
    image: "/images/product-pearl-rose-earrings.jpg",
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
    image: "/images/product-chocolate-flare-trousers.jpg",
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
  image: "/images/product-rose-earrings.jpg",
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

export function getProductUrl(product: Product) {
  return `/shop/${product.id}/`;
}

export function getProductById(id: string) {
  return allProducts.find((product) => product.id === id);
}

export function getProductTabs(product: Product): ProductDetailTab[] {
  return (
    product.detailTabs ?? [
      {
        id: "description",
        label: "Description",
        body: product.description,
      },
      {
        id: "size-fit",
        label: "Size & Fit",
        body:
          product.fitNote ??
          "True to size. Recommended to take your normal size. Model is 178 / 5'8 and is wearing a size 36.",
      },
      {
        id: "material",
        label: "Material",
        body: `${product.material} selected for structure, comfort, and a refined hand feel.`,
      },
      {
        id: "care",
        label: "Care",
        body:
          "Dry clean by a specialist. Store carefully between wears and avoid prolonged direct sunlight.",
      },
    ]
  );
}

export function productSchema(product: Product) {
  return {
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    color: product.color,
    material: product.material,
    image: siteAssetUrl(product.image),
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: siteConfig.currency,
      price: product.price,
      availability: "https://schema.org/InStock",
      url: `${siteConfig.siteUrl}${getProductUrl(product)}`,
    },
  };
}
