<#
.SYNOPSIS
  chengj.online 个人门户发布脚本（Windows / PowerShell 7+）。
  构建并推送前端镜像，把版本号写进 k8s 清单并 apply 到远程 k3s。

.DESCRIPTION
  1) docker buildx 构建 linux/amd64 镜像并 --push（tag = -Version + :latest）；
     NEXT_PUBLIC_* 作为 --build-arg 在构建期内联进包。
  2) 渲染 k8s-deployment.yaml 的 __IMAGE_VERSION__ 占位符 → scp 到远程 → sudo k3s kubectl apply；
  3) rollout status 等待就绪 + 公网首页冒烟。

  远程是 k3s 且仅开放普通用户 SSH（7as0nch），kubectl 需 sudo 读 /etc/rancher/k3s/k3s.yaml，
  故所有 kubectl 走 `sudo k3s kubectl`，并用 `ssh -t` 分配 TTY 以便 sudo 必要时提示密码。
  （若已配 NOPASSWD sudo 或用户级 kubeconfig，可自行去掉 -t / sudo。）

  前置：本机已 docker login；有 docker / ssh / scp；SSH 公钥已加到远程 7as0nch@8.229.29.77。

.EXAMPLE
  ./publish.ps1                     # 用 frontend/package.json 的 version 打包并部署
.EXAMPLE
  ./publish.ps1 -Version 0.2.0      # 指定版本
.EXAMPLE
  ./publish.ps1 -SkipBuild          # 镜像已推送，只渲染清单并 apply
.EXAMPLE
  ./publish.ps1 -SkipDeploy         # 只构建 + 推送镜像，不部署
#>
[CmdletBinding()]
param(
  [string]$DockerUser        = '7as0nch',
  [string]$Version           = 'v0.0.0',
  [string]$Platform          = 'linux/amd64',
  [string]$RemoteHost        = '7as0nch@8.229.29.77',
  [int]   $RemotePort        = 22,
  [string]$Namespace         = 'opcweb',
  [string]$Deployment        = 'opc-frontend',
  [string]$SiteUrl           = 'https://chengj.online',
  [string]$ApiBaseUrl        = '',
  [string]$SmokeUrl          = 'https://chengj.online/',
  [int]   $RolloutTimeoutSec = 180,
  [switch]$SkipBuild,
  [switch]$SkipDeploy,
  [switch]$NoSmoke
)

$ErrorActionPreference = 'Stop'
# 固定 UTF-8 无 BOM，保证管道/文件写出一致
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$RepoRoot = $PSScriptRoot
$Image    = "$DockerUser/opc-frontend"
$K8sPath  = Join-Path $RepoRoot 'k8s-deployment.yaml'
# 复用 ssh 参数；-t 在调用处单独加
$SshArgs  = @('-o', 'ConnectTimeout=10', '-p', "$RemotePort", $RemoteHost)

function Invoke-Native {
  param(
    [Parameter(Mandatory)][string]$What,
    [Parameter(Mandatory)][scriptblock]$Action
  )
  Write-Host "→ $What" -ForegroundColor Cyan
  & $Action
  if ($LASTEXITCODE -ne 0) { throw "$What 失败（exit $LASTEXITCODE）" }
}

# 版本号：默认取 frontend/package.json 的 version
if (-not $Version) {
  $pkg = Get-Content -Raw (Join-Path $RepoRoot 'frontend/package.json') | ConvertFrom-Json
  $Version = $pkg.version
  if (-not $Version) { throw '无法从 frontend/package.json 读取 version，请用 -Version 指定。' }
}
Write-Host "版本：$Version" -ForegroundColor Green

