import { apiClient, apiMode } from "@/lib/api/client";

// 内测申请数据（对齐后端契约）
export interface BetaApplicationPayload {
  // 申请的产品方向
  productInterest: "litechat" | "aicook" | "tech-sandbox";
  // 联系方式类型
  contactType: "email" | "qq";
  contactValue: string;
  // 使用场景
  useCase: string;
  note?: string;
  // 来源页（自动填充）
  sourcePage?: string;
}

export interface BetaApplicationResponse {
  id: number;
  status: string;
  mailStatus: string;
}

// 后端统一响应包装
interface BackendResult<T> {
  code: number;
  data: T;
  msg: string;
}

// 提交内测申请。
// backend 模式：经同源代理 POST /beta/applications（→ 真实后端）；
// mock 模式：返回模拟数据，便于本地无后端联调。
export async function submitBetaApplication(
  payload: BetaApplicationPayload
): Promise<BetaApplicationResponse> {
  if (apiMode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { id: Date.now(), status: "submitted", mailStatus: "skipped" };
  }

  const res = await apiClient.post<BackendResult<BetaApplicationResponse>>(
    "/beta/applications",
    payload
  );
  const body = res.data;
  // HTTP 200 但业务码非 200 时也按失败处理
  if (body?.code != null && body.code !== 200) {
    throw new Error(body.msg || "提交失败");
  }
  return body?.data ?? (body as unknown as BetaApplicationResponse);
}
