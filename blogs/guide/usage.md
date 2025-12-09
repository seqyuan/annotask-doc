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
2	/Volumes/RD/parrell_task/input.sh.shell/work_0002.sh
3	/Volumes/RD/parrell_task/input.sh.shell/work_0003.sh
```

### 运行产生的目录结构

```
.
├── input.sh
├── input.sh.db
└── input.sh.shell
    ├── work_0001.sh
    ├── work_0001.sh.e
    ├── work_0001.sh.o
    ├── work_0001.sh.sign
    ├── work_0002.sh
    ├── work_0002.sh.e
    ├── work_0002.sh.o
    ├── work_0003.sh
    ├── work_0003.sh.e
    ├── work_0003.sh.o
    ├── work_0004.sh
    ├── work_0004.sh.e
    ├── work_0004.sh.o
    ├── work_0004.sh.sign
    ├── work_0005.sh
    ├── work_0005.sh.e
    ├── work_0005.sh.o
    └── work_0005.sh.sign
```

## QsubSge 模式

### 基本用法

```bash
# 不指定 h_vmem，将自动使用 mem * 1.25
annotask qsubsge -i input.sh -l 2 -p 4 --project myproject --cpu 2 --mem 4

# 或者手动指定 h_vmem
annotask qsubsge -i input.sh -l 2 -p 4 --project myproject --cpu 2 --mem 4 --h_vmem 8
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
    --mem           内存大小（GB，可选，显式设置时才会在 DRMAA 投递时使用）
    --h_vmem        虚拟内存大小（GB，可选，显式设置时才会在 DRMAA 投递时使用）
    --queue         队列名称（可选，支持多个队列，逗号分隔，例如：trans.q,nassci.q,sci.q）
    -P, --sge-project SGE 项目名称（可选，用于 SGE 资源配额管理）
```

::: tip 内存参数说明（v1.7.8+）
- `--mem` 和 `--h_vmem` 参数现在只在用户显式设置时才会在 DRMAA 投递时使用
- 如果用户只设置了 `--mem`，DRMAA 投递时只包含 `-l mem=XG`，不包含 `-l h_vmem`
- 如果用户只设置了 `--h_vmem`，DRMAA 投递时只包含 `-l h_vmem=XG`，不包含 `-l mem`
- 如果都不设置，DRMAA 投递时不会包含内存相关参数
- 配置文件不再包含 `defaults.mem` 字段，内存参数必须通过命令行显式指定
:::

### 注意事项

- QsubSge 模式会检查当前节点是否与配置文件中的 `node` 一致
- 如果不一致，程序会报错退出
- 任务会自动投递到 SGE 集群，输出文件会生成在子脚本所在目录（`{输入文件路径}.shell`）
- 输出文件格式为 `{文件前缀}_0001.o.{jobID}` 和 `{文件前缀}_0001.e.{jobID}`
- 例如：输入文件为 `input.sh`，子任务为 `input_0001.sh`，则输出文件为：
  - `input.sh.shell/input_0001.o.{jobID}`（标准输出）
  - `input.sh.shell/input_0001.e.{jobID}`（标准错误）

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
2. `input.sh.shell`目录，子脚本存放目录
3. 按照`-l`参数切割的input.sh的子脚本，存放在`input.sh.shell`目录
4. 子脚本命名格式：`{文件前缀}_0001.sh`（例如 `input.sh` 会生成 `input_0001.sh`，最多支持9999个子任务）
5. 每个子脚本的标准输出和标准错误会分别保存到 `.o` 和 `.e` 文件

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
- `statis`: 任务统计，格式为 `总任务数/待处理任务数`（例如：`10/2` 表示总共10个任务，还有2个待处理）
- `stime`: 开始时间（MM-DD HH:MM 格式）
- `etime`: 结束时间（MM-DD HH:MM 格式，未结束显示 `-`）

**示例输出**：
```
project          module               mode       status     statis          stime        etime       
myproject        input                local      completed  5/0             12-25 14:30  12-25 15:45
myproject        process              qsubsge    running    16/2            12-26 09:15  -
testproject      analysis             local      completed  8/0             12-24 10:20  12-24 11:30
```

### 查询特定项目（使用 `-p` 参数）

```bash
annotask stat -p myproject
```

显示指定项目的详细信息，格式为：`module pending running failed finished stime etime`，并在表格后显示 shellPath 列表。

**输出格式说明**：
- `module`: 模块名称
- `pending`: Pending 状态任务数
- `running`: Running 状态任务数
- `failed`: Failed 状态任务数
- `finished`: Finished 状态任务数
- `stime`: 开始时间（MM-DD HH:MM 格式）
- `etime`: 结束时间（MM-DD HH:MM 格式，未结束显示 `-`）

**ShellPath 列表格式**：
- 每个模块一行，格式为：`模块名_完整路径`
- 用于快速定位输入文件位置

**示例输出**：
```
module               pending  running  failed   finished  stime        etime       
input                0        0        0        5         12-25 14:30  12-25 15:45
process              2        1        3        10        12-26 09:15  -

input_/absolute/path/to/input.sh
process_/absolute/path/to/process.sh
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

### 删除整个项目

```bash
annotask delete -p myproject
```

### 删除特定模块

```bash
annotask delete -p myproject -m input
```

## 其他使用方式

```bash
annotask -i input.sh -l 2 -p 2 --project test
```

我们可以把以上命令写入到`work.sh`里，然后把`work.sh`投递到SGE或者K8s计算节点

## 下一步

- [数据库结构](/blogs/guide/database.html) - 了解 annotask 的数据库结构
- [功能特性](/blogs/guide/features.html) - 深入了解 annotask 的功能特性

