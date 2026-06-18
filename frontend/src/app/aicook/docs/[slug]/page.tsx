import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import {
  aicookDocs,
  getAicookDoc,
  getAicookDocComponent,
} from "@/lib/content/aicook-docs";

// 仅静态预渲染已登记文档，未知 slug 直接 404
export const dynamicParams = false;

export function generateStaticParams() {
  return aicookDocs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getAicookDoc(slug);
  if (!doc) return {};
  return {
    title: `${doc.title} · 萝卜爱做饭`,
    description: doc.description,
  };
}

export default async function AicookDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getAicookDoc(slug);
  const Content = await getAicookDocComponent(slug);
  if (!doc || !Content) notFound();

  return (
    <Container className="py-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Link
          href="/products/aicook"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← 返回 萝卜爱做饭
        </Link>

        {/* Markdown 正文（经 mdx-components 统一排版） */}
        <article className="text-base">
          <Content />
        </article>

        {/* 同类文档快捷切换 */}
        <nav className="flex flex-wrap gap-x-5 gap-y-2 border-t pt-6 text-sm">
          {aicookDocs
            .filter((d) => d.slug !== slug)
            .map((d) => (
              <Link
                key={d.slug}
                href={`/aicook/docs/${d.slug}`}
                className="text-primary underline underline-offset-4"
              >
                {d.title}
              </Link>
            ))}
        </nav>
      </div>
    </Container>
  );
}
