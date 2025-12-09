---
title: 常见问题
---

# annotask 常见问题

## 并行子进程中其中有些子进程出错怎么办？

例如示例所示`input.sh`中的第2个和第3个子脚本出错，那么待`input.sh`退出后，修正子脚本的命令行，再重新运行或者投递`input.sh`即可。在重新运行`work.sh`时，annotask会自动跳过已经成功完成的子脚本，只运行出错的子脚本。

如果任务失败，annotask会自动重试（最多3次），无需手动重新运行。

## 编译错误: "drmaa.h: No such file or directory"

**原因**: 系统未安装 DRMAA 开发库

**解决方案**:
- 如果不需要 qsubsge 模式，可以忽略此错误（不影响local模式）
- 如果需要 qsubsge 模式，必须安装 DRMAA 库（通常随SGE系统一起安装）

**Ubuntu/Debian:**
```bash
sudo apt-get install -y libdrmaa1.0 libdrmaa-dev
```

## 编译错误: "sqlite3.h: No such file or directory"

**原因**: 系统未安装 SQLite3 开发库

**解决方案**: 按照安装说明安装 libsqlite3-dev 或 sqlite-devel

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

## QsubSge 模式报错: "current node does not match config node"

**原因**: 当前节点与配置文件中的`node`设置不一致

**解决方案**: 
- 修改配置文件中的`node`为当前节点名称
- 或者将`node`设置为空字符串（会自动使用当前主机名）

### 查看当前节点名称

```bash
hostname
```

### 修改配置文件

编辑 `annotask.yaml` 文件，修改 `node` 字段：

```yaml
node: ""  # 空字符串表示自动使用当前主机名
# 或者
node: "your-node-name"  # 设置为当前节点名称
```

## 如何设置合适的并发数（-p 参数）？

### Local 模式

- **CPU 密集型任务**: 建议设置为 CPU 核心数
- **I/O 密集型任务**: 可以设置更高（如 CPU 核心数的 2-4 倍）
- **混合型任务**: 建议设置为 CPU 核心数的 1-2 倍

### QsubSge 模式

- 可以设置较高（如 50-100），因为只是提交和监控
- 实际执行在 SGE 节点，不受本地资源限制
- 建议根据网络和 DRMAA 库性能调整

## 任务一直处于 Pending 状态怎么办？

可能的原因：

1. **并发数限制**: 当前运行的任务数已达到 `-p` 参数设置的最大值
2. **SGE 队列问题**: 在 qsubsge 模式下，SGE 队列可能已满或资源不足
3. **数据库锁定**: 数据库可能被锁定，尝试删除 `.db` 文件重新运行

### 检查方法

```bash
# 查看任务状态
annotask stat

# 查看 SGE 队列状态（qsubsge 模式）
qstat
```

## 如何查看任务的详细日志？

每个子任务的标准输出和标准错误会分别保存到 `.o` 和 `.e` 文件：

- Local 模式: `input.sh.shell/work_0001.sh.o` 和 `input.sh.shell/work_0001.sh.e`
- QsubSge 模式: `input.sh.shell/work_0001.sh.o.{jobID}` 和 `input.sh.shell/work_0001.sh.e.{jobID}`

### 查看日志

```bash
# 查看标准输出
cat input.sh.shell/work_0001.sh.o

# 查看标准错误
cat input.sh.shell/work_0001.sh.e
```

## 如何清理已完成的任务记录？

### 删除任务记录

```bash
# 删除整个项目
annotask delete -p myproject

# 删除特定模块
annotask delete -p myproject -m input
```

### 手动删除数据库文件

```bash
# 删除本地任务数据库
rm input.sh.db

# 删除全局任务数据库（谨慎操作）
rm annotask.db
```

::: warning 注意
删除全局任务数据库会删除所有任务记录，请谨慎操作。
:::

## 任务重试次数如何修改？

在配置文件 `annotask.yaml` 中修改 `retry.max` 字段：

```yaml
retry:
  max: 3  # 最大重试次数，可以修改为其他值
```


## 下一步

- [使用方法](/blogs/guide/usage.html) - 了解更多使用技巧
- [线程分析](/blogs/advanced/thread-analysis.html) - 了解 annotask 的资源消耗

