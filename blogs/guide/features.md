---
title: 功能特性
date: 2025-01-27
---

# annotask 功能特性

## 自动重试机制

annotask 提供了强大的自动重试机制，确保任务能够成功执行。

### 重试策略

- 失败的任务会自动重试，最多重试3次（可在配置文件中修改）
- 如果任务因内存不足被SGE系统kill，下次重试时会自动将内存请求增加125%
- 重试次数记录在数据库的`retry`列中

### 重试示例

```
[NEW] Task 1: Pending -> Running (PID: 12345)
Task 2: Running -> Finished (Exit: 0)
[RETRY-1] Task 3: Failed -> Running (PID: 12346)
[RETRY-2] Task 3: Failed -> Running (PID: 12347)
Task 3: Running -> Finished (Exit: 0)
```

## 内存自适应

在 qsubsge 模式下，如果任务因为内存不足被kill（退出码137或错误日志中包含内存相关关键词），annotask会自动：

1. 检测内存错误
2. 将`mem`和`h_vmem`增加125%
3. 重新投递任务

### 内存自适应示例

假设初始内存设置为 4GB：

- 第1次尝试：`mem=4GB, h_vmem=5GB`（4 * 1.25）
- 如果失败（内存不足），第2次尝试：`mem=5GB, h_vmem=6.25GB`（5 * 1.25）
- 如果仍然失败，第3次尝试：`mem=6.25GB, h_vmem=7.8125GB`（6.25 * 1.25）

## 任务状态监控

annotask在运行时会启动一个独立的goroutine实时监控任务状态，并将状态变化输出到标准输出，包括：

- 新任务启动（标记为 `[NEW]`）
- 任务状态变化
- 任务重试（标记为 `[RETRY-N]`，N为重试次数）
- 任务完成或失败

### 监控输出示例

```
[NEW] Task 1: Pending -> Running (PID: 12345)
[NEW] Task 2: Pending -> Running (PID: 12346)
Task 1: Running -> Finished (Exit: 0)
Task 2: Running -> Failed (Exit: 1)
[RETRY-1] Task 2: Failed -> Running (PID: 12347)
Task 2: Running -> Finished (Exit: 0)
```

## 智能失败恢复

### 跳过已完成任务

如果并行执行的其中某些子进程错误退出，再次执行此程序的命令可跳过成功完成的项只执行失败的子进程。

例如示例所示`input.sh`中的第2个和第3个子脚本出错，那么待`input.sh`退出后，修正子脚本的命令行，再重新运行或者投递`input.sh`即可。在重新运行`work.sh`时，annotask会自动跳过已经成功完成的子脚本，只运行出错的子脚本。

### 独立执行

所有并行执行的子进程相互独立，互不影响。一个任务的失败不会影响其他任务的执行。

### 退出码处理

如果并行执行的任意一个子进程退出码非0，最终annotask 也是非0退出，方便在脚本中判断任务是否全部成功。

## 项目管理和任务查询

### 项目管理

annotask 支持项目管理，可以为不同的任务设置不同的项目名称，方便管理和查询。

```bash
annotask -i input.sh -l 2 -p 4 --project myproject
```

### 任务状态查询

```bash
# 查询所有任务
annotask stat

# 查询特定项目
annotask stat -p myproject

# 查询并显示 Shell Path
annotask stat -p myproject -m
```

### 任务记录删除

```bash
# 删除整个项目
annotask delete -p myproject

# 删除特定模块
annotask delete -p myproject -m input
```

## 统计信息输出

annotask会统计成功运行子脚本数量以及运行失败子脚本数量输出到stdout，如果有运行失败的脚本会输出到annotask的stderr。

### 输出示例

标准错误流的输出：

```
[1 2 3 4 5]
All works: 5
Successed: 3
Error: 2
Err Shells:
2	/Volumes/RD/parrell_task/input.sh.shell/work_0002.sh
3	/Volumes/RD/parrell_task/input.sh.shell/work_0003.sh
```

## 配置文件支持

首次运行 `annotask` 时，会在程序所在目录自动创建 `annotask.yaml` 配置文件。配置文件包含：

- `db`: 全局数据库路径（记录所有任务）
- `project`: 默认项目名称
- `retry.max`: 最大重试次数
- `queue`: SGE 默认队列
- `node`: SGE 节点名称（qsubsge 模式会检查）
- `defaults`: 各参数的默认值

## 下一步

- [常见问题](/blogs/guide/faq.html) - 查看常见问题解答
- [线程分析](/blogs/advanced/thread-analysis.html) - 了解 annotask 的线程消耗

