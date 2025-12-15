---
title: 使用方法
---

# annotask 使用方法

## 运行模式

annotask 支持两种运行模式：

1. **Local 模式**（默认）：在本地并行执行任务
2. **QsubSge 模式**：将任务投递到 SGE 集群执行

## Local 模式

### 基本用法

```bash
# 方式 1: 直接使用选项参数（自动使用 local 模块）
annotask -i input.sh -l 2 -p 4 --project myproject

# 方式 2: 显式指定模块
annotask local -i input.sh -l 2 -p 4 --project myproject
```

::: tip 提示
从 v1.7.0 开始，annotask 采用模块化设计。直接使用选项参数（如 `-i file.sh`）时会自动使用 `local` 模块，也可以显式指定模块名称。
:::

### 参数说明

```
-i, --infile    输入文件，shell脚本格式（必需）
-l, --line      每几行作为一个任务单元（默认：1）
-p, --thread    最大并发任务数（默认：1）
    --project   项目名称（默认：从配置文件读取）
```

### 使用示例

```bash
annotask -i input.sh -l 2 -p 2 --project test
```

标准错误流的输出：

```
[1 2 3 4 5]
All works: 5
Successed: 3
Error: 2
Err Shells:
2	/Volumes/RD/parrell_task/input.sh.shell/task_0002.sh
3	/Volumes/RD/parrell_task/input.sh.shell/task_0003.sh
```

### 运行产生的目录结构

```
.
├── input.sh
├── input.sh.db
├── input.sh.log
└── input.sh.shell
    ├── task_0001.sh
    ├── task_0001.sh.e
    ├── task_0001.sh.o
    ├── task_0001.sh.sign
    ├── task_0002.sh
    ├── task_0002.sh.e
    ├── task_0002.sh.o
    ├── task_0003.sh
    ├── task_0003.sh.e
    ├── task_0003.sh.o
    ├── task_0004.sh
    ├── task_0004.sh.e
    ├── task_0004.sh.o
    ├── task_0004.sh.sign
    ├── task_0005.sh
    ├── task_0005.sh.e
    ├── task_0005.sh.o
    └── task_0005.sh.sign
```

**文件说明**：
- `input.sh.db`：本地任务数据库（SQLite）
- `input.sh.log`：实时监控日志文件
- `input.sh.shell/`：子脚本存放目录
- `task_XXXX.sh`：子脚本文件
- `task_XXXX.sh.o`：标准输出文件
- `task_XXXX.sh.e`：标准错误文件
- `task_XXXX.sh.sign`：成功标记文件（任务成功完成后自动创建）

## QsubSge 模式

### 基本用法

```bash
# 只设置 mem，DRMAA 投递时只使用 -l vf=XG（虚拟内存）
annotask qsubsge -i input.sh -l 2 -p 4 --project myproject --cpu 2 --mem 4

# 只设置 h_vmem，DRMAA 投递时只使用 -l h_vmem=XG（硬虚拟内存限制）
annotask qsubsge -i input.sh -l 2 -p 4 --project myproject --cpu 2 --h_vmem 8

# 同时设置 mem 和 h_vmem
annotask qsubsge -i input.sh -l 2 -p 4 --project myproject --cpu 2 --mem 4 --h_vmem 8

# 指定队列（单个或多个，逗号分隔）
annotask qsubsge -i input.sh --queue sci.q
annotask qsubsge -i input.sh --queue trans.q,nassci.q,sci.q

# 指定 SGE 项目（用于资源配额管理）
annotask qsubsge -i input.sh -P bioinformatics

# 使用 -pe smp 并行环境模式（默认）
annotask qsubsge -i input.sh --cpu 4 --h_vmem 5
# 或显式指定
annotask qsubsge -i input.sh --cpu 4 --h_vmem 5 --mode pe_smp

# 使用 -l p=X 模式
annotask qsubsge -i input.sh --cpu 4 --h_vmem 18 --mode num_proc
```

::: tip 提示
`qsubsge` 是一个独立的模块，必须显式指定模块名称。
:::

### 参数说明

```
-i, --infile        输入文件，shell脚本格式（必需）
-l, --line          每几行作为一个任务单元（默认：从配置文件读取）
-p, --thread        最大并发任务数（默认：从配置文件读取）
    --project       项目名称（默认：从配置文件读取）
    --cpu           CPU数量（默认：从配置文件读取）
    --mem           虚拟内存（vf）大小（GB，映射到 -l vf=XG，仅在显式设置时在DRMAA中使用）
    --h_vmem        硬虚拟内存限制（h_vmem）大小（GB，映射到 -l h_vmem=XG，仅在显式设置时在DRMAA中使用）
    --queue         队列名称（多个队列用逗号分隔，默认：从配置文件读取）
    -P, --sge-project SGE项目名称（用于资源配额管理，默认：从配置文件读取）
    --mode          并行环境模式：pe_smp（使用 -pe smp X，默认）或 num_proc（使用 -l p=X）
```

