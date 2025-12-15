---
title: 功能特性
---

# annotask 功能特性

annotask 是一个模块化的并行任务执行工具，采用 Go 语言开发，具有以下核心特性：

## 核心架构

### 模块化设计

annotask 采用模块化架构，将功能拆分为独立的模块：

- **local**: 本地并行执行模式
- **qsubsge**: SGE 集群投递模式
- **stat**: 任务状态查询
- **delete**: 任务记录删除

每个模块职责单一，便于维护和扩展。

## 自动重试机制

annotask 提供了强大的自动重试机制，确保任务能够成功执行。

### 重试策略

- **自动重试**：失败的任务会自动重试，最多重试3次（可在配置文件中通过 `retry.max` 修改）
- **重试轮次**：程序会进行多轮重试，每轮重试所有失败的任务
- **重试记录**：重试次数记录在数据库的 `retry` 列中
- **状态持久化**：任务状态保存在 SQLite 数据库中，程序重启后可以继续重试
- **模式限制**：只有 qsubsge 模式支持自动重试，local 模式不支持自动重试

### 重试流程

1. 任务执行失败后，状态更新为 `Failed`，`retry` 字段递增
2. 主循环检测到失败任务，根据 `retry` 值判断是否达到最大重试次数
3. 如果未达到，将任务状态重置为 `Pending`，等待下一轮执行
4. 如果达到最大重试次数，任务保持 `Failed` 状态

### 重试示例

在监控输出中，可以看到重试过程：

```
try    task   status      taskid     exitcode time        
1:3    0001   Running     3652318    -        12-09 10:24 
1:3    0002   Finished    3652315    0        12-09 10:25 
1:3    0003   Failed      3652312    1        12-09 10:26 
2:3    0003   Running     3652320    -        12-09 10:27 
2:3    0003   Failed      3652320    1        12-09 10:28 
3:3    0003   Running     3652325    -        12-09 10:29 
3:3    0003   Finished    3652325    0        12-09 10:30 
```

其中 `try` 列显示 `当前轮次:最大重试次数`。

## 内存自适应重试

在 qsubsge 模式下，annotask 实现了智能的内存自适应重试机制。

### 内存错误检测

annotask 会检测以下情况，判断任务是否因内存不足失败：

1. **退出码检测**：退出码为 137（通常表示进程被 SIGKILL 信号终止，可能是 OOM killer）
2. **错误日志检测**：在任务的 `.e` 错误输出文件中搜索内存相关关键词

### 内存自适应策略

当检测到内存不足错误时，annotask 会：

1. **智能参数识别**：根据用户显式设置的参数，只增加相应参数的内存
   - 如果用户只设置了 `--mem`，只增加 `mem`（增加125%，使用 `math.Ceil` 向上取整）
   - 如果用户只设置了 `--h_vmem`，只增加 `h_vmem`（增加125%，向上取整）
   - 如果用户同时设置了两个参数，两个都增加（增加125%，向上取整）
   - 如果用户都没有设置，不进行内存增加（v1.7.8+ 新特性）

2. **内存值更新**：将增加后的内存值保存到数据库的 `mem` 和 `h_vmem` 列

3. **自动重试**：在下一轮重试时，使用更新后的内存值重新投递任务

### 内存自适应示例

假设初始内存设置为 4GB（只设置了 `--mem`）：

- **第1次尝试**：`mem=4GB`，任务失败（内存不足）
- **第2次尝试**：`mem=5GB`（4 * 1.25 = 5，向上取整），任务失败
- **第3次尝试**：`mem=7GB`（5 * 1.25 = 6.25，向上取整为 7），任务成功

如果同时设置了 `--mem 4` 和 `--h_vmem 5`：

- **第1次尝试**：`mem=4GB, h_vmem=5GB`，任务失败
- **第2次尝试**：`mem=5GB, h_vmem=7GB`（4*1.25=5, 5*1.25=6.25向上取整为7），任务成功

### 内存参数行为（v1.7.8+）

从 v1.7.8 开始，内存参数行为发生重要变化：

- **显式设置原则**：`--mem` 和 `--h_vmem` 参数只在用户显式设置时才会在 DRMAA 投递时使用
- **灵活控制**：用户可以根据需要只设置 `mem` 或只设置 `h_vmem`，或者两者都设置

## 任务状态监控

annotask在运行时会启动一个独立的goroutine实时监控任务状态，并将状态变化以表格格式输出到日志文件。

### 监控输出格式

监控输出采用表格格式，包含以下列：

```
try    task   status     taskid     exitcode time        
1:3    0001   Running    3652318    -        12-09 10:24 
1:3    0002   Running    3652321    -        12-09 10:24 
1:3    0003   Failed     3652312    1        12-09 10:25 
1:3    0004   Finished   3652315    0        12-09 10:26 
```

