---
title: 安装指南
---

# 安装 annotask

### 安装前提
1. SQLite3 开发库
2. DRMAA 库（如果使用 qsubsge 模式）
3. Go 编译器 1.22.2 或更高版本

### 安装命令
```bash
# 设置 Grid Engine DRMAA 路径，并使用 rpath 嵌入库路径
export CGO_CFLAGS="-I/opt/gridengine/include"
export CGO_LDFLAGS="-L/opt/gridengine/lib/lx-amd64 -ldrmaa -Wl,-rpath,/opt/gridengine/lib/lx-amd64"
export LD_LIBRARY_PATH=/opt/gridengine/lib/lx-amd64:$LD_LIBRARY_PATH

# 安装（从 GitHub 下载并编译指定版本）
CGO_ENABLED=1 go install github.com/seqyuan/annotask/cmd/annotask@v1.7.7
```

```bash
which annotask
```
## 配置文件

首次运行 `annotask` 时，会在程序所在目录自动创建 `annotask.yaml` 配置文件。配置文件包含：

- `db`: 全局数据库路径（记录所有任务）
- `project`: 默认项目名称
- `retry.max`: 最大重试次数
- `queue`: SGE 默认队列
- `node`: SGE 节点名称（qsubsge 模式会检查）
- `defaults`: 各参数的默认值

配置文件示例见 `annotask.yaml.example`。

## 全局数据库权限设置

如果多个用户或多进程需要访问全局数据库（配置文件中 `db` 字段指定的路径），需要设置相应的文件权限：

```bash
# 假设全局数据库路径为 /path/to/annotask.db
# 对上一级文件夹设置权限
chmod 777 $(dirname /path/to/annotask.db)

# 对数据库文件设置权限
chmod 777 /path/to/annotask.db
```

这样确保所有用户和进程都可以读取和写入全局数据库。


## Tips
#### 如何查找环境变量

如果不知道 Grid Engine 的安装路径，可以使用以下命令查找：

```bash
# 查找 drmaa.h 头文件位置
find /opt/gridengine -name "drmaa.h" 2>/dev/null

# 查找 libdrmaa.so 库文件位置
find /opt/gridengine -name "libdrmaa.so*" 2>/dev/null
```

找到路径后：
- 将头文件所在目录设置为 `CGO_CFLAGS`（例如：`-I/opt/gridengine/include`）
- 将库文件所在目录设置为 `CGO_LDFLAGS`（例如：`-L/opt/gridengine/lib/lx-amd64 -ldrmaa`）
- 如果使用方法 1（rpath），在 `CGO_LDFLAGS` 中添加 `-Wl,-rpath,/opt/gridengine/lib/lx-amd64`
- 编译时也需要设置 `LD_LIBRARY_PATH` 以便链接器找到库



## 卸载

```bash
# 删除可执行文件
rm $(go env GOPATH)/bin/annotask
```

## 下一步

安装完成后，可以查看：
- [使用方法](/blogs/guide/usage.html) - 学习如何使用 annotask
- [功能特性](/blogs/guide/features.html) - 了解 annotask 的功能

