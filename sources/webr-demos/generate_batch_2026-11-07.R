#!/usr/bin/env Rscript
# WebR-friendly single-panel demos (ggplot2 + tidyverse core only).
# Packages used: ggplot2, dplyr, tidyr, scales, forcats, RColorBrewer, viridisLite, tibble
# Avoided (not reliably WebR / not installed): survminer, EnhancedVolcano, ComplexHeatmap,
# circlize, ggrepel, ggbeeswarm, ggridges, ggpubr, factoextra, survival.

# HARD RULE (2026-11-07): NEVER add panel letter tags in the image
# (no A/B/C/D, a)/b), （A）（B）, labs(tag=...), patchwork plot_annotation(tag_levels),
# annotate() corner letters, or cowplot/ggdraw panel labels). Single-panel figures only.

suppressPackageStartupMessages({
  library(ggplot2)
  library(dplyr)
  library(tidyr)
  library(scales)
  library(forcats)
  library(tibble)
})

OUT <- "/workspace/rplot/figures"
dir.create(OUT, showWarnings = FALSE, recursive = TRUE)
set.seed(20261107)

# Nature / Lancet-ish theme
theme_sci <- function(base_size = 12) {
  theme_classic(base_size = base_size) %+replace%
    theme(
      plot.title = element_text(face = "bold", size = base_size + 1, hjust = 0, margin = margin(b = 6)),
      plot.subtitle = element_text(size = base_size - 1, colour = "grey35", hjust = 0, margin = margin(b = 8)),
      axis.title = element_text(size = base_size),
      axis.text = element_text(colour = "grey20", size = base_size - 1),
      axis.line = element_line(colour = "grey25", linewidth = 0.4),
      axis.ticks = element_line(colour = "grey25", linewidth = 0.35),
      legend.title = element_text(size = base_size - 1, face = "bold"),
      legend.text = element_text(size = base_size - 1),
      legend.background = element_blank(),
      plot.margin = margin(10, 14, 10, 10),
      strip.background = element_blank(),
      strip.text = element_text(face = "bold", size = base_size)
    )
}

pal_lancet <- c("#E64B35", "#4DBBD5", "#00A087", "#3C5488", "#F39B7F", "#8491B4", "#91D1C2", "#DC0000")
pal_nature <- c("#E64B35FF", "#4DBBD5FF", "#00A087FF", "#3C5488FF", "#F39B7FFF", "#8491B4FF")

save_fig <- function(p, id, w = 7.2, h = 5.6, dpi = 180) {
  path <- file.path(OUT, paste0(id, ".png"))
  ggsave(path, p, width = w, height = h, dpi = dpi, bg = "white")
  message("wrote ", path)
  invisible(path)
}

# ---------- 1. Lollipop AUC ranking ----------
auc_df <- tibble(
  biomarker = c("Signature-A", "Signature-B", "CRP", "IL-6", "PD-L1 CPS",
                "TMB", "NLR", "Age", "LDH", "Albumin"),
  auc = c(0.86, 0.81, 0.74, 0.72, 0.70, 0.68, 0.64, 0.58, 0.57, 0.55)
) %>% mutate(biomarker = fct_reorder(biomarker, auc))

p1 <- ggplot(auc_df, aes(auc, biomarker)) +
  geom_segment(aes(x = 0.5, xend = auc, y = biomarker, yend = biomarker),
               colour = "grey75", linewidth = 0.7) +
  geom_point(aes(colour = auc), size = 4.2) +
  geom_vline(xintercept = 0.7, linetype = "dashed", colour = "grey50", linewidth = 0.35) +
  scale_colour_gradient(low = "#4DBBD5", high = "#E64B35", guide = "none") +
  scale_x_continuous(limits = c(0.5, 0.95), breaks = seq(0.5, 0.9, 0.1),
                     expand = expansion(mult = c(0, 0.02))) +
  labs(title = "Biomarker discrimination (AUC)",
       subtitle = "Univariable ROC against binary clinical endpoint",
       x = "Area under the ROC curve", y = NULL) +
  theme_sci()
save_fig(p1, "webr-lollipop-auc-rank", 7.0, 5.5)

