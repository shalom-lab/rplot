# rplot — ggplot 精品科研图工具站

本地 + GitHub 收藏 ggplot2（及其生态）的科研 / 医学风格图，供教学与审美对照。图库同时收录真实论文原图与可复现的 ggplot2 教学示例；模拟数据示例在卡片备注中明确标注。 优先收录 SCI / 顶刊 OA 风格图；大图多面板已尽量按 A/B/C… **拆成单图**，卡片比例更友好。

**在线工具站（GitHub Pages）：** https://shalom-lab.github.io/rplot/

## 功能

- 浏览 `catalog.json` + `figures/`（**一文件一图**；无法合理拆分的分面/矩阵整图保留）
- 按 **category** 筛选 + **关键词**（标题 / tags / 备注）搜索
- 单图 **星标**（`localStorage`，无需密钥）
- 单图 **删除**（GitHub Contents API：更新 catalog + 删图；需确认；**BYOK**）
- 页面为暖色书架风工具站（React + Vite + Tailwind）

## 目录结构

```
rplot/
├── README.md
├── catalog.json          # ★ 机器可读主索引（中文 category / tags）
├── figures/              # 图片（一图一文件）
├── sources/catalog.md
├── site/                 # React + Vite + Tailwind SPA（Pages 源）
└── .github/workflows/pages.yml
```

## Pages 启用步骤

1. 仓库已 **Public**：`https://github.com/shalom-lab/rplot`
2. Settings → **Pages** → Build and deployment → Source 选 **GitHub Actions**
3. 推送 `main` 后查看 Actions 工作流 `Deploy GitHub Pages`
4. 站点地址：`https://shalom-lab.github.io/rplot/`（`base` 为 `/rplot/`）

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

- 可在站点右上角 **设置** 填写；也可事先在控制台注入。**启动会自动读取。**
- 点 **保存**：先测连 GitHub API，通过才写入；失败不保存。
- **清除**为站内确认框（非浏览器原生弹窗）。
- 浏览 / 筛选 / 星标 **不需要** token；删除需要。

```js
localStorage.setItem("gh-rplot-repo", "shalom-lab/rplot");
localStorage.setItem("gh-rplot-token", "ghp_your_pat_here");
```

## `catalog.json`

每条图：`id`、`file`、`title`、`source_url`、`paper_or_site`、`license`、`category`、`tags`（**最多 5**，优先中文）、`multipanel`、`note_zh`、`added`。

当前 **73** 张（其中 22 张为自制 ggplot2 示例）；分类示例：临床分布、分布展示、基因组学、多元分析、排名图、森林图、模型评估、流行病学…

```bash
jq '.figures[] | select(.category=="生存分析") | {id,file,tags}' catalog.json
```

## 许可

优先 CC BY / MIT / 包文档示例。标注 **CC BY-NC-ND** 的仅作参考，勿改编再分发。引用请回链 `paper_or_site`。

## 远程

GitHub：`shalom-lab/rplot`（public）。

