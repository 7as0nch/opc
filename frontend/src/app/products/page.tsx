import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ProductGrid } from "@/components/products/product-grid";
import { getProductsByCategory } from "@/lib/content/products";

export const metadata: Metadata = {
  title: "产品",
  description: "chengj.online 的开源工具与产品一览。",
};

export default function ProductsPage() {
  const open = getProductsByCategory("open");
  const commercial = getProductsByCategory("commercial");

  return (
    <Container className="flex flex-col gap-12 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight">产品</h1>
        <p className="text-muted-foreground">开源优先的工具与正在筹备的产品。</p>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="font-heading text-xl font-semibold">开源项目</h2>
        <ProductGrid products={open} />
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="font-heading text-xl font-semibold">其他产品</h2>
        {commercial.length > 0 ? (
          <ProductGrid products={commercial} />
        ) : (
          <p className="text-sm text-muted-foreground">敬请期待。</p>
        )}
      </section>
    </Container>
  );
}
