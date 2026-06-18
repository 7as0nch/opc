#!/usr/bin/env bash
# =============================================================
#  chengj.online 个人门户发布脚本（Linux / macOS / WSL / Git-Bash）。
#  构建并推送前端镜像，渲染 k8s 清单并 apply 到远程 k3s。
#
#  远程仅开放普通用户 SSH（7as0nch），kubectl 需 sudo 读 k3s.yaml，
#  故走 `sudo k3s kubectl`，并用 `ssh -t` 让 sudo 必要时可提示密码。
#  （已配 NOPASSWD sudo 或用户级 kubeconfig 时，可自行去掉 -t / sudo。）
#
#  前置：已 docker login；有 docker / ssh / scp；SSH 公钥已加到远程。
#
#  用法：
#    ./publish.sh                  # 用 frontend/package.json 的 version 打包并部署
#    ./publish.sh --version 0.2.0  # 指定版本
#    ./publish.sh --skip-build     # 镜像已推送，只渲染清单并 apply
#    ./publish.sh --skip-deploy    # 只构建 + 推送镜像，不部署
#    ./publish.sh --no-smoke       # 跳过冒烟测试
#  可用环境变量覆盖：DOCKER_USER REMOTE_HOST REMOTE_PORT NAMESPACE
#    SITE_URL API_BASE_URL SMOKE_URL ROLLOUT_TIMEOUT
# =============================================================
set -euo pipefail

DOCKER_USER="${DOCKER_USER:-7as0nch}"
VERSION="${VERSION:-}"
PLATFORM="${PLATFORM:-linux/amd64}"
REMOTE_HOST="${REMOTE_HOST:-7as0nch@8.229.29.77}"
REMOTE_PORT="${REMOTE_PORT:-22}"
NAMESPACE="${NAMESPACE:-opcweb}"
DEPLOYMENT="${DEPLOYMENT:-opc-frontend}"
SITE_URL="${SITE_URL:-https://chengj.online}"
API_BASE_URL="${API_BASE_URL:-}"
SMOKE_URL="${SMOKE_URL:-https://chengj.online/}"
ROLLOUT_TIMEOUT="${ROLLOUT_TIMEOUT:-180}"
SKIP_BUILD=0; SKIP_DEPLOY=0; NO_SMOKE=0

usage() { sed -n '2,20p' "$0"; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-build)  SKIP_BUILD=1 ;;
    --skip-deploy) SKIP_DEPLOY=1 ;;
    --no-smoke)    NO_SMOKE=1 ;;
    --version)     VERSION="${2:-}"; shift ;;
    -h|--help)     usage; exit 0 ;;
    *) echo "未知参数: $1" >&2; exit 1 ;;
  esac
  shift
done

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE="$DOCKER_USER/opc-frontend"
K8S="$REPO_ROOT/k8s-deployment.yaml"

# 版本号：默认取 frontend/package.json 的 version
if [[ -z "$VERSION" ]]; then
  VERSION="$(node -p "require('$REPO_ROOT/frontend/package.json').version" 2>/dev/null || true)"
  [[ -z "$VERSION" ]] && { echo "无法从 frontend/package.json 读取 version，请用 --version 指定。" >&2; exit 1; }
fi
echo "版本：$VERSION"

# --- 1. 构建并推送镜像 ---
if [[ "$SKIP_BUILD" -eq 0 ]]; then
  echo "→ 构建并推送 ${IMAGE}:${VERSION}（${PLATFORM}）"
  docker buildx build --platform "$PLATFORM" \
    --build-arg "NEXT_PUBLIC_SITE_URL=$SITE_URL" \
    --build-arg "NEXT_PUBLIC_API_BASE_URL=$API_BASE_URL" \
    -t "${IMAGE}:${VERSION}" \
    -t "${IMAGE}:latest" \
    -f "$REPO_ROOT/frontend/Dockerfile" "$REPO_ROOT/frontend" --push
else
  echo "跳过构建（--skip-build）：请确保镜像已推送，否则远程拉取会失败。"
fi

# --- 2. 部署：渲染占位符 → scp → sudo k3s kubectl apply ---
if [[ "$SKIP_DEPLOY" -eq 0 ]]; then
  [[ -f "$K8S" ]] || { echo "找不到清单：$K8S" >&2; exit 1; }
  tmp="$(mktemp)"
  sed "s/__IMAGE_VERSION__/${VERSION}/g" "$K8S" > "$tmp"

  echo "→ 上传清单到远程 ~/opc-web.yaml"
  scp -o ConnectTimeout=10 -P "$REMOTE_PORT" "$tmp" "${REMOTE_HOST}:~/opc-web.yaml"
  rm -f "$tmp"

  echo "→ 远程 apply（sudo k3s kubectl）"
  ssh -t -o ConnectTimeout=10 -p "$REMOTE_PORT" "$REMOTE_HOST" 'sudo k3s kubectl apply -f ~/opc-web.yaml'

  echo "→ 等待 frontend 就绪"
  if ! ssh -t -o ConnectTimeout=10 -p "$REMOTE_PORT" "$REMOTE_HOST" \
        "sudo k3s kubectl rollout status deployment/$DEPLOYMENT -n $NAMESPACE --timeout=${ROLLOUT_TIMEOUT}s"; then
    echo "滚动更新未就绪，远程诊断如下：" >&2
    ssh -t -o ConnectTimeout=10 -p "$REMOTE_PORT" "$REMOTE_HOST" \
      "sudo k3s kubectl get pods -n $NAMESPACE -o wide; echo '--- logs ---'; sudo k3s kubectl logs -n $NAMESPACE deployment/$DEPLOYMENT --tail=40"
    exit 1
  fi
else
  echo "跳过部署（--skip-deploy）"
fi

# --- 3. 冒烟测试 ---
if [[ "$NO_SMOKE" -eq 0 && "$SKIP_DEPLOY" -eq 0 ]]; then
  echo "→ 冒烟：$SMOKE_URL"
  code="$(curl -s -o /dev/null -w '%{http_code}' -I --max-time 15 "$SMOKE_URL" || true)"
  if [[ "$code" =~ ^(200|301|302|308)$ ]]; then
    echo "✓ $SMOKE_URL -> HTTP $code"
  else
    echo "⚠ 冒烟异常（可能仍在启动 / DNS / TLS 未就绪）：HTTP ${code:-超时}"
  fi
fi

echo "发布完成：${IMAGE}:${VERSION}"
