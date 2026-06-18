# syntax=docker/dockerfile:1
# Next.js 16 standalone 多阶段构建（参考官方 with-docker 示例）。
# 最终镜像仅含运行所需文件，node server.js 监听 3000。

FROM node:22-alpine AS base
# sharp / Next 在 alpine 上需要 libc6-compat
RUN apk add --no-cache libc6-compat

# ── 1) 依赖 ──────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── 2) 构建 ──────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* 在构建期被内联进客户端包，必须在 build 前注入（由 --build-arg 传入）
ARG NEXT_PUBLIC_SITE_URL=https://chengj.online
ARG NEXT_PUBLIC_API_BASE_URL=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── 3) 运行（仅 standalone 产物）─────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# 非 root 运行
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
# public 与静态资源不在 standalone 里，需单独拷贝
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
