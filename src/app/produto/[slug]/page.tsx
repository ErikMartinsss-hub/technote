import type { Metadata } from "next";
import { ProductDetail } from "@/components/product/ProductDetail";
import { CustomProductDetail } from "@/components/product/CustomProductDetail";
import {
  getProductBySlug,
  getRelatedProducts,
  products,
} from "@/lib/products";
import { getRatingBreakdown, getReviews } from "@/lib/reviews";
import { formatBRL } from "@/lib/format";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Produto não encontrado" };
  }

  const lowest = product.conditions[product.conditions.length - 1];

  return {
    title: `${product.name} seminovo`,
    description: `${product.name} seminovo a partir de ${formatBRL(
      lowest.price,
    )} com garantia de 12 meses, bateria testada e entrega para todo o Brasil. Condições Excelente, Muito bom e Bom.`,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} seminovo | Tech Note`,
      description: product.description.slice(0, 180),
      images: [{ url: product.image, alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    // Slug fora do catálogo estático: resolve no cliente (produtos do admin).
    return <CustomProductDetail slug={slug} />;
  }

  const related = getRelatedProducts(product, 4);
  const reviews = getReviews(product);
  const ratingBreakdown = getRatingBreakdown(product);

  return (
    <ProductDetail
      product={product}
      related={related}
      reviews={reviews}
      ratingBreakdown={ratingBreakdown}
    />
  );
}
