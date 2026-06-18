import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ProductStatusBadge } from "@/components/products/product-status-badge";
import { products, getProductBySlug } from "@/lib/content/products";
import { cn } from "@/lib/utils";

// 仅静态预渲染已知产品，未知 slug 直接 404
export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.tagline,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <Container className="flex flex-col gap-10 py-12">
      <Link
        href="/products"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← 返回产品列表
      </Link>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* 封面 */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border bg-muted">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              即将推出
            </div>
          )}
        </div>

        {/* 详情 */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            <ProductStatusBadge status={product.status} />
          </div>
          <p className="text-lg text-muted-foreground">{product.tagline}</p>
          <p className="leading-7 text-foreground/90">{product.description}</p>

          <ul className="flex flex-col gap-2">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {product.links.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {product.links.map((link, index) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className={cn(
                    buttonVariants({ variant: index === 0 ? "default" : "outline" })
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {product.docs && product.docs.length > 0 && (
            <div className="flex flex-col gap-2 border-t pt-5">
              <h2 className="text-sm font-semibold text-muted-foreground">
                相关条款与文档
              </h2>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {product.docs.map((doc) => (
                  <li key={doc.href}>
                    <Link
                      href={doc.href}
                      className="text-primary underline underline-offset-4"
                    >
                      {doc.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
