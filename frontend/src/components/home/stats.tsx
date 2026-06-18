import { Container } from "@/components/layout/container";
import AnimatedContent from "@/components/fx/animated-content";
import CountUp from "@/components/fx/count-up";

// 首页数据统计（副页区，滚动入场 + 数字累加）。数值暂写死，后续接后端。
const stats = [
  { to: 3, suffix: "+", label: "项目数" },
  { to: 19, suffix: "K+", label: "累计活跃度" },
];

export function Stats() {
  return (
    <section className="border-b bg-muted/30 py-20">
      <Container>
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-8 sm:gap-16">
          {stats.map((stat, index) => (
            <AnimatedContent
              key={stat.label}
              delay={index * 0.1}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
                <CountUp to={stat.to} suffix={stat.suffix} />
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </AnimatedContent>
          ))}
        </div>
      </Container>
    </section>
  );
}