::: tip 内存参数说明
- `--mem` 和 `--h_vmem` 参数只有在用户显式设置时，才会在 DRMAA 投递时使用
- `--mem` 对应 SGE 的 `vf` 资源（虚拟内存），DRMAA 投递时使用 `-l vf=XG`
- `--h_vmem` 对应 SGE 的 `h_vmem` 资源（硬虚拟内存限制），DRMAA 投递时使用 `-l h_vmem=XG`
- 如果只设置了 `--mem`，DRMAA 投递时只包含 `-l vf=XG`，不包含 `-l h_vmem`
- 如果只设置了 `--h_vmem`，DRMAA 投递时只包含 `-l h_vmem=XG`，不包含 `-l vf`
- 如果都不设置，DRMAA 投递时不会包含内存相关参数
- 配置文件不再包含 `defaults.mem` 字段，内存参数必须通过命令行显式指定
:::

::: tip 并行环境模式说明（--mode）
- **pe_smp 模式**（默认，`--mode pe_smp`）：使用 `-pe smp X` 指定 CPU 数量
  - 示例：`--cpu 4 --h_vmem 5` → `-l h_vmem=5G -pe smp 4`
  - 这里的内存指的是单 CPU 需要消耗的内存
- **num_proc 模式**（`--mode num_proc`）：使用 `-l p=X` 指定 CPU 数量
  - 示例：`--cpu 4 --h_vmem 18 --mode num_proc` → `-l h_vmem=18G,p=4`
  - 这里的内存指的是总内存
:::

### 注意事项

- QsubSge 模式会检查当前节点是否在配置文件中的 `node` 列表中，以防止在计算节点误投递任务
- 如果配置文件中设置了 `node` 列表，当前节点必须在列表中才能使用 qsubsge 模式
- 如果 `node` 为空或不设置，则不对节点做限制
- 如果当前节点不在允许的列表中，程序会报错退出
- 任务会自动投递到 SGE 集群，输出文件会生成在子脚本所在目录（`{输入文件路径}.shell`）
- 输出文件格式为 `task_0001.sh.o.{jobID}` 和 `task_0001.sh.e.{jobID}`
- 例如：输入文件为 `input.sh`，子任务为 `task_0001.sh`，则输出文件为：
  - `input.sh.shell/task_0001.sh.o.{jobID}`（标准输出）
  - `input.sh.shell/task_0001.sh.e.{jobID}`（标准错误）

## 输入文件格式

`-i` 参数为一个shell脚本，例如`input.sh`这个shell脚本的内容示例如下：

```bash
blastn -db /seqyuan/nt -evalue 0.001 -outfmt 5  -query sample1_1.fasta -out sample1_1.xml -num_threads 4
python3 /seqyuan/bin/blast_xml2txt.py -i sample1_1.xml -o sample1_1.txt
blastn -db /seqyuan/nt -evalue 0.001 -outfmt 5  -query sample2_1.fasta -out sample2_1.xml -num_threads 4
python3 /seqyuan/bin/blast_xml2txt.py -i sample2_1.xml -o sample2_1.txt
blastn -db /seqyuan/nt -evalue 0.001 -outfmt 5  -query sample3_1.fasta -out sample3_1.xml -num_threads 4
python3 /seqyuan/bin/blast_xml2txt.py -i sample3_1.xml -o sample3_1.txt
blastn -db /seqyuan/nt -evalue 0.001 -outfmt 5  -query sample4_1.fasta -out sample4_1.xml -num_threads 4
python3 /seqyuan/bin/blast_xml2txt.py -i sample4_1.xml -o sample4_1.txt
```

### -l 参数说明

依照上面的示例，一共有10行命令，如果设置 `-l 2`，则每2行作为1个单位并行的执行。

### -p 参数说明

如果要对整个annotask程序所在进程的资源做限制，可设置`-p`参数，指定最多同时并行多少个子进程。

### annotask产生的文件

1. `input.sh.db`文件，此文件为sqlite数据库（本地任务数据库）
2. `input.sh.log`文件，实时监控日志文件
3. `input.sh.shell`目录，子脚本存放目录
4. 按照`-l`参数切割的input.sh的子脚本，存放在`input.sh.shell`目录
5. 子脚本命名格式：`task_0001.sh`（固定使用 `task` 作为前缀，最多支持9999个子任务）
6. 每个子脚本的标准输出和标准错误会分别保存到 `.o` 和 `.e` 文件
7. `task_XXXX.sh.sign`：成功标记文件（任务成功完成后自动创建）

## 模块化设计

从 v1.7.0 开始，annotask 采用模块化设计：

- **local**: 本地并行执行任务（默认模块，可直接使用选项参数）
- **qsubsge**: SGE 集群投递
- **stat**: 查询任务状态
- **delete**: 删除任务记录

### 查看模块列表

```bash
# 空运行程序显示模块列表
annotask
```

### 查看模块帮助

```bash
# 查看特定模块的帮助
annotask local --help
annotask qsubsge --help
annotask stat --help
annotask delete --help
```

## 任务状态查询

`stat` 模块用于查询全局数据库中的任务状态。根据是否使用 `-p` 参数，输出格式不同。

### 查询所有任务（无 `-p` 参数）

```bash
annotask stat
```

显示所有项目的汇总信息，格式为：`project module mode status statis stime etime`

