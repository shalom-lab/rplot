# 图源目录（catalog）

所有图片保存在 `../figures/`。下列 URL 为下载时可用的公开页面或 CDN；许可以原文为准。

## 推荐三甲（最值得先看）

1. **`aging-escc-forest-km-multipanel.jpg`** — 食管癌 TME：左右森林图 + 下方多组 KM，典型「一页多图」医学投稿布局。
2. **`scirep-risk-km-roc-heatmap-5panel.jpg`** — 风险评分散点 / 生存状态 / KM+风险表 / 时依 ROC / 热图，生信预后模型教科书拼版。
3. **`ggforestplot-biomarker-facets.png`** — 代谢标志物 × 心血管性状分面森林图，斑马底纹与空心/实心显著性编码极干净。

---

## 条目明细

### 1. aging-escc-forest-km-multipanel.jpg
- **标题**: Tumor microenvironment characterization in esophageal cancer… — Figure 1
- **来源**: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8751614/ ；图 CDN: https://cdn.ncbi.nlm.nih.gov/pmc/blobs/6c5b/8751614/7f4a4f94da5c/aging-13-203800-g001.jpg
- **许可**: CC BY 3.0
- **多面板**: 是（森林图 A + KM B）
- **为何牛**: 医学投稿常见「森林图 + 生存曲线」拼版，颜色与 HR/CI 标注齐全。

### 2. aging-tcga-hr-forest.jpg
- **标题**: 同上 — Figure 6（TCGA 多癌种 TMEscore HR 森林图）
- **来源**: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8751614/ ；CDN: https://cdn.ncbi.nlm.nih.gov/pmc/blobs/6c5b/8751614/e3ddf377b51f/aging-13-203800-g006.jpg
- **许可**: CC BY 3.0
- **多面板**: 否（单幅宽表+图）
- **为何牛**: 文本列 + 对数尺度森林图 + 红/蓝显著性配色，临床荟萃感强。

### 3. plos-beta-range-forest.png
- **标题**: Say farewell to bland regression reporting… — Fig 4（beta-range forest）
- **来源**: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0297033 ；大图: https://journals.plos.org/plosone/article/figure/image?size=large&id=10.1371/journal.pone.0297033.g004
- **许可**: CC BY 4.0
- **多面板**: 否
- **为何牛**: 纯 ggplot2 教程论文；多结局 dodge 误差条 + 零效应红线，社科/公卫回归可视化范本。

### 4. plos-ridgeline-hematology.png
- **标题**: 同上 — Fig 5（血液学标志物 ridge / joyplot）
- **来源**: 同上；大图 id=…g005
- **许可**: CC BY 4.0
- **多面板**: 否
- **为何牛**: ggridges 风格展示多结局系数分布，医学实验室指标场景直观。

### 5. plos-classic-meta-forest.png
- **标题**: 同上 — Fig 3（经典 meta 风格森林图讲解）
- **来源**: 同上；大图 id=…g003
- **许可**: CC BY 4.0
- **多面板**: 否
- **为何牛**: 标准方块+菱形汇总效应，适合教「什么叫森林图」。

### 6. srplot-biomed-gallery-9panel.jpg
- **标题**: SRplot… — Figure 3（A–I 生物医学图类型总览）
- **来源**: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10635526/ ；CDN: https://cdn.ncbi.nlm.nih.gov/pmc/blobs/ba59/10635526/ab8e1d721595/pone.0294236.g003.jpg
- **许可**: CC BY 4.0
- **多面板**: 是（9 格：热图/序列 logo/富集柱/Circos/SNP 密度/火山/KM/弦图/相关）
- **为何牛**: 一页扫完生信常用图种；含 KM 与 EnhancedVolcano 风火山图。

### 7. survminer-km-risktable-censor.png
- **标题**: survminer README — uber-platinium-premium customized survival plot
- **来源**: https://github.com/kassambara/survminer ；raw: https://raw.githubusercontent.com/kassambara/survminer/master/tools/README-ggplot2-uber-platinium-premium-customized-survival-plot-1.png
- **许可**: 包 GPL-2；示例图随仓库公开
- **多面板**: 是（曲线 + 风险表 + 删失计数，对齐时间轴）
- **为何牛**: 医学期刊最常见的 KM「全家桶」版式教科书示例。