# ---------- 2. OR forest (univariable) ----------
forest_df <- tibble(
  term = c("Age ≥65", "Male sex", "BMI ≥30", "Smoking", "Diabetes",
           "Hypertension", "Stage III–IV", "High CRP", "Low albumin"),
  or = c(1.22, 0.94, 1.41, 1.68, 1.35, 1.18, 2.45, 1.92, 1.55),
  lo = c(0.98, 0.77, 1.12, 1.31, 1.05, 0.95, 1.88, 1.48, 1.21),
  hi = c(1.52, 1.15, 1.78, 2.15, 1.74, 1.47, 3.19, 2.49, 1.99)
) %>% mutate(term = fct_rev(factor(term, levels = term)),
             sig = hi < 1 | lo > 1)

p2 <- ggplot(forest_df, aes(or, term)) +
  geom_vline(xintercept = 1, linetype = "dashed", colour = "grey45", linewidth = 0.4) +
  geom_errorbar(aes(xmin = lo, xmax = hi, colour = sig), width = 0.18, linewidth = 0.55) +
  geom_point(aes(colour = sig, fill = sig), shape = 21, size = 3.2, stroke = 0.6) +
  scale_colour_manual(values = c("FALSE" = "#8491B4", "TRUE" = "#E64B35"), guide = "none") +
  scale_fill_manual(values = c("FALSE" = "#8491B4", "TRUE" = "#E64B35"), guide = "none") +
  scale_x_log10(breaks = c(0.5, 1, 2, 3), labels = c("0.5", "1", "2", "3")) +
  coord_cartesian(xlim = c(0.7, 3.5)) +
  labs(title = "Univariable odds ratios for adverse outcome",
       subtitle = "Log scale; red = 95% CI excludes 1",
       x = "Odds ratio (95% CI)", y = NULL) +
  theme_sci()
save_fig(p2, "webr-forest-or-covariates", 7.2, 5.8)

# ---------- 3. Classic volcano ----------
n_genes <- 8000
vol <- tibble(
  gene = paste0("G", seq_len(n_genes)),
  log2FC = rnorm(n_genes, 0, 1.05),
  neglog10p = pmin(rexp(n_genes, rate = 0.55) + abs(log2FC) * runif(n_genes, 0.2, 1.4), 12)
) %>% mutate(
  padj_proxy = 10^(-neglog10p),
  class = case_when(
    log2FC > 1 & neglog10p > 1.3 ~ "Up",
    log2FC < -1 & neglog10p > 1.3 ~ "Down",
    TRUE ~ "NS"
  )
)

p3 <- ggplot(vol, aes(log2FC, neglog10p, colour = class)) +
  geom_point(alpha = 0.55, size = 1.15, stroke = 0) +
  geom_hline(yintercept = 1.3, linetype = "dashed", colour = "grey50", linewidth = 0.35) +
  geom_vline(xintercept = c(-1, 1), linetype = "dashed", colour = "grey50", linewidth = 0.35) +
  scale_colour_manual(values = c(Down = "#3C5488", NS = "grey75", Up = "#E64B35"), name = NULL) +
  scale_x_continuous(limits = c(-4.5, 4.5), expand = expansion(mult = 0.02)) +
  labs(title = "Differential expression volcano",
       subtitle = "Thresholds: |log2FC| > 1 and −log10(p) > 1.3",
       x = expression(log[2]~"fold change"),
       y = expression(-log[10]~italic(p))) +
  theme_sci() +
  theme(legend.position = c(0.88, 0.88), legend.direction = "vertical")
save_fig(p3, "webr-volcano-rnaseq", 6.8, 5.8)

# ---------- 4. Correlation heatmap (geom_tile) ----------
labs_n <- c("WBC", "Neu", "Lym", "Mono", "PLT", "Hb", "CRP", "Alb", "LDH", "Cre")
k <- length(labs_n)
Rmat <- matrix(0, k, k)
diag(Rmat) <- 1
# structured correlations
pairs <- list(c(1,2,0.82), c(1,3,-0.45), c(2,3,-0.55), c(1,4,0.35),
              c(5,6,0.28), c(7,8,-0.48), c(7,9,0.42), c(8,10,0.33),
              c(2,7,0.38), c(3,8,0.41), c(6,8,0.36), c(9,10,0.22))
