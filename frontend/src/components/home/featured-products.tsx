import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ProductGrid } from "@/components/products/product-grid";
import { getFeaturedProducts } from "@/lib/content/products";
import { buttonVariants } from "@/components/ui/button";

export function FeaturedProducts() {
  const products = getFeaturedProducts();

  return (
    <section className="py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              精选产品
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              正在维护与迭代的开源工具与 AI 产品
            </p>
          </div>
          <Link
            href="/products"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            全部产品
          </Link>
        </div>
        <ProductGrid products={products} />
      </Container>
    </section>
  );
}