### 8. ggforestplot-biomarker-facets.png
- **标题**: ggforestplot vignette — biomarker × cardiometabolic trait forest
- **来源**: https://nightingalehealth.github.io/ggforestplot/articles/ggforestplot.html ；图: …/unnamed-chunk-6-1.png
- **许可**: MIT（包）
- **多面板**: 是（按代谢物类别 facet，自由高度）
- **为何牛**: 流行病学研究感强；实心/空心点编码显著性，版式极干净。

### 9. rgg-manhattan-gwas-annotated.png
- **标题**: R Graph Gallery — Manhattan plot（带 ggrepel 注释）
- **来源**: https://r-graph-gallery.com/101_Manhattan_plot.html ；图: …/unnamed-chunk-8-1.png
- **许可**: 图库 MIT
- **多面板**: 否
- **为何牛**: GWAS 经典曼哈顿 + 峰位点标签，医学遗传必备图型。

### 10. rgg-circular-manhattan.jpg
- **标题**: R Graph Gallery — Circular Manhattan
- **来源**: https://r-graph-gallery.com/101_Manhattan_plot.html ；图: https://r-graph-gallery.com/img/graph/Cir_Manhtn.P.jpg
- **许可**: 图库 MIT
- **多面板**: 否（环形单图）
- **为何牛**: 圆形曼哈顿视觉冲击强，适合封面/综述级展示。

### 11. scirep-risk-km-roc-heatmap-5panel.jpg
- **标题**: Exploration of m7G-related immune genes… — Fig 5
- **来源**: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC13237151/ ；CDN: https://cdn.ncbi.nlm.nih.gov/pmc/blobs/2793/13237151/9d432cdeb200/41598_2026_47456_Fig5_HTML.jpg
- **许可**: CC BY-NC-ND 4.0（**仅本地参考；勿改编再分发**）
- **多面板**: 是（5 面板：风险点图/生存状态/KM/ROC/热图）
- **为何牛**: 肿瘤预后模型「标准套餐」拼图，survminer 痕迹明显。

### 12. scirep-tide-violin-boxplot-2panel.jpg
- **标题**: 同上 — Fig 8（TIDE 箱线 + TME violin）
- **来源**: 同上；CDN: …/41598_2026_47456_Fig8_HTML.jpg
- **许可**: CC BY-NC-ND 4.0（仅本地参考）
- **多面板**: 是（A/B）
- **为何牛**: ggpubr/ggsignif 风格显著性标注 + 分组小提琴，医学差异比较常用。

### 13. fimmu-mutation-enrichment-4panel.jpg
- **标题**: Frontiers Immunol. 炎症/焦亡预后签名 — Figure 2
- **来源**: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC13384851/ ；CDN: https://cdn.ncbi.nlm.nih.gov/pmc/blobs/b9a4/13384851/8ec6c2aa15a6/fimmu-17-1721849-g002.jpg
- **许可**: CC BY 4.0
- **多面板**: 是（A–D）
- **为何牛**: 突变瀑布 + 柱/棒棒糖 + 富集气泡；**注**: A 面板偏 maftools/ComplexHeatmap，B–D 更偏 ggplot 家族，作「拼版审美」参考。

### 14. psp-ggplot-facet-ad-longitudinal.jpg
- **标题**: Application of ggplot2 to Pharmacometric Graphics — Fig 7
- **来源**: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3817376/ ；CDN: https://cdn.ncbi.nlm.nih.gov/pmc/blobs/790b/3817376/75189b612d05/psp201356f7.jpg
- **许可**: CC BY-NC-ND 3.0（仅本地参考）
- **多面板**: 是（ggplot / lattice / base 对照；顶行是 ggplot 分面）
- **为何牛**: 经典教程：阿尔茨海默病程分面纵向散点+平滑，展示 ggplot facet 优势。

---

## 检索时跳过 / 受阻项

- PMC 部分页面对自动化抓取有 reCAPTCHA；改用 `cdn.ncbi.nlm.nih.gov/pmc/blobs/...` 与 journals.plos.org 大图接口。
- 未整本抓取付费 PDF；未创建 GitHub 远端仓库。
- 跳过了明显 drab 默认主题、仓库 OG 社交预览图、以及无法核验为真实论文/图库的素材。
