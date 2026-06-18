import { ProductCard } from "@/components/products/product-card";
import AnimatedContent from "@/components/fx/animated-content";
import type { Product } from "@/types/product";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <AnimatedContent
          key={product.slug}
          delay={index * 0.08}
          className="h-full"
        >
          <ProductCard product={product} />
        </AnimatedContent>
      ))}
    </div>
  );
}
