// 产品分类：开源项目 / 商业产品
export type ProductCategory = "open" | "commercial";

// 产品状态：已上线 / 内测中 / 即将推出
export type ProductStatus = "live" | "beta" | "coming-soon";

// 产品上的行动入口（站内路由或外链）
export interface ProductLink {
  label: string;
  href: string;
  // 是否外链（决定 target/rel）
  external?: boolean;
}

export interface Product {
  // URL 友好的唯一标识，用作 /products/[slug]
  slug: string;
  name: string;
  // 一句话副标题
  tagline: string;
  // 详情描述
  description: string;
  category: ProductCategory;
  status: ProductStatus;
  // 展示图，置于 public/products/ 下；商业占位产品可缺省
  image?: string;
  // 关键词标签
  tags: string[];
  // 卖点列表
  highlights: string[];
  links: ProductLink[];
}
