import { Hero } from "@/components/home/hero";
import { Stats } from "@/components/home/stats";
import { FeaturedProducts } from "@/components/home/featured-products";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <FeaturedProducts />
    </>
  );
}
