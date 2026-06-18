"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config/site";
import { Container } from "@/components/layout/container";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUIStore } from "@/lib/store/ui";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const pathname = usePathname();
  const mobileNavOpen = useUIStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";
  // 仅首页有深色英雄区：滚过大半英雄区前，header 透明叠加 + 亮色文字
  const transparent = isHome && !scrolled;

  useEffect(() => {
    // 非首页无需透明叠加（transparent 已含 isHome 判断），不挂监听
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        transparent
          ? "bg-transparent text-neutral-50"
          : "border-b bg-background/80 text-foreground backdrop-blur"
      )}
    >
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link href="/" className="font-heading text-base font-semibold">
          {siteConfig.name}
        </Link>

        {/* 桌面导航 */}
        <nav className="hidden items-center gap-1 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                transparent && "text-neutral-200 hover:bg-white/10 hover:text-white",
                isActive(item.href) &&
                  (transparent ? "bg-white/15 text-white" : "bg-muted text-foreground")
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/beta"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "hidden sm:inline-flex",
              transparent && "bg-white text-neutral-900 hover:bg-white/90"
            )}
          >
            申请内测
          </Link>
          <ThemeToggle />
          {/* 移动端菜单按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="打开菜单"
            onClick={() => setMobileNavOpen(true)}
          >
            <MenuIcon />
          </Button>
        </div>
      </Container>

      {/* 移动端抽屉导航（受 Zustand 控制） */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="right" className="w-72 gap-0">
          <SheetHeader>
            <SheetTitle>{siteConfig.name}</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-4">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "justify-start",
                  isActive(item.href) && "bg-muted text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/beta"
              onClick={() => setMobileNavOpen(false)}
              className={cn(buttonVariants({ variant: "default" }), "mt-2 justify-start")}
            >
              申请内测
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
