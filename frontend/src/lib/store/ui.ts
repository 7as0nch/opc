import { create } from "zustand";

// 纯客户端 UI 状态（与服务端数据无关，由 Zustand 管理）
interface UIState {
  // 移动端导航抽屉开关
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}));
