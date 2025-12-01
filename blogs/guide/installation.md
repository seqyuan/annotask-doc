---
title: 安装指南
date: 2025-01-27
---

# 安装 annotask

## 前置条件

### 1. SQLite3 开发库

annotask 使用 SQLite3 数据库来记录任务状态，因此需要安装 SQLite3 开发库。

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y libsqlite3-dev
```

**CentOS/RHEL:**
```bash
sudo yum install -y sqlite-devel
# 或者对于较新版本
sudo dnf install -y sqlite-devel
```

**macOS:**
```bash
brew install sqlite
```

### 2. DRMAA 库（如果使用 qsubsge 模式）

DRMAA 库通常随 Grid Engine/SGE 系统一起安装。如果系统已安装 SGE，DRMAA 库应该已经可用。

**Ubuntu/Debian:**
```bash
sudo apt-get install -y libdrmaa1.0 libdrmaa-dev
```

::: warning 注意
如果不需要 qsubsge 模式，可以忽略此错误（不影响local模式）
如果需要 qsubsge 模式，必须安装 DRMAA 库（通常随SGE系统一起安装）
:::

### 3. Go 编译器

确保已安装 Go 1.22.2 或更高版本：

```bash
go version
```

如果未安装，请访问 [Go 官网](https://golang.org/dl/) 下载并安装。

## 安装步骤

### 方法 1: 从 GitHub 安装（推荐）

```bash
# 安装最新版本
CGO_ENABLED=1 go install github.com/seqyuan/annotask/cmd/app@latest

# 安装后，可执行文件会在 $GOPATH/bin 或 $HOME/go/bin 目录
# 确保该目录在 PATH 中：
export PATH=$PATH:$(go env GOPATH)/bin

# 重命名为 annotask（可选）
mv $(go env GOPATH)/bin/app $(go env GOPATH)/bin/annotask
```

### 方法 2: 从本地源码安装

```bash
# 克隆仓库
git clone https://github.com/seqyuan/annotask.git
cd annotask

# 安装
CGO_ENABLED=1 go install ./cmd/app

# 重命名为 annotask（可选）
mv $(go env GOPATH)/bin/app $(go env GOPATH)/bin/annotask
```

::: tip 提示
`CGO_ENABLED=1` 是必需的，因为 annotask 使用了 CGO 来链接 SQLite3 和 DRMAA 库。
:::

## 验证安装

```bash
# 检查可执行文件
which annotask

# 查看帮助
annotask -h
```

如果安装成功，你应该能看到 annotask 的帮助信息。

## 配置文件

首次运行 `annotask` 时，会在程序所在目录自动创建 `annotask.yaml` 配置文件。配置文件包含：

- `db`: 全局数据库路径（记录所有任务）
- `project`: 默认项目名称
- `retry.max`: 最大重试次数
- `queue`: SGE 默认队列
- `node`: SGE 节点名称（qsubsge 模式会检查）
- `defaults`: 各参数的默认值

配置文件示例见 `annotask.yaml.example`。

## 常见安装问题

### 编译错误: "drmaa.h: No such file or directory"

**原因**: 系统未安装 DRMAA 开发库

**解决方案**:
- 如果不需要 qsubsge 模式，可以忽略此错误（不影响local模式）
- 如果需要 qsubsge 模式，必须安装 DRMAA 库（通常随SGE系统一起安装）

### 编译错误: "sqlite3.h: No such file or directory"

**原因**: 系统未安装 SQLite3 开发库

**解决方案**: 按照安装说明安装 libsqlite3-dev 或 sqlite-devel

## 下一步

安装完成后，可以查看：
- [使用方法](/blogs/guide/usage.html) - 学习如何使用 annotask
- [功能特性](/blogs/guide/features.html) - 了解 annotask 的功能