for (pr in pairs) {
  i <- pr[1]; j <- pr[2]; r <- pr[3]
  Rmat[i, j] <- r; Rmat[j, i] <- r
}
# fill mild residual noise then project to PSD-ish by clamping
set.seed(7)
for (i in 1:k) for (j in 1:k) if (Rmat[i,j] == 0 && i != j) {
  v <- rnorm(1, 0, 0.08); Rmat[i,j] <- v; Rmat[j,i] <- v
}
hm <- expand_grid(x = labs_n, y = labs_n) %>%
  mutate(r = as.vector(Rmat),
         x = factor(x, levels = labs_n),
         y = factor(y, levels = rev(labs_n)))

p4 <- ggplot(hm, aes(x, y, fill = r)) +
  geom_tile(colour = "white", linewidth = 0.4) +
  geom_text(aes(label = sprintf("%.2f", r)), size = 2.6,
            colour = ifelse(abs(hm$r) > 0.55, "white", "grey15")) +
  scale_fill_gradient2(low = "#3C5488", mid = "white", high = "#E64B35",
                       midpoint = 0, limits = c(-1, 1), name = "r") +
  coord_fixed() +
  labs(title = "Clinical laboratory correlation matrix",
       subtitle = "Pearson r among routine blood biomarkers",
       x = NULL, y = NULL) +
  theme_sci() +
  theme(axis.line = element_blank(), axis.ticks = element_blank(),
        legend.position = "right")
save_fig(p4, "webr-heatmap-clinical-cor", 6.6, 5.8)

# ---------- 5. Violin + box + jitter by stage ----------
set.seed(11)
clin <- tibble(
  stage = factor(rep(c("I", "II", "III", "IV"), each = 55), levels = c("I","II","III","IV")),
  score = c(rnorm(55, 2.1, 0.55), rnorm(55, 2.6, 0.6),
            rnorm(55, 3.4, 0.7), rnorm(55, 4.1, 0.75))
)

p5 <- ggplot(clin, aes(stage, score, fill = stage)) +
  geom_violin(width = 0.85, alpha = 0.35, colour = NA, trim = FALSE) +
  geom_boxplot(width = 0.18, outlier.shape = NA, alpha = 0.9, linewidth = 0.35) +
  geom_jitter(width = 0.12, height = 0, size = 1.1, alpha = 0.45, colour = "grey25") +
  scale_fill_manual(values = c("#4DBBD5", "#00A087", "#F39B7F", "#E64B35"), guide = "none") +
  labs(title = "Circulating signature score by clinical stage",
       subtitle = "Violin + box + jitter (n = 55 per stage)",
       x = "AJCC stage", y = "Signature score (z)") +
  theme_sci()
save_fig(p5, "webr-violin-stage-biomarker", 6.8, 5.5)

# ---------- 6. Calibration curve ----------
set.seed(21)
n <- 400
pred <- sort(runif(n, 0.05, 0.95))
obs <- rbinom(n, 1, pred * 0.85 + 0.07)
cal <- tibble(pred = pred, obs = obs) %>%
  mutate(bin = cut(pred, breaks = seq(0, 1, by = 0.1), include.lowest = TRUE)) %>%
  group_by(bin) %>%
  summarise(pred_mean = mean(pred), obs_rate = mean(obs), n = n(), .groups = "drop") %>%
  mutate(se = sqrt(obs_rate * (1 - obs_rate) / n),
         lo = pmax(0, obs_rate - 1.96 * se),
         hi = pmin(1, obs_rate + 1.96 * se))

p6 <- ggplot(cal, aes(pred_mean, obs_rate)) +
  geom_abline(slope = 1, intercept = 0, linetype = "dashed", colour = "grey50", linewidth = 0.45) +
  geom_ribbon(aes(ymin = lo, ymax = hi), fill = "#4DBBD5", alpha = 0.18) +
  geom_line(colour = "#3C5488", linewidth = 0.9) +
  geom_point(aes(size = n), colour = "#E64B35", alpha = 0.9) +
  scale_size_area(max_size = 8, name = "n") +
  scale_x_continuous(limits = c(0, 1), breaks = seq(0, 1, 0.2), labels = percent_format()) +
  scale_y_continuous(limits = c(0, 1), breaks = seq(0, 1, 0.2), labels = percent_format()) +
  coord_equal() +
  labs(title = "Model calibration (decile bins)",
       subtitle = "Predicted risk vs observed event rate with 95% CI",
       x = "Predicted probability", y = "Observed event rate") +
  theme_sci()
save_fig(p6, "webr-calibration-curve", 6.4, 5.8)

