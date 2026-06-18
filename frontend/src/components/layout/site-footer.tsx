import Link from "next/link";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/lib/config/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t">
      <Container className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          © {year} {siteConfig.name} · 一个人的独立软件公司
        </p>
        <nav className="flex items-center gap-4">
          {siteConfig.social.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
