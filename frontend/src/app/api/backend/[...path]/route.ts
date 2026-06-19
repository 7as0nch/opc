// 业务接口同源代理。
// 浏览器同源 POST 到 /api/backend/<path>（无 CORS、无预检、无混合内容），
// 这里在服务端把请求转发到真实后端 ${API_UPSTREAM_URL}/<path>，并保持 application/json。
// 真实后端前缀用 API_UPSTREAM_URL（服务端变量）配置（与埋点同一后端）。

const UPSTREAM = (
  process.env.API_UPSTREAM_URL || "https://api.aihelper.chat"
).replace(/\/$/, "");

export const dynamic = "force-dynamic";

// 转发到上游，带少量重试（规避 Node/undici 首次连接抖动）。
async function forward(path: string, body: string): Promise<Response> {
  const url = `${UPSTREAM}/${path}`;
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
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
      msg: "后端暂不可用",
      cause: err?.cause?.code ?? err?.message,
    }),
    { status: 502, headers: { "Content-Type": "application/json" } }
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const body = await request.text();
  return forward(path.join("/"), body);
}
