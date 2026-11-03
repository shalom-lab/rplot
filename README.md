# rplot — ggplot 精品科研图工具站

本地 + GitHub 收藏一组**真实可下载**的 ggplot2（及 ggplot 生态）科研 / 医学风格图，供教学与审美对照。**不造假、不 AI 编图。**

**在线工具站（GitHub Pages）：** https://shalom-lab.github.io/rplot/

## 功能

- 浏览 `catalog.json` + `figures/`（一文件一图；多面板保留整图）
- 按 **category** 筛选 + **关键词**（标题 / tags / 备注）搜索
- 单图 **星标**（`localStorage`，无需密钥）
- 单图 **删除**（GitHub Contents API：更新 catalog + 删图；需确认；**BYOK**）
- 页面紧凑、小圆角工具站风格（React + Vite + Tailwind）

## 目录结构

```
rplot/
├── README.md
├── catalog.json          # ★ 机器可读主索引
├── figures/              # 图片（一图一文件）
├── sources/catalog.md
├── site/                 # React + Vite + Tailwind SPA（Pages 源）
└── .github/workflows/pages.yml
```

## Pages 启用步骤

1. 仓库已 **Public**：`https://github.com/shalom-lab/rplot`
2. Settings → **Pages** → Build and deployment → Source 选 **GitHub Actions**
3. 若组织限制 Pages：Org Settings → Policies 允许 Pages，或仓库 Settings 打开 Pages
4. 推送 `main` 后查看 Actions 工作流 `Deploy GitHub Pages`
5. 站点地址：`https://shalom-lab.github.io/rplot/`（`base` 为 `/rplot/`）

本地预览：

```bash
cd site
npm install
npm run dev
```

## BYOK（删除功能）

密钥**只**放浏览器 `localStorage`，**永不**写入仓库 / `.env` / Actions。

| Key | 含义 | 示例 |
|-----|------|------|
| `gh-rplot-repo` | `owner/name` | `shalom-lab/rplot` |
| `gh-rplot-token` | GitHub PAT（需对仓库 Contents 写权限） | `ghp_…` / `github_pat_…` |

- 可在站点右上角 **齿轮（设置）** 填写；也可事先在控制台注入。**启动会自动读取。**
- 点 **保存**：先测连 GitHub API，通过才写入；失败不保存。
- **清除**需二次确认。
- 浏览 / 筛选 / 星标 **不需要** token；删除需要。

控制台预注入示例：

```js
localStorage.setItem("gh-rplot-repo", "shalom-lab/rplot");
localStorage.setItem("gh-rplot-token", "ghp_your_pat_here");
```

## `catalog.json`

每条图：`id`、`file`、`title`、`source_url`、`paper_or_site`、`license`、`category`、`tags`（**最多 5**）、`multipanel`、`note_zh`、`added`。

```bash
jq '.figures[] | select(.category=="survival") | {id,file,tags}' catalog.json
```

## 许可

优先 CC BY / MIT / 包文档示例。标注 **CC BY-NC-ND** 的仅作参考，勿改编再分发。引用请回链 `paper_or_site`。

## 规模

见 `catalog.json` → `figure_count`。远程：`shalom-lab/rplot`（public）。
