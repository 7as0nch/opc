"use client";

import { useMutation } from "@tanstack/react-query";
import {
  submitBetaApplication,
  type BetaApplicationPayload,
} from "@/lib/api/beta";
import { queryKeys } from "@/lib/query/keys";

// 内测申请提交 hook：组件只调此 hook，不直接触碰 axios（遵循项目规范）
export function useBetaApply() {
  return useMutation({
    mutationKey: queryKeys.beta.apply,
    mutationFn: (payload: BetaApplicationPayload) =>
      submitBetaApplication(payload),
  });
}