**输出格式说明**：
- `project`: 项目名称
- `module`: 模块名称（输入文件的 basename）
- `mode`: 运行模式（`local` 或 `qsubsge`）
- `status`: 任务状态（`running`、`completed`、`failed` 或 `-`）
- `statis`: 任务统计，格式为 `已完成数/总任务数`（例如：`14/16` 表示总共16个任务，14个已完成）
- `stime`: 开始时间（MM-DD HH:MM 格式）
- `etime`: 结束时间（MM-DD HH:MM 格式，未结束显示 `-`）

**示例输出**：
```
project          module               mode       status     statis          stime        etime       
myproject        input                local      -          5/5             12-25 14:30  12-25 15:45
myproject        process              qsubsge    -          14/16           12-26 09:15  -
testproject      analysis             local      -          8/8             12-24 10:20  12-24 11:30
```

### 查询特定项目（使用 `-p` 参数）

```bash
annotask stat -p myproject
```

显示指定项目的详细任务信息。

**输出格式说明**：
- 第一部分：任务状态表格
  - `id`: 任务ID（数据库中的主键）
  - `module`: 模块名称
  - `pending`: 待处理任务数
  - `running`: 运行中任务数
  - `failed`: 失败任务数
  - `finished`: 已完成任务数
  - `stime`: 开始时间（MM-DD HH:MM 格式）
  - `etime`: 结束时间（MM-DD HH:MM 格式，未结束显示 `-`）
- 第二部分：任务ID和shell路径列表（空行分隔）
  - 格式：`id 完整shell路径`
  - 每个模块对应一行，用于快速定位任务文件

**示例输出**：
```
id     module               pending  running  failed   finished  stime        etime       
1      input                0        0        0        5         12-25 14:30  12-25 15:45
2      process              2        3        1        10        12-26 09:15  -

1 /absolute/path/to/input.sh
2 /absolute/path/to/process.sh
```

::: tip 提示
- 使用 `-p` 参数时，会自动显示 shellPath 列表，无需额外参数
- 时间格式统一为 "月-日 时:分"（例如：`12-25 14:30`）
- 任务状态 `status` 字段：
  - `running`: 有任务正在运行或待处理
  - `completed`: 所有任务已完成（无失败任务）
  - `failed`: 有任务失败
  - `-`: 状态未设置
:::

## 删除任务记录

`delete` 模块用于从全局数据库删除任务记录。支持按项目、模块或任务ID删除。

### 删除整个项目

```bash
annotask delete -p myproject
```

删除指定项目的所有任务记录。

### 删除特定模块

```bash
annotask delete -p myproject -m input
```

删除指定项目中特定模块的任务记录。

### 按任务ID删除

```bash
annotask delete -k 1
```

删除指定任务ID的记录（任务ID可通过 `annotask stat -p project` 命令查看）。

### 参数说明

```
-p, --project    项目名称（不使用 -k/--id 时为必需）
-m, --module    模块名称（输入文件 basename，不含扩展名，可选）
-k, --id        任务ID（使用此参数时不需要指定 -p 和 -m）
```

### 删除行为

**对于运行中的任务**：
- 会终止主进程（PID）及其所有子进程
- **qsubsge 模式**：使用 `qdel` 命令终止所有运行中的 SGE 作业，并将状态更新为 `failed`
- **local 模式**：将本地数据库中所有运行中的任务状态更新为 `failed`
- 然后从全局数据库中删除任务记录

**对于非运行中的任务**：
- 直接从全局数据库删除记录，不进行进程终止操作

### 使用示例

```bash
# 删除整个项目
annotask delete -p myproject

# 删除特定模块
annotask delete -p myproject -m input

# 按任务ID删除（任务ID可通过 stat -p 查看）
annotask delete -k 1
```

### 输出示例

```bash
# 删除运行中的项目
$ annotask delete -p myproject
Terminated main process (PID: 12345) and its children for module 'input'
Terminated SGE job 8944790 (task 1) using qdel
Terminated SGE job 8944791 (task 2) using qdel
Updated task 3 status to Failed
Deleted 2 task record(s) for project 'myproject'

# 删除特定模块
$ annotask delete -p myproject -m input
Deleted 1 task record(s) for project 'myproject' and module 'input'

# 按任务ID删除
$ annotask delete -k 1
Deleted 1 task record(s) with ID 1
```

::: warning 注意事项
- **删除操作不可逆**：删除任务记录后，无法恢复。请谨慎操作。
- **本地数据库**：`delete` 命令只删除全局数据库中的记录，不会删除本地数据库（`{输入文件路径}.db`）和任务文件
- **任务ID获取**：任务ID可以通过 `annotask stat -p project` 命令查看，输出中的 `id` 列即为任务ID
:::

## 其他使用方式

```bash
annotask -i input.sh -l 2 -p 2 --project test
```

我们可以把以上命令写入到`work.sh`里，然后把`work.sh`投递到SGE或者K8s计算节点

## 下一步

- [数据库结构](/blogs/guide/database.html) - 了解 annotask 的数据库结构
- [功能特性](/blogs/guide/features.html) - 深入了解 annotask 的功能特性

