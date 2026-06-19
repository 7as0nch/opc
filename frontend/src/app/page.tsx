import { Hero } from "@/components/home/hero";
import { Stats } from "@/components/home/stats";
import { FeaturedProducts } from "@/components/home/featured-products";

// 数据统计默认隐藏；待真实数据量上来后，把 NEXT_PUBLIC_SHOW_STATS 置为 "true" 再展示。
const showStats = process.env.NEXT_PUBLIC_SHOW_STATS === "true";

export default function HomePage() {
  return (
    <>
      <Hero />
      {showStats && <Stats />}
      <FeaturedProducts />
    </>
  );
}
