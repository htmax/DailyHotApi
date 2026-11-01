# 今日热榜 API · 中文说明

> 本文件记录 [htmax/DailyHotApi](https://github.com/htmax/DailyHotApi) 这份 fork 的自建改动与部署方式。上游完整说明见 [`README.md`](./README.md)。

聚合各平台热榜的接口服务，部署后由 OpenResty 反代到 **<https://hot.htmax.cn>**，供「今日热榜」前端与「六十秒晨报」站点调用。

## 这份 fork 改了什么

| 分类 | 改动 |
| --- | --- |
| 数据源 | 地震数据改走 Wolfx CENC 源（原接口不稳定） |
| 路由 | 修复快手、微博两条路由的取数与字段映射 |
| 类型 | 路由类型改为内联，去掉一处上游遗留的类型阻塞 |
| 构建 | Dockerfile 固定 `pnpm@9`、基础镜像固定 `node:22.23.4-alpine`；修正容器内 uid/gid 过大导致的问题 |
| 编排 | `docker-compose.yml` 改为与实际运行容器一致：固定镜像 tag `dailyhot-api:local`、只监听 `127.0.0.1:6688`、显式 `ALLOWED_HOST` |

## 本地开发

```bash
pnpm install
pnpm dev           # 默认 http://localhost:6688
pnpm build
pnpm start
```

接口形如 `https://hot.htmax.cn/bilibili`、`/weibo`、`/zhihu` …… 当前收录 **56 个平台路由**（见 `src/routes/`）。

## 部署

```bash
docker compose up -d --build
```

- 容器只监听 `127.0.0.1:6688`，公网入口是 OpenResty 反代的 `hot.htmax.cn`
- 镜像 tag 固定为 `dailyhot-api:local`，不会被上游镜像覆盖
- 环境变量：`PORT=6688`、`NODE_ENV=docker`、`ALLOWED_HOST=hot.htmax.cn`、`REQUEST_TIMEOUT=15000`、`USE_LOG_FILE=false`

## 许可

上游 DailyHotApi 与本项目均为 MIT。抓取内容版权归原平台所有，仅作聚合展示用途。