# Docker Desktop 默认 builder 一般支持 --push；legacy docker 驱动则不支持，临时建 docker-container builder。
function Get-PushBuilderArgs {
  $inspect = (docker buildx inspect 2>$null | Out-String)
  if ($inspect -match '(?m)^\s*Driver:\s+docker\s*$') {
    Write-Host '当前 buildx 为 docker 驱动（不支持 --push），改用 docker-container builder：opc-builder' -ForegroundColor Yellow
    docker buildx inspect opc-builder *> $null
    if ($LASTEXITCODE -ne 0) { docker buildx create --name opc-builder --driver docker-container *> $null }
    return @('--builder', 'opc-builder')
  }
  return @()
}

# --- 1. 构建并推送镜像 ---
if (-not $SkipBuild) {
  $dockerfile  = Join-Path $RepoRoot 'frontend/Dockerfile'
  $context     = Join-Path $RepoRoot 'frontend'
  $builderArgs = Get-PushBuilderArgs
  Invoke-Native "构建并推送 ${Image}:${Version}（${Platform}）" {
    docker buildx build @builderArgs --platform $Platform `
      --build-arg "NEXT_PUBLIC_SITE_URL=$SiteUrl" `
      --build-arg "NEXT_PUBLIC_API_BASE_URL=$ApiBaseUrl" `
      -t "${Image}:${Version}" `
      -t "${Image}:latest" `
      -f "$dockerfile" "$context" --push
  }
} else {
  Write-Host '跳过构建（-SkipBuild）：请确保镜像已推送，否则远程拉取会失败。' -ForegroundColor Yellow
}

# --- 2. 部署：渲染占位符 → scp → sudo k3s kubectl apply ---
if (-not $SkipDeploy) {
  if (-not (Test-Path $K8sPath)) { throw "找不到清单：$K8sPath" }
  $content  = (Get-Content -Raw -LiteralPath $K8sPath -Encoding utf8).TrimStart([char]0xFEFF)
  $rendered = ($content -replace '__IMAGE_VERSION__', $Version) -replace "`r`n", "`n"

  # 写本地临时文件再 scp（避免 stdin 与 ssh -t 的 TTY 冲突）
  $tmp = Join-Path ([System.IO.Path]::GetTempPath()) 'opc-web.yaml'
  [System.IO.File]::WriteAllText($tmp, $rendered, [System.Text.UTF8Encoding]::new($false))

  Invoke-Native '上传清单到远程 ~/opc-web.yaml' {
    scp -o ConnectTimeout=10 -P $RemotePort $tmp "${RemoteHost}:~/opc-web.yaml"
  }
  Invoke-Native '远程 apply（sudo k3s kubectl）' {
    ssh -t @SshArgs 'sudo k3s kubectl apply -f ~/opc-web.yaml'
  }
  try {
    Invoke-Native '等待 frontend 就绪' {
      ssh -t @SshArgs "sudo k3s kubectl rollout status deployment/$Deployment -n $Namespace --timeout=${RolloutTimeoutSec}s"
    }
  } catch {
    Write-Host '滚动更新未在超时内就绪，远程诊断如下：' -ForegroundColor Yellow
    ssh -t @SshArgs "sudo k3s kubectl get pods -n $Namespace -o wide; echo '--- logs ---'; sudo k3s kubectl logs -n $Namespace deployment/$Deployment --tail=40"
    throw
  }
} else {
  Write-Host '跳过部署（-SkipDeploy）' -ForegroundColor Yellow
}

# --- 3. 冒烟测试 ---
if (-not $NoSmoke -and -not $SkipDeploy) {
  try {
    $resp = Invoke-WebRequest -Uri $SmokeUrl -Method Head -TimeoutSec 15 -SkipHttpErrorCheck
    Write-Host "✓ $SmokeUrl -> HTTP $($resp.StatusCode)" -ForegroundColor Green
  } catch {
    Write-Host "⚠ 冒烟失败（可能仍在启动 / DNS / TLS 未就绪）：$SmokeUrl`n  $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "  可手动查看：ssh -p $RemotePort $RemoteHost ""sudo k3s kubectl logs -n $Namespace deployment/$Deployment --tail=50""" -ForegroundColor Yellow
  }
}

Write-Host "发布完成：${Image}:$Version" -ForegroundColor Green
