# Couple Flying Chess

情侣飞行棋（Cloudflare Pages + Functions + D1 版本）。

## 项目结构

- `index.html`：前端页面（提交 + 随机抽取测试）
- `script.js`：前端交互逻辑
- `style.css`：基础样式
- `functions/api/submit.js`：提交关键词 API
- `functions/api/random.js`：随机抽取 API
- `schema.sql`：D1 建表 SQL
- `wrangler.toml`：本地调试配置模板

## 快速启动

1. 在 Cloudflare 创建 D1 数据库。
2. 执行 `schema.sql` 初始化表结构。
3. 在 Pages 项目中绑定 D1 变量名为 `DB`。
4. 连接此 GitHub 仓库并部署。

## 本地调试（可选）

安装 Wrangler 后执行：

`wrangler pages dev . --d1 DB=<your-d1-database-id>`
