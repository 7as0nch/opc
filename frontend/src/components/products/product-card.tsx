import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductStatusBadge } from "@/components/products/product-status-badge";
import SpotlightCard from "@/components/fx/spotlight-card";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  return (
    <SpotlightCard className="h-full">
      <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-md">
        <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
          {/* 封面图：有图则展示，商业占位用渐变块 */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10 text-sm text-muted-foreground">
                即将推出
              </div>
            )}
          </div>
          <CardContent className="flex flex-1 flex-col gap-2 py-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-heading text-base font-semibold">{product.name}</h3>
              <ProductStatusBadge status={product.status} />
            </div>
            <p className="text-sm text-muted-foreground">{product.tagline}</p>
            <p className="line-clamp-2 text-sm text-foreground/80">
              {product.description}
            </p>
          </CardContent>
        </Link>
        {product.tags.length > 0 && (
          <CardFooter className="flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </CardFooter>
        )}
      </Card>
    </SpotlightCard>
  );
}
