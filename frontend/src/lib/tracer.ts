// 埋点（前端事件采集）—— 由 Vue 版迁移而来，适配 React / Next.js（App Router）。
//
// 框架无关的批量上报核心（队列 + 定时/阈值 flush + sendBeacon + 拦截器）保留；
// Vue 专属部分替换：
//   - installRouter(vue-router)  → 由 <Tracker/> 组件用 usePathname 调 trackPageView/trackStay
//   - installDirective(v-tracker)→ 由 <Tracker/> 组件用 [data-track] 事件委托
//   - installApi(axios)          → 保留，挂到项目的 axios 实例（src/lib/api/client.ts）
//
// SSR 安全：所有浏览器 API 访问都加 isBrowser 守卫，服务端导入不报错、不上报。

import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const isBrowser = typeof window !== "undefined";

interface TrackerOptions {
  baseUrl?: string;
  appId?: string;
  userId?: number;
  batchSize?: number;
  wait?: number;
}

export interface LogItem {
  appId: string;
  deviceId: string;
  userId: number;
  timestamp: string;
  userAgent: string;
  pageUrl: string;
  type: string;
  data: unknown;
}

type BeforeHandler = (log: LogItem) => boolean | Promise<boolean>;
type AfterHandler = (logs: LogItem[]) => void;

// 给 axios 请求配置挂 metadata（计算接口耗时用）
declare module "axios" {
  interface InternalAxiosRequestConfig {
    metadata?: { startTime: number };
  }
}

