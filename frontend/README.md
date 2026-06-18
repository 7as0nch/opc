# chengj.online 前端门户

独立开发者 chengj 的个人公司对外展示门户。聚合并展示开源工具与 AI 产品（[mimo2codex](https://mimodoc.chengj.online)、AICook），承载博客/动态、关于+联系与内测申请。

## 技术栈

- **Next.js 16**（App Router，React 19）— SSG/ISR，内容门户 SEO 友好
- **TypeScript** 严格模式
- **Tailwind CSS v4** + **shadcn/ui**（Base UI 原语）
- **React Query**（服务端状态）+ **Zustand**（客户端 UI 状态）
- **react-hook-form** + **zod**（表单与校验）
- **next-themes**（明暗主题）
- **@next/mdx**（文件式博客）

> 业务接口后续接独立的 **Go / Kratos** 服务，当前为前端骨架，表单走本地 mock。

## 快速开始

```bash
npm install
cp .env.example .env.local   # 按需填写
npm run dev                  # http://localhost:3000
```

## 常用脚本

```bash
npm run dev      # 本地开发
npm run build    # 生产构建（含静态预渲染）
npm run start    # 运行生产构建
npm run lint     # ESLint
npx tsc --noEmit # 类型检查
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_API_BASE_URL` | 后端 API 基地址；留空时内测/联系表单走本地 mock |
| `NEXT_PUBLIC_SITE_URL` | 站点对外地址，用于 SEO canonical / sitemap / OpenGraph |

## 目录结构

```
src/
├─ app/                      # 路由（App Router）
│  ├─ page.tsx               # 首页
│  ├─ products/              # 产品列表 + [slug] 详情
│  ├─ blog/                  # 博客列表 + [slug] 详情（MDX）
│  ├─ about/ · beta/         # 关于+联系 · 内测申请
│  ├─ sitemap.ts · robots.ts # SEO
│  └─ providers.tsx          # React Query + 主题 Provider
├─ components/
│  ├─ ui/                    # shadcn 原语
│  ├─ layout/ · home/ · products/ · blog/ · forms/
│  └─ theme-toggle.tsx
├─ lib/
│  ├─ api/                   # axios 实例 + 业务请求（占位）
│  ├─ content/               # 产品数据 · 博客读取
│  ├─ config/site.ts         # 站点元信息/导航/社交
│  ├─ query/ · store/        # React Query keys · Zustand
│  └─ utils.ts
├─ content/blog/*.mdx        # 博客文章（含 frontmatter）
├─ hooks/ · types/
public/products/             # 产品封面图
```

## 内容维护

- **新增产品**：编辑 `src/lib/content/products.ts`，封面图放入 `public/products/`。
- **新增文章**：在 `src/content/blog/` 新建 `<slug>.mdx`，顶部 `export const metadata = {...}`。

## 待接入（后端就绪后）

- 内测申请 / 联系表单 → Go/Kratos `POST /beta/apply`（见 `src/lib/api/beta.ts` 的 TODO）。
- axios 拦截器中的鉴权注入点（见 `src/lib/api/client.ts`）。
