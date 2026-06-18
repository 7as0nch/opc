// 站点级元信息：被 Header / Footer / SEO metadata / sitemap 复用，避免硬编码散落

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  external?: boolean;
}

export const siteConfig = {
  name: "chengj.online",
  title: "chengj.online · 一个人的独立软件公司",
  description:
    "独立开发者 chengj 的个人作品站：开源工具与 AI 产品。mimo2codex 让 Codex 用上国内大模型，AICook 拍照识别食材推荐菜谱。",
  // 站点对外地址，优先取环境变量，回退到默认域名
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://chengj.online",
  // 主导航
  nav: [
    { label: "首页", href: "/" },
    { label: "产品", href: "/products" },
    { label: "博客", href: "/blog" },
    { label: "关于", href: "/about" },
  ] satisfies NavItem[],
  // 社交 / 联系方式 —— TODO: 替换为真实地址
  social: [
    { label: "GitHub", href: "https://github.com/", external: true },
    { label: "官网", href: "https://chengj.online", external: true },
    { label: "邮箱", href: "mailto:hello@chengj.online" },
  ] satisfies SocialLink[],
};

export type SiteConfig = typeof siteConfig;