// 设备 ID：优先 crypto.randomUUID（需安全上下文），否则降级到随机生成
function generateId(): string {
  if (isBrowser && typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class AnalyticsTracker {
  public baseUrl: string;
  public appId: string;
  public userId: number;
  public queue: LogItem[] = [];
  public batchSize: number;
  public wait: number;
  public timer: ReturnType<typeof setInterval> | null = null;
  public beforeHandlers: BeforeHandler[] = [];
  public afterHandlers: AfterHandler[] = [];
  public deviceId: string;
  public pageStartTime: number;
  private apiInstalled = false;
  // 熔断：连续失败达阈值后暂停上报一段时间，避免持续往坏接口发请求 + 刷控制台
  private failureCount = 0;
  private circuitOpenUntil = 0;
  private readonly failureThreshold = 3;
  private readonly cooldownMs = 5 * 60_000;

  constructor(options: TrackerOptions = {}) {
    this.baseUrl = options.baseUrl || "/api/log/batch";
    this.appId = options.appId || "web-app";
    this.userId = options.userId || 0;
    this.batchSize = options.batchSize || 10;
    this.wait = options.wait || 5000;
    this.deviceId = this._getDeviceId();
    this.pageStartTime = Date.now();

    if (isBrowser) {
      this._startTimer();
      this._listenUnload();
    }
  }

  // --- 内部机制 ---

  private _getDeviceId(): string {
    if (!isBrowser) return "";
    let id = localStorage.getItem("tracker_device_id");
    if (!id) {
      id = generateId();
      localStorage.setItem("tracker_device_id", id);
    }
    return id;
  }

  private _formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const HH = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
  }

  private _getBaseInfo() {
    return {
      appId: this.appId,
      deviceId: this.deviceId,
      userId: this.userId,
      timestamp: this._formatDate(Date.now()),
      userAgent: isBrowser ? navigator.userAgent : "",
      pageUrl: isBrowser ? window.location.href : "",
    };
  }

  private _startTimer() {
    this.timer = setInterval(() => this.flush(), this.wait);
  }

  private _listenUnload() {
    const flushHandler = () => this.flush(true);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushHandler();
    });
    window.addEventListener("beforeunload", flushHandler);
  }

  // --- 核心逻辑 ---

  // 收集一条事件（入队，不立即发送）
  public async report(type: string, payload: unknown = {}): Promise<this> {
    if (!isBrowser || this._circuitOpen()) return this;

    const logItem: LogItem = { ...this._getBaseInfo(), type, data: payload };

    for (const handler of this.beforeHandlers) {
      const shouldContinue = await handler(logItem);
      if (shouldContinue === false) return this;
    }

    this.queue.push(logItem);
    if (this.queue.length >= this.batchSize) this.flush();
    return this;
  }

  // 强制发送队列。useBeacon=true 用于页面关闭时（sendBeacon 一锤子买卖）。
  public flush(useBeacon = false): void {
    if (!isBrowser || this.queue.length === 0) return;
    // 熔断打开时丢弃队列，避免堆积与持续失败
    if (this._circuitOpen()) {
      this.queue = [];
      return;
    }

    const dataToSend = [...this.queue];
    this.queue = [];
    this._sendData(dataToSend, useBeacon);

    for (const handler of this.afterHandlers) handler(dataToSend);
  }

  private _circuitOpen(): boolean {
    return Date.now() < this.circuitOpenUntil;
  }

  // 记录一次发送结果，驱动熔断
  private _onSendResult(ok: boolean): void {
    if (ok) {
      this.failureCount = 0;
      return;
    }
    this.failureCount += 1;
    if (this.failureCount >= this.failureThreshold) {
      this.failureCount = 0;
      this.circuitOpenUntil = Date.now() + this.cooldownMs;
      // 只提示一次，避免刷屏
      console.warn(
        `[Tracker] 上报连续失败，暂停 ${Math.round(this.cooldownMs / 60000)} 分钟`
      );
    }
  }

  private _sendData(dataList: LogItem[], useBeacon: boolean): void {
    // 后端要求 data 字段为字符串，手动序列化
    const payload = dataList.map((item) => ({
      ...item,
      data:
        typeof item.data === "object"
          ? JSON.stringify(item.data)
          : String(item.data),
    }));
    const body = JSON.stringify({ logs: payload });

    // 页面关闭：sendBeacon（无法获知结果，best-effort）
    if (useBeacon && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "text/plain; charset=UTF-8" });
      navigator.sendBeacon(this.baseUrl, blob);
      return;
    }

    // 常规：fetch keepalive。HTTP 错误码（如后端 5xx）以 res.ok 判定来驱动熔断；
    // fetch 解析出错误码不会向控制台抛红，避免刷屏。
    fetch(this.baseUrl, {
      method: "POST",
      body,
      headers: { "Content-Type": "text/plain" },
      keepalive: true,
    })
      .then((res) => this._onSendResult(res.ok))
      .catch(() => this._onSendResult(false));
  }

  // --- 链式配置 ---

  public setUserId(id: number): this {
    this.userId = id;
    return this;
  }

  public before(handler: BeforeHandler): this {
    this.beforeHandlers.push(handler);
    return this;
  }

  public after(handler: AfterHandler): this {
    this.afterHandlers.push(handler);
    return this;
  }

  // --- 场景集成（React 友好）---

  // 页面浏览
  public trackPageView(path: string, referrer = ""): this {
    void this.report("pv", { path, referrer });
    return this;
  }

  // 页面停留（路由切换时由集成层调用）
  public trackStay(path: string, durationMs: number): this {
    const duration =
      durationMs < 60000
        ? `${Math.round(durationMs / 1000)}s`
        : `${(durationMs / 60000).toFixed(2)}min`;
    void this.report("stay", { path, duration });
    return this;
  }

  // API 埋点：挂到项目的 axios 实例（幂等，仅挂一次）
  public installApi(axiosInstance: AxiosInstance): this {
    if (this.apiInstalled) return this;
    this.apiInstalled = true;

    axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        config.metadata = { startTime: Date.now() };
        return config;
      }
    );
    axiosInstance.interceptors.response.use(
      (res: AxiosResponse) => {
        const config = res.config as InternalAxiosRequestConfig | undefined;
        void this.report("api", {
          url: config?.url,
          method: config?.method,
          status: res.status,
          duration: Date.now() - (config?.metadata?.startTime ?? Date.now()),
          success: true,
        });
        return res;
      },
      (err: unknown) => {
        const e = err as {
          config?: InternalAxiosRequestConfig;
          response?: { status?: number };
        };
        void this.report("api", {
          url: e.config?.url,
          status: e.response?.status ?? 0,
          duration: Date.now() - (e.config?.metadata?.startTime ?? Date.now()),
          success: false,
        });
        return Promise.reject(err instanceof Error ? err : new Error(String(err)));
      }
    );
    return this;
  }
}

// 单例：默认上报到同源代理 /api/tracker/batch（见 app/api/tracker/batch/route.ts），
// 由它在服务端转发到真实埋点后端——规避跨域 CORS 预检、混合内容、以及后端只收 application/json 的限制。
// 真实后端地址在服务端用 TRACKER_UPSTREAM_URL 配置；如需直连可用 NEXT_PUBLIC_TRACKER_URL 覆盖。
const tracker = new AnalyticsTracker({
  appId: process.env.NEXT_PUBLIC_TRACKER_APP_ID || "opc-web",
  baseUrl: process.env.NEXT_PUBLIC_TRACKER_URL || "/api/tracker/batch",
  batchSize: 5,
  wait: 3000,
});

export { AnalyticsTracker, tracker };
