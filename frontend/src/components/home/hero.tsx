import Link from "next/link";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/lib/config/site";
import TextType from "@/components/text-type";
import LightRays from "@/components/backgrounds/light-rays";
import BorderGlow from "@/components/fx/border-glow";

export function Hero() {
  return (
    <section className="relative isolate -mt-14 flex min-h-[100svh] items-center justify-center overflow-hidden border-b bg-neutral-950 text-neutral-50">
      {/* 背景：Light Rays 光束（深色底才出彩） */}
      <div className="pointer-events-none absolute inset-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#8ab4ff"
          raysSpeed={1.1}
          lightSpread={0.9}
          rayLength={1.4}
          followMouse
          mouseInfluence={0.08}
          className="h-full w-full"
        />
      </div>

      <Container className="relative z-10 flex flex-col items-center gap-7 py-20 text-center">
        <TextType
          as="h1"
          text="欢迎来到我的独立开发站"
          className="font-heading max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl"
          typingSpeed={90}
          pauseDuration={1800}
          deletingSpeed={40}
          cursorClassName="text-sky-300 font-normal"
        />
        <p className="max-w-xl text-base text-neutral-300 sm:text-lg">
          {siteConfig.description}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-5 pt-2">
          {/* 查看产品：站内平滑滚动到下方产品区 */}
          <BorderGlow
            backgroundColor="#3f3f46"
            borderRadius={16}
            glowColor="214 90 72"
            glowRadius={28}
            glowIntensity={1.4}
            edgeSensitivity={22}
            coneSpread={22}
            colors={["#60a5fa", "#a78bfa", "#38bdf8"]}
          >
            <a
              href="#products"
              className="flex items-center justify-center px-9 py-4 text-base font-semibold text-white sm:text-lg"
            >
              查看产品
            </a>
          </BorderGlow>

          {/* 阅读博客：跳转博客页 */}
          <BorderGlow
            backgroundColor="#1c2030"
            borderRadius={16}
            glowColor="280 85 75"
            glowRadius={28}
            coneSpread={22}
            colors={["#a78bfa", "#f472b6", "#60a5fa"]}
          >
            <Link
              href="/blog"
              className="flex items-center justify-center px-9 py-4 text-base font-medium text-white sm:text-lg"
            >
              阅读博客
            </Link>
          </BorderGlow>
        </div>
      </Container>
    </section>
  );
}
