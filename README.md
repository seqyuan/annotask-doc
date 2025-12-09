---
home: true
modules:
  - BannerBrand
  - Blog
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
blog:
  socialLinks:
    - { icon: 'LogoGithub', link: 'https://github.com/seqyuan/annotask-doc' }
isShowTitleInHome: true
actionText: 关于
actionLink: /blogs/guide/introduce
---

## 核心特性

### 🚀 双模式支持
- **Local 模式**：在本地并行执行任务
- **QsubSge 模式**：将任务投递到 SGE 集群执行

### 🔄 智能重试
- 失败任务自动重试，最多重试3次（可配置）
- 内存自适应：如果任务因内存不足被kill，自动增加125%内存重试

### 📊 实时监控
- 实时监控任务状态，输出到标准输出
- 支持项目管理和任务状态查询


### 基本使用

```bash
# Local 模式
annotask -i input.sh -l 2 -p 4 --project myproject

# QsubSge 模式
annotask qsubsge -i input.sh -l 2 -p 4 --project myproject --cpu 2 --mem 4
```

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

