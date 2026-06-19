import axios, { type AxiosInstance } from "axios";

// 业务接口默认走同源代理 /api/backend（见 app/api/backend/[...path]/route.ts），
// 由它在服务端转发到真实后端，规避跨域 CORS 预检 / 混合内容。
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/backend";

// 接口模式：backend（真实，默认）| mock（本地联调，返回模拟数据）
export const apiMode: "backend" | "mock" =
  process.env.NEXT_PUBLIC_API_MODE === "mock" ? "mock" : "backend";

// 统一的 axios 实例
export const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// 请求拦截器：预留鉴权 header 注入点
apiClient.interceptors.request.use((config) => {
  // TODO: 接入鉴权后在此注入 Authorization
  return config;
});

// 响应拦截器：统一错误归一化（后端错误体形如 { code, msg }），向上抛出可读 Error
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    let message = "请求失败，请稍后重试";
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status && status >= 500) {
        // 后端 5xx（含上游 526）统一提示，不暴露细节
        message = "服务暂时不可用，请稍后再试";
      } else {
        const data = error.response?.data as
          | { msg?: string; message?: string }
          | undefined;
        message =
          (typeof data === "object" ? (data?.msg ?? data?.message) : undefined) ??
          error.message ??
          message;
      }
    }
    return Promise.reject(new Error(message));
  }
);
