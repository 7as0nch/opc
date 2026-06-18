import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/blog/post-card";
import { getAllPostsMeta } from "@/lib/content/blog";

export const metadata: Metadata = {
  title: "博客",
  description: "技术笔记、产品动态与更新公告。",
};

export default async function BlogPage() {
  const posts = await getAllPostsMeta();

  return (
    <Container className="flex flex-col gap-8 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          博客 / 动态
        </h1>
        <p className="text-muted-foreground">技术笔记、产品更新与公告。</p>
      </header>

      {posts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">还没有文章，敬请期待。</p>
      )}
    </Container>
  );
}
