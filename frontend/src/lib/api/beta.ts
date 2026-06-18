import { apiClient, isApiConfigured } from "@/lib/api/client";

// 内测申请表单数据
export interface BetaApplyPayload {
  name: string;
  email: string;
  // 申请的产品标识，如 aicook
  product: string;
  device?: string;
  message?: string;
}

export interface BetaApplyResult {
  ok: boolean;
  // 是否为本地 mock（后端未接入时为 true）
  mocked: boolean;
}

// 提交内测申请。
// TODO: 后端就绪后接 Go/Kratos 的 POST /beta/apply；
// 当前未配置 NEXT_PUBLIC_API_BASE_URL 时返回 mock 成功，便于前端联调。
export async function submitBetaApply(
  payload: BetaApplyPayload
): Promise<BetaApplyResult> {
  if (!isApiConfigured) {
    // 模拟网络往返，便于演示加载/成功三态
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { ok: true, mocked: true };
  }
  await apiClient.post("/beta/apply", payload);
  return { ok: true, mocked: false };
}
