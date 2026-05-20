import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ProductDetail } from "@/components/product-detail";
import { SiteHeader } from "@/components/site-header";
import {
  allProducts,
  getProductById,
  getProductUrl,
  productSchema,
  shopProducts,
} from "@/data/products";
import { siteConfig } from "@/lib/site";
import styles from "./page.module.css";

type ProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return allProducts.map((product) => ({
    productId: product.id,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = getProductById(productId);

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  const productUrl = getProductUrl(product);

  return {
    title: product.name,
    description: `${product.description} Shop ${product.name} from QESHTA ${product.collection}.`,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.name} | QESHTA`,
      description: product.description,
      url: `${siteConfig.siteUrl}${productUrl}`,
      siteName: siteConfig.name,
      images: [
        {
          url: product.detailHeroImage ?? product.image,
          width: 1200,
          height: 1600,
          alt: product.detailHeroAlt ?? product.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | QESHTA`,
      description: product.description,
      images: [product.detailHeroImage ?? product.image],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  const product = getProductById(productId);

  if (!product) {
    notFound();
  }

  const productIndex = shopProducts.findIndex((item) => item.id === product.id);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteConfig.siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Shop",
          item: `${siteConfig.siteUrl}/shop/`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: product.name,
          item: `${siteConfig.siteUrl}${getProductUrl(product)}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      ...productSchema(product),
      sku: product.id,
      position: productIndex >= 0 ? productIndex + 1 : undefined,
    },
  ];

  return (
    <main className={styles.page}>
      <JsonLd data={structuredData} />
      <div className={styles.surface}>
        <SiteHeader variant="light" />
        <ProductDetail product={product} />
      </div>
    </main>
  );
}
