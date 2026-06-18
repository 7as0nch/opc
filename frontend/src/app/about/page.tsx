import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 chengj.online 与联系方式。",
};

export default function AboutPage() {
  return (
    <Container className="py-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-bold tracking-tight">关于</h1>
          <p className="text-muted-foreground">一个人的独立软件公司。</p>
        </header>

        <section className="flex flex-col gap-4 leading-7 text-foreground/90">
          <p>
            你好，我是 chengj，一名独立开发者。chengj.online 是我的个人作品站，
            用来沉淀我做的开源工具与 AI 产品。
          </p>
          <p>
            目前的方向：用 AI 把日常里琐碎、重复的事变简单 —— 无论是让国产大模型无缝接入既有开发工具的{" "}
            <Link
              href="/products/mimo2codex"
              className="font-medium text-primary underline underline-offset-4"
            >
              mimo2codex
            </Link>
            ，还是拍张照就能推荐菜谱的{" "}
            <Link
              href="/products/aicook"
              className="font-medium text-primary underline underline-offset-4"
            >
              萝卜爱做饭
            </Link>
            。
          </p>
        </section>

        <Separator />

        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-semibold">技术栈</h2>
          <p className="text-sm text-muted-foreground">
            Go · Kratos · GORM · PostgreSQL · Eino · React · Next.js · TypeScript
          </p>
        </section>

        <Separator />

        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-semibold">联系</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {siteConfig.social.map((item) => (
              <li key={item.label}>
                <span className="text-muted-foreground">{item.label}：</span>
                <Link
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="font-medium text-primary underline underline-offset-4"
                >
                  {item.href.replace(/^mailto:/, "")}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            想体验内测中的 萝卜爱做饭？前往{" "}
            <Link
              href="/beta"
              className="font-medium text-primary underline underline-offset-4"
            >
              内测申请
            </Link>
            。
          </p>
        </section>
      </div>
    </Container>
  );
}
