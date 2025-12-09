---
title: 数据库结构
---

# annotask 数据库结构

annotask 使用 SQLite3 数据库来记录任务状态。系统中有两种数据库：

1. **本地任务数据库**：每个输入脚本对应一个数据库
2. **全局任务数据库**：记录所有任务的总体状态

## 本地任务数据库（input.sh.db）

annotask会针对每一个输入脚本，在脚本所在目录生成`脚本名称`+`.db`的sqlite3数据库，用于记录各`子脚本`的运行状态，例如`input.sh`对应的数据库名称为`input.sh.db`

### job 表结构

`input.sh.db`这个sqlite3数据库有1个名为`job`的table，`job`主要包含以下几列：

```
Id          INTEGER PRIMARY KEY AUTOINCREMENT  # 自增ID
subJob_num  INTEGER UNIQUE NOT NULL            # 子任务编号
shellPath   TEXT                               # 子脚本路径
status      TEXT                               # 任务状态
exitCode    INTEGER                            # 退出码
retry       INTEGER DEFAULT 0                 # 重试次数
starttime   DATETIME                           # 开始时间
endtime     DATETIME                           # 结束时间
mode        TEXT DEFAULT 'local'               # 运行模式（local/qsubsge）
cpu         INTEGER DEFAULT 1                 # CPU数量（qsubsge模式）
mem         INTEGER DEFAULT 1                 # 内存大小（GB，qsubsge模式）
h_vmem      INTEGER DEFAULT 1                 # 虚拟内存大小（GB，qsubsge模式，未设置时默认为mem*1.25）
taskid      TEXT                               # 任务ID（local模式为PID，qsubsge模式为Job ID）
```

### 字段说明

- **subJob_num**: 表示记录的是第几个子脚本
- **shellPath**: 对应子脚本路径
- **status**: 对应子脚本的状态，状态有4种: `Pending`、`Failed`、`Running`、`Finished`
- **exitCode**: 对应子脚本的退出码
- **retry**: 如果子脚本出错的情况下annotask程序自动重新尝试运行该出错子进程的次数（最多3次）
- **starttime**: 子脚本开始运行的时间
- **endtime**: 子脚本结束运行的时间
- **mode**: 运行模式：`local` 或 `qsubsge`
- **taskid**: 任务ID：local模式存储进程PID，qsubsge模式存储SGE Job ID

## 全局任务数据库（annotask.db）

annotask会在程序所在目录创建全局数据库`annotask.db`（路径可在配置文件中修改），用于记录所有任务的总体状态。

### tasks 表结构

`annotask.db`包含一个`tasks`表，主要字段：

```
Id              INTEGER PRIMARY KEY AUTOINCREMENT
usrID           TEXT NOT NULL                    # 用户ID
project         TEXT NOT NULL                    # 项目名称
module          TEXT NOT NULL                    # 模块名称（输入文件basename）
mode            TEXT NOT NULL                    # 运行模式
starttime       DATETIME NOT NULL                # 启动时间
endtime         DATETIME                         # 结束时间
shellPath       TEXT NOT NULL                    # 输入文件完整路径
totalTasks      INTEGER DEFAULT 0                # 子任务总数
pendingTasks    INTEGER DEFAULT 0                # Pending状态任务数
failedTasks     INTEGER DEFAULT 0                # Failed状态任务数
runningTasks    INTEGER DEFAULT 0                # Running状态任务数
finishedTasks   INTEGER DEFAULT 0               # Finished状态任务数
```

### 字段说明

- **usrID**: 用户ID
- **project**: 项目名称
- **module**: 模块名称（输入文件的basename）
- **mode**: 运行模式（`local` 或 `qsubsge`）
- **starttime**: 任务启动时间
- **endtime**: 任务结束时间（如果任务还在运行则为空）
- **shellPath**: 输入文件的完整路径
- **totalTasks**: 子任务总数
- **pendingTasks**: Pending状态任务数
- **failedTasks**: Failed状态任务数
- **runningTasks**: Running状态任务数
- **finishedTasks**: Finished状态任务数

## 任务状态说明

任务状态有以下几种：

- **Pending**: 任务已创建，等待执行
- **Running**: 任务正在执行中
- **Finished**: 任务执行完成（退出码为0）
- **Failed**: 任务执行失败（退出码非0）

## 数据库查询示例

### 查询本地任务数据库

```bash
# 使用 sqlite3 命令行工具查询
sqlite3 input.sh.db "SELECT * FROM job WHERE status='Failed';"
```

### 查询全局任务数据库

```bash
# 使用 sqlite3 命令行工具查询
sqlite3 annotask.db "SELECT * FROM tasks WHERE project='myproject';"
```

### 使用 annotask 命令查询

```bash
# 查询所有任务
annotask stat

# 查询特定项目
annotask stat -p myproject
```

## 数据库维护

### 备份数据库

```bash
# 备份本地任务数据库
cp input.sh.db input.sh.db.backup

# 备份全局任务数据库
cp annotask.db annotask.db.backup
```

### 删除任务记录

```bash
# 删除整个项目
annotask delete -p myproject

# 删除特定模块
annotask delete -p myproject -m input
```

::: warning 注意
删除任务记录只会删除全局任务数据库中的记录，不会删除本地任务数据库文件。如果需要删除本地任务数据库，需要手动删除对应的 `.db` 文件。
:::

## 下一步

- [功能特性](/blogs/guide/features.html) - 了解 annotask 的功能特性
- [常见问题](/blogs/guide/faq.html) - 查看常见问题解答

