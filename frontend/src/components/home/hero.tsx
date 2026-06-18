import Link from "next/link";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/config/site";

export function Hero() {
  return (
    <section className="border-b bg-gradient-to-b from-muted/40 to-background">
      <Container className="flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
          独立开发 · 开源优先
        </span>
        <h1 className="font-heading max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          一个人的独立软件公司
        </h1>
        <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
          {siteConfig.description}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/products" className={buttonVariants({ size: "lg" })}>
            查看产品
          </Link>
          <Link
            href="/blog"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            阅读博客
          </Link>
        </div>
      </Container>
    </section>
  );
}