**列说明**：
- `try`: 当前重试轮次/最大重试次数（例如：`1:3` 表示第1轮，最多3次）
- `task`: 任务编号（4位数字，例如：`0001`）
- `status`: 任务状态（Running, Failed, Finished）
- `taskid`: 任务ID（local模式为PID，qsubsge模式为Job ID）
- `exitcode`: 退出码（如果任务已完成，未完成显示 `-`）
- `time`: 时间（MM-DD HH:MM格式）

**注意**：
- 监控输出写入到日志文件 `{输入文件路径}.log`（例如：`input.sh.log`），而不是标准输出
- 表头只在第一次输出时显示一次
- Pending 状态的任务不会显示在监控输出中
- 时间格式为"月-日 时:分"（例如：`12-09 10:24`）
- 默认更新间隔为 60 秒，可通过配置文件中的 `monitor_update_interval` 参数自定义

### 查看监控日志

```bash
# 实时查看监控日志
tail -f input.sh.log

# 查看最近的监控日志
tail -n 100 input.sh.log
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
# 查询所有任务（显示所有项目的汇总表格）
annotask stat

# 查询特定项目（显示项目详情表格 + shellPath 列表）
annotask stat -p myproject
```


**输出格式说明**：

- **无 `-p` 参数**：显示所有项目的汇总表格，包含 `project module mode status statis stime etime` 列
- **有 `-p` 参数**：显示项目详情表格（`module pending running failed finished stime etime`）+ shellPath 列表

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

首次运行 `annotask` 时，会在程序所在目录自动创建 `annotask.yaml` 配置文件。

### 配置项说明

- `db`: 全局数据库路径（记录所有任务）
- `project`: 默认项目名称
- `retry.max`: 最大重试次数（默认：3）
- `queue`: SGE 默认队列（支持多个队列，逗号分隔，例如：`trans.q,nassci.q,sci.q`）
- `sge_project`: SGE 项目名称（用于资源配额管理，可选）
- `node`: SGE 节点名称（qsubsge 模式会检查，为空时自动使用当前主机名）
- `defaults`: 各参数的默认值
  - `line`: 默认行数（每几行作为一个任务单元）
  - `thread`: 默认并发数（最大并发任务数）
  - `cpu`: 默认CPU数（qsubsge 模式）


### 多队列支持

从 v1.7.8 开始，`queue` 配置项支持多个队列，使用逗号分隔：

```yaml
queue: "trans.q,nassci.q,sci.q"
```

在命令行中也可以使用 `--queue` 参数指定：

```bash
annotask qsubsge -i input.sh --queue trans.q,nassci.q,sci.q
```

### SGE 项目支持

从 v1.7.8 开始，支持通过 `-P/--sge-project` 参数指定 SGE 项目名称，用于资源配额管理：

```bash
annotask qsubsge -i input.sh -P myproject
```

如果未设置，DRMAA 投递时不使用 `-P` 参数。

## 数据库持久化

### 本地任务数据库

每个输入脚本对应一个本地 SQLite 数据库（`{脚本名}.db`），记录每个子任务的详细状态：

- 任务状态（Pending, Running, Failed, Finished）
- 退出码
- 重试次数
- 开始/结束时间
- 任务ID（local 模式为 PID，qsubsge 模式为 Job ID）
- 资源信息（CPU、内存等，qsubsge 模式）

### 全局任务数据库

全局数据库（`annotask.db`）记录所有任务的总体状态，支持跨项目查询和管理：

- 项目名称和模块名称
- 任务统计信息（总数、Pending、Failed、Running、Finished）
- 启动和结束时间
- 输入文件路径

### 状态持久化优势

- **断点续传**：程序中断后可以继续执行未完成的任务
- **失败恢复**：自动跳过已完成的任务，只执行失败的任务
- **历史记录**：保留所有任务的执行历史，便于分析和审计

## 任务执行流程

### Local 模式流程

1. **脚本分割**：根据 `-l` 参数将输入脚本分割成多个子脚本
2. **数据库初始化**：创建本地数据库，初始化任务记录（状态为 Pending）
3. **并发执行**：使用 goroutine pool 控制并发数，执行子脚本
4. **状态更新**：实时更新任务状态到数据库
5. **重试机制**：检测失败任务，进行多轮重试
6. **结果统计**：输出成功/失败统计信息

### QsubSge 模式流程

1. **脚本分割**：同 Local 模式
2. **数据库初始化**：同 Local 模式
3. **DRMAA 提交**：通过 DRMAA 库提交任务到 SGE 集群
4. **状态监控**：定期查询 SGE 任务状态，更新到数据库
5. **内存自适应**：检测内存错误，自动增加内存重试
6. **结果统计**：同 Local 模式

## 下一步

- [常见问题](/blogs/guide/faq.html) - 查看常见问题解答
- [线程分析](/blogs/advanced/thread-analysis.html) - 了解 annotask 的线程消耗
- [数据库结构](/blogs/guide/database.html) - 深入了解数据库设计

