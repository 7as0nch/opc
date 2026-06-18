import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { getPost, getPostSlugs } from "@/lib/content/blog";

// 仅静态预渲染已有文章，未知 slug 直接 404
export const dynamicParams = false;

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.summary,
    openGraph: {
      title: post.meta.title,
      description: post.meta.summary,
      type: "article",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const { meta, Content } = post;

  return (
    <Container className="py-12">
      <article className="mx-auto flex max-w-2xl flex-col gap-4">
        <Link
          href="/blog"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← 返回博客
        </Link>
        <header className="flex flex-col gap-3 border-b pb-6">
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            {meta.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <time dateTime={meta.date}>{meta.date}</time>
            {meta.tags?.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </header>
        <div className="text-base">
          <Content />
        </div>
      </article>
    </Container>
  );
}
