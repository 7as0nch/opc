import axios, { type AxiosInstance } from "axios";

// 后端是否已配置（未配置时，业务层回退到本地 mock）
export const isApiConfigured = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);

// 统一的 axios 实例：业务接口后续接独立 Go/Kratos 服务
// baseURL 取自环境变量；未配置时为空字符串
export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// 请求拦截器：预留鉴权 header 注入点
apiClient.interceptors.request.use((config) => {
  // TODO: 接入后端后在此注入 Authorization 等鉴权信息
  return config;
});

// 响应拦截器：统一错误归一化，向上抛出可读的 Error
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    let message = "请求失败，请稍后重试";
    if (axios.isAxiosError(error)) {
      message =
        (error.response?.data as { message?: string })?.message ??
        error.message ??
        message;
    }
    return Promise.reject(new Error(message));
  }
);
