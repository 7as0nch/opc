import Link from "next/link";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-6 py-32 text-center">
      <p className="font-heading text-6xl font-bold">404</p>
      <h1 className="text-xl font-semibold">页面走丢了</h1>
      <p className="text-muted-foreground">你访问的页面不存在或已被移动。</p>
      <Link href="/" className={buttonVariants({ variant: "default" })}>
        返回首页
      </Link>
    </Container>
  );
}