# ---------- 7. PCA scores ----------
set.seed(33)
mk_grp <- function(n, mx, my, sx = 1.1, sy = 1.0) {
  tibble(PC1 = rnorm(n, mx, sx), PC2 = rnorm(n, my, sy))
}
pca <- bind_rows(
  mk_grp(80, -2.2, -1.5) %>% mutate(group = "Control"),
  mk_grp(80, 0.3, 0.2) %>% mutate(group = "Early"),
  mk_grp(80, 2.4, 1.8) %>% mutate(group = "Advanced")
) %>% mutate(group = factor(group, levels = c("Control", "Early", "Advanced")))

# Convex hulls without MASS
hulls <- pca %>% group_by(group) %>% slice(chull(PC1, PC2)) %>% ungroup()
p7 <- ggplot(pca, aes(PC1, PC2, colour = group, fill = group)) +
  geom_polygon(data = hulls, alpha = 0.12, linewidth = 0.45, colour = NA) +
  geom_point(size = 2.2, alpha = 0.75, stroke = 0) +
  scale_colour_manual(values = c(Control = "#8491B4", Early = "#00A087", Advanced = "#E64B35"), name = NULL) +
  scale_fill_manual(values = c(Control = "#8491B4", Early = "#00A087", Advanced = "#E64B35"), guide = "none") +
  labs(title = "PCA of transcriptomic profiles",
       subtitle = "PC1 / PC2 scores with convex hulls by group",
       x = "PC1 (28% variance)", y = "PC2 (15% variance)") +
  theme_sci() +
  theme(legend.position = c(0.14, 0.88))
save_fig(p7, "webr-pca-scores-groups", 6.8, 5.6)

# ---------- 8. Overlapping densities (no ggridges) ----------
set.seed(41)
dens <- bind_rows(
  tibble(value = rnorm(400, 4.8, 0.55), group = "Healthy"),
  tibble(value = rnorm(400, 5.3, 0.65), group = "Benign"),
  tibble(value = rnorm(400, 6.4, 0.85), group = "Malignant")
) %>% mutate(group = factor(group, levels = c("Healthy", "Benign", "Malignant")))

p8 <- ggplot(dens, aes(value, fill = group, colour = group)) +
  geom_density(alpha = 0.28, linewidth = 0.7) +
  scale_fill_manual(values = c("#4DBBD5", "#F39B7F", "#E64B35"), name = NULL) +
  scale_colour_manual(values = c("#4DBBD5", "#F39B7F", "#E64B35"), guide = "none") +
  labs(title = "Serum marker density by diagnosis",
       subtitle = "Kernel density estimates (n = 400 per group)",
       x = "log10(marker concentration)", y = "Density") +
  theme_sci() +
  theme(legend.position = c(0.82, 0.85))
save_fig(p8, "webr-density-overlap-labs", 7.0, 5.4)

# ---------- 9. Dumbbell pre/post ----------
set.seed(51)
dumb <- tibble(
  patient = paste0("P", sprintf("%02d", 1:12)),
  before = c(7.8, 8.2, 6.9, 9.1, 7.4, 8.8, 6.5, 9.4, 7.1, 8.0, 7.6, 8.5),
  after = before - runif(12, 1.2, 3.2)
) %>%
  mutate(patient = fct_reorder(patient, before),
         delta = after - before)

dumb_long <- dumb %>%
  pivot_longer(c(before, after), names_to = "time", values_to = "score") %>%
  mutate(time = factor(time, levels = c("before", "after"),
                       labels = c("Baseline", "Week 12")))

p9 <- ggplot(dumb, aes(y = patient)) +
  geom_segment(aes(x = before, xend = after, yend = patient),
               colour = "grey70", linewidth = 0.8) +
  geom_point(data = dumb_long, aes(x = score, colour = time), size = 3.2) +
  scale_colour_manual(values = c("Baseline" = "#8491B4", "Week 12" = "#E64B35"), name = NULL) +
  labs(title = "Symptom score before vs after treatment",
       subtitle = "Dumbbell plot; each line is one patient",
       x = "Symptom score (0–10)", y = NULL) +
  theme_sci() +
  theme(legend.position = "top", legend.justification = "left")
save_fig(p9, "webr-dumbbell-prepost", 7.0, 5.8)

