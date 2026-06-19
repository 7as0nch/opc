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
  title: "chengj.online · 独立开发者",
  description:
    "我叫 chengj，这是我的个人作品站，主要有：开源工具与 AI 产品。合理使用AI，让我们共同迈入VibeCoding的时代吧！",
  // 站点对外地址，优先取环境变量，回退到默认域名
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://chengj.online",
  // 主导航
  nav: [
    { label: "首页", href: "/" },
    { label: "产品", href: "/products" },
    { label: "博客", href: "/blog" },
    { label: "关于", href: "/about" },
  ] satisfies NavItem[],
  // 社交 / 联系方式
  social: [
    { label: "GitHub", href: "https://github.com/7as0nch", external: true },
    { label: "官网", href: "https://chengj.online", external: true },
    { label: "邮箱", href: "mailto:7as0nch@gmail.com" },
  ] satisfies SocialLink[],
};

export type SiteConfig = typeof siteConfig;
