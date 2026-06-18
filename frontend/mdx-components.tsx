import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

// 全局 MDX 元素 → 组件映射，统一博客正文排版（App Router 下此文件为必需）
const components: MDXComponents = {
  h1: (props) => (
    <h1 className="mt-8 mb-4 text-2xl font-semibold tracking-tight" {...props} />
  ),
  h2: (props) => (
    <h2 className="mt-8 mb-3 text-xl font-semibold tracking-tight" {...props} />
  ),
  h3: (props) => <h3 className="mt-6 mb-2 text-lg font-semibold" {...props} />,
  p: (props) => <p className="my-4 leading-7 text-foreground/90" {...props} />,
  a: ({ href = "#", ...props }: ComponentPropsWithoutRef<"a">) => (
    <Link
      href={href}
      className="font-medium text-primary underline underline-offset-4"
      {...props}
    />
  ),
  ul: (props) => <ul className="my-4 ml-6 list-disc space-y-2" {...props} />,
  ol: (props) => <ol className="my-4 ml-6 list-decimal space-y-2" {...props} />,
  li: (props) => <li className="leading-7" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="my-4 border-l-2 border-border pl-4 text-muted-foreground italic"
      {...props}
    />
  ),
  hr: (props) => <hr className="my-8 border-border" {...props} />,
  code: (props) => (
    <code
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="my-4 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm"
      {...props}
    />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