# ---------- 10. Bubble subgroup OR ----------
set.seed(61)
bub <- tibble(
  subgroup = c("Overall", "Age <65", "Age ≥65", "Male", "Female",
               "Never smoker", "Ever smoker", "PD-L1 <1%", "PD-L1 ≥1%",
               "TMB-low", "TMB-high"),
  or = c(0.72, 0.68, 0.79, 0.70, 0.75, 0.81, 0.64, 0.88, 0.58, 0.84, 0.55),
  lo = c(0.58, 0.51, 0.60, 0.54, 0.55, 0.60, 0.48, 0.66, 0.42, 0.64, 0.38),
  hi = c(0.89, 0.91, 1.04, 0.91, 1.02, 1.09, 0.85, 1.17, 0.80, 1.10, 0.79),
  n = c(820, 490, 330, 460, 360, 300, 520, 350, 470, 400, 420)
) %>% mutate(
  subgroup = fct_rev(factor(subgroup, levels = subgroup)),
  favours = or < 1 & hi < 1
)

p10 <- ggplot(bub, aes(or, subgroup)) +
  geom_vline(xintercept = 1, linetype = "dashed", colour = "grey45") +
  geom_errorbar(aes(xmin = lo, xmax = hi), width = 0.15, colour = "grey40", linewidth = 0.45) +
  geom_point(aes(size = n, colour = favours), alpha = 0.9) +
  scale_size_area(max_size = 12, name = "n") +
  scale_colour_manual(values = c("FALSE" = "#8491B4", "TRUE" = "#00A087"), guide = "none") +
  scale_x_log10(breaks = c(0.4, 0.6, 0.8, 1, 1.2), limits = c(0.35, 1.3)) +
  labs(title = "Treatment effect across clinical subgroups",
       subtitle = "Hazard ratio (bubble ∝ sample size); teal = CI favours treatment",
       x = "Hazard ratio (95% CI)", y = NULL) +
  theme_sci()
save_fig(p10, "webr-bubble-subgroup-hr", 7.2, 6.0)

# ---------- 11. Stacked immune cell proportions ----------
set.seed(71)
cells <- c("CD8 T", "CD4 T", "Treg", "B cell", "NK", "Macrophage", "Neutrophil", "Other")
imm <- expand_grid(
  sample = paste0("S", 1:8),
  cell = cells
) %>%
  group_by(sample) %>%
  mutate(raw = rexp(n(), rate = 1),
         prop = raw / sum(raw),
         cell = factor(cell, levels = rev(cells))) %>%
  ungroup()

p11 <- ggplot(imm, aes(sample, prop, fill = cell)) +
  geom_col(width = 0.78, colour = "white", linewidth = 0.25) +
  scale_fill_manual(values = rev(c("#E64B35","#F39B7F","#4DBBD5","#00A087",
                                   "#3C5488","#8491B4","#91D1C2","#B09C85")),
                    name = "Cell type") +
  scale_y_continuous(labels = percent_format(), expand = expansion(mult = c(0, 0.02))) +
  labs(title = "Tumour microenvironment cell fractions",
       subtitle = "Relative abundance per sample (stacked composition)",
       x = NULL, y = "Proportion") +
  theme_sci() +
  theme(legend.position = "right")
save_fig(p11, "webr-stacked-immune-prop", 7.4, 5.6)

# ---------- 12. Incidence ribbon over years ----------
set.seed(81)
years <- 2005:2024
inc <- tibble(
  year = years,
  rate = 18 + (years - 2005) * 0.55 + sin((years - 2005) / 2.5) * 1.2 + rnorm(length(years), 0, 0.35),
) %>% mutate(
  lo = rate - 1.4,
  hi = rate + 1.4
)

p12 <- ggplot(inc, aes(year, rate)) +
  geom_ribbon(aes(ymin = lo, ymax = hi), fill = "#4DBBD5", alpha = 0.25) +
  geom_line(colour = "#3C5488", linewidth = 1.05) +
  geom_point(colour = "#E64B35", size = 2.2) +
  scale_x_continuous(breaks = seq(2005, 2025, 5)) +
  labs(title = "Age-standardised incidence over time",
       subtitle = "Per 100 000 person-years with illustrative uncertainty band",
       x = "Year", y = "Incidence rate") +
  theme_sci()
save_fig(p12, "webr-incidence-ribbon", 7.2, 5.2)

message("DONE: generated 12 WebR-friendly figures")
