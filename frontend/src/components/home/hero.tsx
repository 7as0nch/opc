import Link from "next/link";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/config/site";
import TextType from "@/components/text-type";

export function Hero() {
  return (
    <section className="border-b bg-gradient-to-b from-muted/40 to-background">
      <Container className="flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <TextType
          as="h1"
          text="欢迎来到我的独立开发站"
          className="font-heading max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl"
          typingSpeed={90}
          pauseDuration={1800}
          deletingSpeed={40}
          cursorClassName="text-primary font-normal"
        />
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
