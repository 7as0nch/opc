// 博客文章元信息，对应每篇 .mdx 顶部的 `export const metadata`
export interface PostMeta {
  // 由文件名推导
  slug: string;
  title: string;
  // ISO 日期，如 2026-06-17
  date: string;
  summary: string;
  tags?: string[];
}
