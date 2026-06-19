"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { tracker } from "@/lib/tracer";
import { apiClient } from "@/lib/api/client";

// 埋点集成组件：挂在根布局，全局一次。
// - 路由变化：上报上一页停留(stay) + 当前页浏览(pv)
// - 按钮埋点：给任意元素加 data-track="名称"（可选 data-track-xxx 作为附加字段）
// - API 埋点：把 tracker 挂到项目的 axios 实例
export function Tracker() {
  const pathname = usePathname();
  const prev = useRef<{ path: string; start: number } | null>(null);

  // API 埋点（幂等，tracker 内部只挂一次）
  useEffect(() => {
    tracker.installApi(apiClient);
  }, []);

  // 路由变化：stay(上一页) + pv(当前页)
  useEffect(() => {
    const fullPath = pathname + window.location.search;
    if (prev.current) {
      tracker.trackStay(prev.current.path, Date.now() - prev.current.start);
    }
    tracker.trackPageView(fullPath, prev.current?.path ?? "");
    prev.current = { path: fullPath, start: Date.now() };
  }, [pathname]);

  // 按钮埋点：事件委托，捕获阶段；元素带 data-track 即上报
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-track]"
      );
      if (!el) return;
      const extra: Record<string, string> = {};
      for (const [key, value] of Object.entries(el.dataset)) {
        // data-track-foo → { foo: value }
        if (key.startsWith("track") && key !== "track" && value !== undefined) {
          const field = key.slice(5);
          extra[field.charAt(0).toLowerCase() + field.slice(1)] = value;
        }
      }
      void tracker.report("button", { name: el.dataset.track ?? "", ...extra });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // 错误埋点：全局 JS 错误 + 未捕获的 Promise rejection
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      void tracker.report("error", {
        message: e.message,
        source: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error instanceof Error ? e.error.stack?.slice(0, 500) : undefined,
      });
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      void tracker.report("error", {
        kind: "unhandledrejection",
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack?.slice(0, 500) : undefined,
      });
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
