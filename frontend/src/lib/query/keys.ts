// React Query 查询/变更键工厂：集中管理，避免散落的魔法字符串
export const queryKeys = {
  beta: {
    apply: ["beta", "apply"] as const,
  },
} as const;
