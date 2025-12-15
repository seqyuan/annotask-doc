---
home: true
modules:
  - BannerBrand
  - MdContent
  - Footer
bannerBrand:
  bgImage: '/bg.svg'
  title: annotask
  description: 并行任务执行工具
  tagline: Annoroad parallel task monitor tool，并行任务执行工具。将 shell 脚本按行拆分，支持本地并行执行或投递到 SGE 集群运行。
  buttons:
    - { text: 快速开始, link: '/blogs/guide/introduce' }
    - { text: 安装指南, link: '/blogs/guide/installation', type: 'plain' }
  socialLinks:
    - { icon: 'LogoGithub', link: 'https://github.com/seqyuan/annotask' }
isShowTitleInHome: true
actionText: 关于
actionLink: /blogs/guide/introduce
---

## 核心特性

### 🚀 双模式执行
- **Local 模式**：本地并行执行，通过 goroutine pool 控制并发数
- **QsubSge 模式**：通过 DRMAA 库投递到 SGE 集群，支持多队列和资源配额管理

### 🔄 智能重试与恢复
- **自动重试**：失败任务自动重试，最多 3 次（可在配置文件中通过 `retry.max` 修改）
- **内存自适应**：检测内存不足错误（退出码 137 或错误日志关键词），自动增加 125% 内存重试（向上取整）
- **断点续传**：基于 SQLite 数据库，支持跳过已完成任务，只执行失败任务

### 📊 实时监控
- **表格格式输出**：实时显示任务状态（Running/Failed/Finished）、任务ID、退出码、重试轮次等
- **状态持久化**：本地数据库记录每个任务详情，全局数据库支持跨项目查询

### 🧩 模块化设计
- **local**：本地并行执行（默认模块，可直接使用选项参数）
- **qsubsge**：SGE 集群投递
- **stat**：任务状态查询（支持项目汇总和详情查询）
- **delete**：任务记录删除（支持按项目或模块删除）

### 📁 项目管理
- 支持为不同任务设置项目名称，方便管理和查询
- 全局数据库记录所有项目的任务状态
- 支持按项目查询任务统计信息

### 💾 数据库持久化
- **本地任务数据库**：每个输入脚本对应一个 SQLite 数据库，记录子任务详细状态
- **全局任务数据库**：记录所有任务的总体状态，支持跨项目查询和管理
- 任务状态包括：Pending、Running、Failed、Finished

### ⚙️ 配置与扩展
- **YAML 配置文件**：首次运行自动创建 `annotask.yaml`，支持默认参数配置
- **多队列支持**：SGE 模式支持多个队列（逗号分隔，例如：`trans.q,nassci.q,sci.q`）
- **SGE 项目支持**：支持通过 `-P/--sge-project` 参数指定 SGE 项目名称，用于资源配额管理

## 适用场景

- 批量处理大量相互独立的短时任务（如 1000 个运行 2 分钟的 cat 命令）
- 需要在 SGE 集群上批量投递任务
- 需要自动重试失败任务，减少手动干预
- 需要任务状态持久化和历史记录查询

## 快速安装

### 安装前提
- SQLite3 开发库
- DRMAA 库（如果使用 qsubsge 模式）
- Go 编译器 1.22.2 或更高版本

### 安装命令
```bash
# 设置 Grid Engine DRMAA 路径，并使用 rpath 嵌入库路径
export CGO_CFLAGS="-I/opt/gridengine/include"
export CGO_LDFLAGS="-L/opt/gridengine/lib/lx-amd64 -ldrmaa -Wl,-rpath,/opt/gridengine/lib/lx-amd64"
export LD_LIBRARY_PATH=/opt/gridengine/lib/lx-amd64:$LD_LIBRARY_PATH

# 安装（从 GitHub 下载并编译指定版本）
CGO_ENABLED=1 go install github.com/seqyuan/annotask/cmd/annotask@v1.7.8
```

首次运行 `annotask` 时，会在程序所在目录自动创建 `annotask.yaml` 配置文件。

## 基本使用

### 执行任务

```bash
# Local 模式：并行执行任务
annotask -i input.sh -l 2 -p 4 --project myproject
# 或者显式指定模块
annotask local -i input.sh -l 2 -p 4 --project myproject

# QsubSge 模式：投递到 SGE 集群
annotask qsubsge -i input.sh -l 2 -p 4 --project myproject --cpu 2 --mem 4
```

### 查询任务状态（stat 模块）

`stat` 模块用于查询全局数据库中的任务状态，支持两种查询模式：

**查询所有项目（汇总视图）**：
```bash
annotask stat
```

输出格式：`project module mode status statis stime etime`
- `project`: 项目名称
- `module`: 模块名称（输入文件的 basename）
- `mode`: 运行模式（`local` 或 `qsubsge`）
- `status`: 任务状态（`running`、`completed`、`failed` 或 `-`）
- `statis`: 任务统计，格式为 `总任务数/待处理任务数`
- `stime`: 开始时间（MM-DD HH:MM 格式）
- `etime`: 结束时间（MM-DD HH:MM 格式，未结束显示 `-`）

**查询特定项目（详情视图）**：
```bash
annotask stat -p myproject
```

输出格式：`module pending running failed finished stime etime` + shellPath 列表
- 显示项目的详细任务统计信息
- 自动显示每个模块的完整输入文件路径

### 删除任务记录（delete 模块）

`delete` 模块用于删除全局任务数据库中的任务记录：

```bash
# 删除整个项目
annotask delete -p myproject

# 删除特定模块
annotask delete -p myproject -m input
```

::: warning 注意
删除任务记录只会删除全局任务数据库中的记录，不会删除本地任务数据库文件。如果需要删除本地任务数据库，需要手动删除对应的 `.db` 文件。
:::

## 数据库说明

annotask 使用 SQLite3 数据库来记录任务状态，包含两种数据库：

### 本地任务数据库（`{脚本名}.db`）

每个输入脚本对应一个本地 SQLite 数据库，记录每个子任务的详细状态：
- 任务状态（Pending, Running, Failed, Finished）
- 退出码、重试次数
- 开始/结束时间
- 任务ID（local 模式为 PID，qsubsge 模式为 Job ID）
- 资源信息（CPU、内存等，qsubsge 模式）

### 全局任务数据库（`annotask.db`）

全局数据库记录所有任务的总体状态，支持跨项目查询和管理：
- 项目名称和模块名称
- 任务统计信息（总数、Pending、Failed、Running、Finished）
- 启动和结束时间
- 输入文件路径

数据库路径可在配置文件的 `db` 字段中修改。如果多个用户或多进程需要访问全局数据库，需要设置相应的文件权限。

## 文档导航

- [介绍](/blogs/guide/introduce.html) - 了解 annotask 的功能和特性
- [安装指南](/blogs/guide/installation.html) - 安装和配置 annotask
- [使用方法](/blogs/guide/usage.html) - 学习如何使用 annotask
- [数据库结构](/blogs/guide/database.html) - 了解数据库结构
- [功能特性](/blogs/guide/features.html) - 深入了解功能特性
- [常见问题](/blogs/guide/faq.html) - 查看常见问题解答
- [线程分析](/blogs/advanced/thread-analysis.html) - 了解资源消耗

## 相关链接

- [GitHub 项目](https://github.com/seqyuan/annotask)
- [问题反馈](https://github.com/seqyuan/annotask/issues)

