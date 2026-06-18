// 让 TypeScript 识别 `import x from "*.mdx"`：默认导出为渲染组件，
// 具名导出 metadata 对应文章 frontmatter
declare module "*.mdx" {
  import type { ComponentType } from "react";

  const MDXComponent: ComponentType;
  export default MDXComponent;

  export const metadata: {
    title: string;
    date: string;
    summary: string;
    tags?: string[];
  };
}

// 纯 Markdown 文档（无 frontmatter 导出），仅默认导出渲染组件
declare module "*.md" {
  import type { ComponentType } from "react";

  const MarkdownComponent: ComponentType;
  export default MarkdownComponent;
}
