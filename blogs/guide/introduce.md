---
title: annotask 介绍
date: 2025-01-27
---

<p align="center">
  <img alt="annotask Logo" src="https://avatars2.githubusercontent.com/u/24697112?v=3&s=200" height="140" />
  <h3 align="center">annotask</h3>
  <p align="center">A go binaries for parallel task execution.</p>
</p>

---

# annotask

Annotation Task，并行任务执行工具

## 程序功能

> 程序适用于有很多运行时间短，但是需要运行很多的脚本，有助于减少投递的脚本。
> 例如有1000个cat 命令需要执行，这些命令间没有依赖关系，每个cat命令运行在2min左右

### 核心特性

1. **支持本地并行执行和 SGE 集群投递两种模式**
   - Local 模式：在本地并行执行任务
   - QsubSge 模式：将任务投递到 SGE 集群执行

2. **并行的线程数可指定**
   - 通过 `-p` 参数控制最大并发任务数
   - 灵活调整资源使用

3. **智能失败重试机制**
   - 如果并行执行的其中某些子进程错误退出，再次执行此程序的命令可跳过成功完成的项只执行失败的子进程
   - 所有并行执行的子进程相互独立，互不影响
   - 如果并行执行的任意一个子进程退出码非0，最终annotask 也是非0退出

4. **自动重试机制**
   - 失败的任务会自动重试，最多重试3次（可配置）
   - 如果任务因内存不足被SGE系统kill，下次重试时会自动将内存请求增加125%

5. **实时监控和统计**
   - annotask会统计成功运行子脚本数量以及运行失败子脚本数量输出到stdout
   - 如果有运行失败的脚本会输出到annotask的stderr
   - 实时监控任务状态，输出到标准输出

6. **项目管理和任务状态查询**
   - 支持项目管理和全局数据库
   - 支持任务状态查询（`stat` 子命令）
   - 支持任务记录删除（`delete` 子命令）

## 适用场景

annotask 特别适合以下场景：

- **批量任务处理**：需要执行大量相互独立的脚本或命令
- **短时任务并行**：每个任务运行时间较短（几分钟），但任务数量很多
- **集群任务管理**：需要在 SGE 集群上批量投递任务
- **失败任务重试**：需要自动重试失败的任务，避免手动重新运行

## 快速开始

### 基本使用示例

```bash
# Local 模式：并行执行任务
annotask -i input.sh -l 2 -p 4 --project myproject

# QsubSge 模式：投递到 SGE 集群
annotask qsubsge -i input.sh -l 2 -p 4 --project myproject --cpu 2 --mem 4
```

### 输入文件格式

`input.sh` 是一个包含多个命令的 shell 脚本：

```bash
echo 1
echo 11
echo 2
echo 22
echo 3
echo 33
```

使用 `-l 2` 参数时，每2行作为一个任务单元并行执行。

## 下一步

- [安装指南](/blogs/guide/installation.html) - 了解如何安装 annotask
- [使用方法](/blogs/guide/usage.html) - 学习如何使用 annotask
- [功能特性](/blogs/guide/features.html) - 深入了解 annotask 的功能

