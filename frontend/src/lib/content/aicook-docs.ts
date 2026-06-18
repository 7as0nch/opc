import type { ComponentType } from "react";

// AICook（萝卜爱做饭）法律/合规文档注册表。
// 源文件位于 src/content/aicook/<slug>.md；页面路由 /aicook/docs/<slug>，
// 供小程序按稳定地址索引。新增文档：放入 md 文件并在此登记一条。
export interface AicookDoc {
  slug: string;
  title: string;
  description: string;
}

export const aicookDocs: AicookDoc[] = [
  {
    slug: "user-agreement",
    title: "用户协议",
    description: "萝卜爱做饭用户协议",
  },
  {
    slug: "privacy-policy",
    title: "隐私政策",
    description: "萝卜爱做饭隐私政策",
  },
  {
    slug: "medical-nutrition-disclaimer",
    title: "医疗与营养免责声明",
    description: "萝卜爱做饭医疗与营养免责声明",
  },
];

export function getAicookDoc(slug: string): AicookDoc | undefined {
  return aicookDocs.find((doc) => doc.slug === slug);
}

// 动态导入对应 Markdown 的渲染组件（构建期由 @next/mdx 编译 .md）
export async function getAicookDocComponent(
  slug: string
): Promise<ComponentType | null> {
  if (!getAicookDoc(slug)) return null;
  const mod = await import(`../../content/aicook/${slug}.md`);
  return mod.default;
}
