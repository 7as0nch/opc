import { Badge } from "@/components/ui/badge";
import type { ProductStatus } from "@/types/product";

// 产品状态 → 文案 + 徽章样式映射
const STATUS_MAP: Record<
  ProductStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  live: { label: "已上线", variant: "default" },
  beta: { label: "内测中", variant: "secondary" },
  "coming-soon": { label: "即将推出", variant: "outline" },
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const { label, variant } = STATUS_MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
