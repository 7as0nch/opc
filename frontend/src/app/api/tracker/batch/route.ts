// 埋点同源代理。
// 浏览器同源 POST 到 /api/tracker/batch（无 CORS、无预检、无混合内容），
// 这里在服务端转发到真实埋点后端，并统一为后端要求的 application/json。
// 真实后端地址用 TRACKER_UPSTREAM_URL（服务端变量）配置。

const UPSTREAM =
  process.env.TRACKER_UPSTREAM_URL || "https://api.aihelper.chat/tracker/batch";

// 不参与 Next 的缓存/静态优化
export const dynamic = "force-dynamic";

// 转发到上游，带少量重试：规避 Node/undici 首次连接（DNS/IPv6）抖动导致的偶发失败。
async function forwardToUpstream(body: string): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(UPSTREAM, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        cache: "no-store",
      });
      const text = await res.text();
      return new Response(text, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      lastError = e;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  const err = lastError as (Error & { cause?: { code?: string } }) | undefined;
  return new Response(
    JSON.stringify({
      code: 502,
      msg: "tracker upstream unreachable",
      cause: err?.cause?.code ?? err?.message,
    }),
    { status: 502, headers: { "Content-Type": "application/json" } }
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  return forwardToUpstream(body);
}
