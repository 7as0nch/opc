import fs from "node:fs";
import path from "node:path";
import type { ComponentType } from "react";
import type { PostMeta } from "@/types/blog";

// 博客文章目录（项目内 .mdx 文件，构建期静态读取）
const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

// MDX 顶部 `export const metadata` 的结构（不含 slug，slug 由文件名推导）
type RawMeta = Omit<PostMeta, "slug">;

// 读取所有文章 slug（按文件名，去掉 .mdx 后缀）
export function getPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

// 动态导入某篇文章模块：default 为渲染组件，metadata 为 frontmatter
async function importPost(
  slug: string
): Promise<{ default: ComponentType; metadata: RawMeta }> {
  return import(`../../content/blog/${slug}.mdx`);
}

// 获取单篇文章：元信息 + 正文组件；slug 不存在时返回 null
export async function getPost(
  slug: string
): Promise<{ meta: PostMeta; Content: ComponentType } | null> {
  if (!getPostSlugs().includes(slug)) return null;
  const mod = await importPost(slug);
  return { meta: { slug, ...mod.metadata }, Content: mod.default };
}

// 获取全部文章元信息，按日期倒序
export async function getAllPostsMeta(): Promise<PostMeta[]> {
  const slugs = getPostSlugs();
  const metas = await Promise.all(
    slugs.map(async (slug) => {
      const mod = await importPost(slug);
      return { slug, ...mod.metadata } satisfies PostMeta;
    })
  );
  return metas.sort((a, b) => (a.date < b.date ? 1 : -1));
}
