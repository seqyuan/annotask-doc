---
title: 更新日志
date: 2025-01-27
---

# annotask 更新日志

## v1.5.0

### 新增功能

- 重命名包名为 annotask
- 添加 qsubsge 子命令支持SGE集群投递
- 添加自动重试机制（最多3次）
- 添加内存自适应重试
- 添加实时任务状态监控
- 添加项目管理和全局数据库
- 添加 stat 和 delete 子命令
- 支持 YAML 配置文件
- 数据库列名从 basename 改为 module

### 改进

- 优化任务状态监控性能
- 改进错误处理和日志输出
- 增强数据库查询功能

## v1.4.0

### 初始版本

- 支持本地并行执行任务
- 支持任务状态记录和查询
- 支持失败任务跳过和重试
- 基本的数据库功能

---

## 版本说明

### 版本号规则

annotask 使用语义化版本号（Semantic Versioning）：
- **主版本号**: 不兼容的 API 修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

### 获取最新版本

```bash
# 从 GitHub 安装最新版本
CGO_ENABLED=1 go install github.com/seqyuan/annotask/cmd/app@latest
```

### 查看版本信息

```bash
annotask -v
# 或
annotask --version
```

---

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进 annotask。

- GitHub: https://github.com/seqyuan/annotask
- Issues: https://github.com/seqyuan/annotask/issues

