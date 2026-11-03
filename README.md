# rplot — ggplot 精品科研图参考集

本地 + GitHub 收藏一组**真实可下载**的 ggplot2（及 ggplot 生态）科研 / 医学风格图，供 `hello-r`、`r-post` 等教学与审美对照。**不造假、不 AI 编图。**

## 目录结构

```
rplot/
├── README.md        # 本说明（总索引）
├── catalog.json     # ★ 机器可读主索引（权威来源）
├── figures/         # 全部图片
└── sources/
    └── catalog.md   # 指向 catalog.json 的简短说明（不再维护长列表）
```

## `catalog.json` 怎么用

每条图含字段：`id`、`file`、`title`、`source_url`、`paper_or_site`、`license`、`category`、`tags`（**最多 5 个**）、`multipanel`、`note_zh`、`added`。

- **`category`**：一张图一个主类（如 `survival` / `forest` / `genomics` / `epidemiology` / `distribution` / `spatial` …），方便按主题浏览。
- **`tags`**：补充关键词，硬上限 5 个，只留最有用的（图型、包名、领域）。

用 jq 举例：

```bash
jq '.figures[] | select(.category=="survival") | {id,file,tags}' catalog.json
jq '.figures[] | select(.tags|index("volcano")) | .file' catalog.json
```

## 亮点（先看这些）

| 文件 | 为何值得看 |
|------|------------|
| `figures/aging-escc-forest-km-multipanel.jpg` | 森林图 + KM 一页多图（医学投稿范本） |
| `figures/scirep-risk-km-roc-heatmap-5panel.jpg` | 风险评分 / KM / ROC / 热图五联 |
| `figures/ggforestplot-biomarker-facets.png` | 代谢标志物分面森林图 |
| `figures/ggalluvial-vaccination-survey.png` | 疫苗态度冲积图（公卫流转） |
| `figures/upset-orthogroups-rgg.png` | 基因组 UpSet 交集 |
| `figures/raincloud-allen-classic.jpg` | 经典雨云图（Wellcome OA） |
| `figures/enhancedvolcano-de-labelled.png` | 差异表达火山图 |
| `figures/doseresponse-alcohol-cvd.jpg` | 剂量–反应曲线 + CI |

完整点评与许可见 `catalog.json` 的 `note_zh` / `license`。

## 许可提醒

优先收录 CC BY / MIT / 包文档示例。标注 **CC BY-NC-ND** 的条目仅作本地参考，勿改编再分发。引用请回链 `paper_or_site`。

## 规模

见 `catalog.json` → `figure_count`（见 `catalog.json` 的 `figure_count`；一文件一图；多面板原文整图保留不裁切；主题尽量不重样）。

## 远程

GitHub：`shalom-lab/rplot`（与公开姐妹仓 `hello-r` 一致为 public）。推送前请确认许可与署名。
