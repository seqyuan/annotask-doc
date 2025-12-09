---
title: annotask 介绍
---

<p align="center">
  <img alt="annotask Logo" src="https://avatars2.githubusercontent.com/u/24697112?v=3&s=200" height="140" />
  <h3 align="center">annotask</h3>
  <p align="center">A go binaries for parallel task execution.</p>
</p>

---

# annotask

Annoroad parallel task monitor tool，并行任务执行工具。将 shell 脚本按行拆分，支持本地并行执行或投递到 SGE 集群运行。

## 核心功能

annotask 适用于执行大量相似、相互独立的脚本任务，通过并行执行和智能重试机制，显著减少任务投递次数和管理成本。

### 双模式执行

- **Local 模式**：本地并行执行，通过 goroutine pool 控制并发数
- **QsubSge 模式**：通过 DRMAA 库投递到 SGE 集群，支持多队列和资源配额管理

### 智能重试与恢复

- **自动重试**：失败任务自动重试，最多 3 次（可配置）
- **内存自适应**：检测内存不足错误，自动增加 125% 内存重试（向上取整）
- **断点续传**：基于 SQLite 数据库，支持跳过已完成任务，只执行失败任务

### 实时监控

- **表格格式输出**：实时显示任务状态（Running/Failed/Finished）、任务ID、退出码等
- **状态持久化**：本地数据库记录每个任务详情，全局数据库支持跨项目查询

### 模块化设计

- **local**：本地并行执行
- **qsubsge**：SGE 集群投递
- **stat**：任务状态查询
- **delete**：任务记录删除

## 适用场景

- 批量处理大量相互独立的短时任务（如 1000 个运行 2 分钟的 cat 命令）
- 需要在 SGE 集群上批量投递任务
- 需要自动重试失败任务，减少手动干预
- 需要任务状态持久化和历史记录查询



### 基本使用示例

```bash
# Local 模式：并行执行任务
annotask -i input.sh -l 2 -p 4 --project myproject
# 或者显式指定模块
annotask local -i input.sh -l 2 -p 4 --project myproject

# QsubSge 模式：投递到 SGE 集群
annotask qsubsge -i input.sh -l 2 -p 4 --project myproject --cpu 2 --mem 4
```

### 输入文件格式

`input.sh` 是一个包含多个命令的 shell 脚本：

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

使用 `-l 2` 参数时，每2行作为一个任务单元并行执行。

## 下一步

- [安装指南](/blogs/guide/installation.html) - 了解如何安装 annotask
- [使用方法](/blogs/guide/usage.html) - 学习如何使用 annotask
- [功能特性](/blogs/guide/features.html) - 深入了解 annotask 的功能

