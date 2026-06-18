import type { Product, ProductCategory } from "@/types/product";
import { aicookDocs } from "@/lib/content/aicook-docs";

// 产品种子数据（来源 project/open/*；后端就绪后可替换为接口数据）
export const products: Product[] = [
  {
    slug: "mimo2codex",
    name: "mimo2codex",
    tagline: "国内大模型协议转换 · 本地代理",
    description:
      "让 OpenAI Codex CLI / 桌面版用上任意现代 LLM —— MiMo、DeepSeek、Kimi、MiniMax、SenseChat 等。本地运行的协议转换代理，数据不出本机，安全可靠。",
    category: "open",
    status: "live",
    image: "/products/mimo2codex.png",
    tags: ["LLM", "本地代理", "Codex", "Node.js"],
    highlights: [
      "本地运行，数据不出本机",
      "一处配置，多家国产模型随心切换",
      "完整复刻 Codex 使用体验",
      "MIT 开源",
    ],
    links: [
      { label: "文档站", href: "https://mimodoc.chengj.online", external: true },
      // TODO: 替换为真实仓库地址
      { label: "GitHub", href: "https://github.com/", external: true },
    ],
  },
  {
    slug: "aicook",
    name: "萝卜爱做饭",
    tagline: "拍照识别食材 · AI 推荐菜谱",
    description:
      "拍下手边的食材，AI 自动识别种类与份量，并据此为你推荐可做的菜谱。微信小程序，开源，当前处于内测阶段。",
    category: "open",
    status: "beta",
    image: "/products/aicook.png",
    tags: ["AI", "视觉识别", "菜谱", "小程序"],
    highlights: [
      "拍照即识别食材与份量",
      "基于已有食材智能推荐菜谱",
      "微信小程序，开箱即用",
      "当前内测中，欢迎申请",
    ],
    links: [
      { label: "申请内测", href: "/beta" },
      // TODO: 替换为真实仓库地址
      { label: "GitHub", href: "https://github.com/", external: true },
    ],
    // 法律条款（小程序按 /aicook/docs/<slug> 索引）
    docs: aicookDocs.map((doc) => ({
      title: doc.title,
      href: `/aicook/docs/${doc.slug}`,
    })),
  },
  {
    slug: "commercial-wip",
    name: "商业新品（筹备中）",
    tagline: "即将推出",
    description:
      "正在打磨中的商业产品，将围绕个人开发者与小团队的真实需求展开。敬请期待。",
    category: "commercial",
    status: "coming-soon",
    tags: ["商业", "筹备中"],
    highlights: ["正在设计与验证中", "上线信息将第一时间公布"],
    links: [],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter((product) => product.category === category);
}

// 首页精选：展示已上线 / 内测中的产品
export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.status !== "coming-soon");
}
