"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface CountUpProps {
  // 目标数值
  to: number;
  from?: number;
  // 时长（秒）
  duration?: number;
  prefix?: string;
  suffix?: string;
  // 小数位
  decimals?: number;
  className?: string;
}

// 数字累加动效：进入视口才开始（IntersectionObserver），用项目已装的 gsap 平滑递增。
// 等价于 ReactBits 的 CountUp，但不引入 framer-motion；尊重 prefers-reduced-motion。
export default function CountUp({
  to,
  from = 0,
  duration = 1.8,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const format = (v: number) => `${prefix}${v.toFixed(decimals)}${suffix}`;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = format(to);
      return;
    }

    el.textContent = format(from);
    const counter = { value: from };
    let tween: gsap.core.Tween | null = null;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tween = gsap.to(counter, {
              value: to,
              duration,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = format(counter.value);
              },
            });
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      tween?.kill();
    };
  }, [to, from, duration, prefix, suffix, decimals]);

  // 首帧显示起始值，避免布局跳动
  return (
    <span ref={ref} className={className}>
      {`${prefix}${from.toFixed(decimals)}${suffix}`}
    </span>
  );
}
