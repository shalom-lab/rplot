#!/usr/bin/env Rscript
# Batch 2 — WebR-safe single-panel SCI-style demos
# Packages: ggplot2, dplyr, tidyr, scales, forcats, tibble (+ base)
# Avoided: survminer, survival, EnhancedVolcano, ComplexHeatmap, circlize,
#          ggrepel, ggbeeswarm, ggridges, ggpubr, factoextra, MASS ellipses

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

save_fig <- function(p, id, w = 7.2, h = 5.6, dpi = 180) {
  path <- file.path(OUT, paste0(id, ".png"))
  ggsave(path, p, width = w, height = h, dpi = dpi, bg = "white")
  message("wrote ", path)
  invisible(path)
}

# ---- 1. RECIST waterfall ----
set.seed(101)
wf <- tibble(
  id = paste0("P", sprintf("%02d", 1:36)),
  change = sort(c(runif(8, -95, -40), runif(10, -39, -1),
                  runif(6, 0, 19), runif(12, 20, 95)), decreasing = TRUE)
) %>% mutate(
  resp = case_when(
    change <= -30 ~ "PR/CR",
    change < 20 ~ "SD",
    TRUE ~ "PD"
  ),
  id = fct_reorder(id, change)
)

p1 <- ggplot(wf, aes(id, change, fill = resp)) +
  geom_col(width = 0.82, colour = NA) +
  geom_hline(yintercept = c(-30, 20), linetype = "dashed",
             colour = "grey50", linewidth = 0.35) +
  geom_hline(yintercept = 0, colour = "grey30", linewidth = 0.4) +
  scale_fill_manual(values = c("PR/CR" = "#00A087", "SD" = "#4DBBD5", "PD" = "#E64B35"),
                    name = "RECIST") +
  scale_y_continuous(breaks = seq(-100, 100, 25),
                     labels = function(x) paste0(x, "%")) +
  labs(title = "Best percentage change in target lesions",
       subtitle = "Waterfall plot; dashed lines at −30% / +20% (RECIST)",
       x = "Patient (ordered)", y = "Change from baseline") +
  theme_sci() +
  theme(axis.text.x = element_blank(), axis.ticks.x = element_blank(),
        legend.position = c(0.88, 0.82))
save_fig(p1, "webr-waterfall-recist", 7.4, 5.5)

# ---- 2. Manual two-arm KM (no survival pkg) ----
km_step <- function(time, event) {
  # simple KM: times sorted unique event times
  o <- order(time)
  time <- time[o]; event <- event[o]
  n <- length(time)
  at_risk <- n:1
  # only event times
  ev_idx <- which(event == 1)
  if (!length(ev_idx)) return(tibble(time = c(0, max(time)), surv = c(1, 1)))
  ut <- unique(time[event == 1])
  s <- 1
  out_t <- 0; out_s <- 1
  for (t in ut) {
    # at risk just before t
    r <- sum(time >= t)
    d <- sum(time == t & event == 1)
    if (r > 0) s <- s * (1 - d / r)
    out_t <- c(out_t, t); out_s <- c(out_s, s)
  }
  # extend to max follow-up
  out_t <- c(out_t, max(time)); out_s <- c(out_s, s)
  tibble(time = out_t, surv = out_s)
}

set.seed(202)
n_a <- 90; n_b <- 90
arm_a <- tibble(time = pmin(rexp(n_a, 1/28), 60),
                event = as.integer(runif(n_a) < 0.72),
                arm = "Control")
arm_b <- tibble(time = pmin(rexp(n_b, 1/42), 60),
                event = as.integer(runif(n_b) < 0.55),
                arm = "Treatment")
# censor some
arm_a$event[arm_a$time >= 60] <- 0
arm_b$event[arm_b$time >= 60] <- 0

km_df <- bind_rows(
  km_step(arm_a$time, arm_a$event) %>% mutate(arm = "Control"),
  km_step(arm_b$time, arm_b$event) %>% mutate(arm = "Treatment")
)

p2 <- ggplot(km_df, aes(time, surv, colour = arm)) +
  geom_step(linewidth = 0.95, direction = "hv") +
  scale_colour_manual(values = c(Control = "#8491B4", Treatment = "#E64B35"), name = NULL) +
  scale_y_continuous(limits = c(0, 1), breaks = seq(0, 1, 0.2),
                     labels = percent_format()) +
  scale_x_continuous(breaks = seq(0, 60, 12), limits = c(0, 60)) +
  labs(title = "Overall survival by treatment arm",
       subtitle = "Kaplan–Meier estimates (manual step function; n = 90 / arm)",
       x = "Months since randomization", y = "Overall survival") +
  theme_sci() +
  theme(legend.position = c(0.18, 0.18))
save_fig(p2, "webr-km-twoarm-manual", 7.0, 5.6)

# ---- 3. Enrichment NES bars ----
nes <- tibble(
  pathway = c("INTERFERON_GAMMA", "ALLOGRAFT_REJECTION", "INFLAMMATORY_RESPONSE",
              "COMPLEMENT", "IL6_JAK_STAT3", "TNFA_SIGNALING", "APOPTOSIS",
              "MYC_TARGETS_V1", "E2F_TARGETS", "G2M_CHECKPOINT",
              "OXIDATIVE_PHOSPHORYLATION", "FATTY_ACID_METABOLISM"),
  nes = c(2.35, 2.12, 1.98, 1.76, 1.55, 1.42, 1.18,
          -1.25, -1.48, -1.72, -2.05, -2.28),
  padj = c(0.001, 0.002, 0.004, 0.01, 0.02, 0.03, 0.08,
           0.06, 0.02, 0.008, 0.002, 0.001)
) %>% mutate(
  pathway = fct_reorder(pathway, nes),
  sig = padj < 0.05,
  dir = ifelse(nes >= 0, "Up in tumor", "Up in normal")
)

p3 <- ggplot(nes, aes(nes, pathway, fill = dir)) +
  geom_col(width = 0.72, alpha = 0.9) +
  geom_vline(xintercept = 0, colour = "grey30", linewidth = 0.4) +
  scale_fill_manual(values = c("Up in tumor" = "#E64B35", "Up in normal" = "#3C5488"),
                    name = NULL) +
  labs(title = "Hallmark pathway enrichment (NES)",
       subtitle = "GSEA-style normalised enrichment scores",
       x = "Normalised enrichment score (NES)", y = NULL) +
  theme_sci() +
  theme(legend.position = "top", legend.justification = "left")
save_fig(p3, "webr-enrichment-nes-bar", 7.4, 5.8)

# ---- 4. Age–sex pyramid ----
ages <- c("0–9","10–19","20–29","30–39","40–49","50–59","60–69","70–79","80+")
pyr <- tibble(
  age = factor(rep(ages, 2), levels = ages),
  sex = rep(c("Male", "Female"), each = length(ages)),
  n = c(42, 45, 48, 52, 55, 50, 38, 22, 10,
        40, 43, 47, 51, 58, 54, 42, 28, 16)
) %>% mutate(n_plot = ifelse(sex == "Male", -n, n))

p4 <- ggplot(pyr, aes(age, n_plot, fill = sex)) +
  geom_col(width = 0.78, colour = "white", linewidth = 0.2) +
  coord_flip() +
  scale_fill_manual(values = c(Male = "#4DBBD5", Female = "#E64B35"), name = NULL) +
  scale_y_continuous(
    breaks = c(-60, -40, -20, 0, 20, 40, 60),
    labels = c(60, 40, 20, 0, 20, 40, 60)
  ) +
  labs(title = "Age–sex structure of the study cohort",
       subtitle = "Population pyramid (counts); males left, females right",
       x = "Age group (years)", y = "Number of participants") +
  theme_sci() +
  theme(legend.position = "top", legend.justification = "left")
save_fig(p4, "webr-agesex-pyramid", 7.0, 5.6)

# ---- 5. 2D binned density (geom_bin2d) ----
set.seed(303)
expr <- tibble(
  gene_x = rnorm(2500, 0, 1.1),
  gene_y = 0.55 * gene_x + rnorm(2500, 0, 0.85)
)

p5 <- ggplot(expr, aes(gene_x, gene_y)) +
  geom_bin2d(bins = 36) +
  scale_fill_gradient(low = "#F8F4F0", high = "#DC0000", name = "Count",
                      trans = "sqrt") +
  labs(title = "Co-expression density of two hallmark genes",
       subtitle = "2D bin counts (geom_bin2d); colour ∝ √count",
       x = "Gene X (log2 TPM, centred)", y = "Gene Y (log2 TPM, centred)") +
  theme_sci() +
  coord_equal()
save_fig(p5, "webr-bin2d-coexpression", 6.4, 5.8)

# ---- 6. Oncoplot-lite mutation tiles ----
set.seed(404)
genes <- c("TP53", "KRAS", "EGFR", "PIK3CA", "APC", "PTEN", "BRAF", "MYC")
samples <- paste0("S", sprintf("%02d", 1:24))
alts <- c("Missense", "Nonsense", "Frameshift", "Amplification", "Wild-type")
onco <- expand_grid(gene = genes, sample = samples) %>%
  mutate(
    alt = sample(alts, n(), replace = TRUE,
                 prob = c(0.18, 0.06, 0.08, 0.07, 0.61)),
    gene = factor(gene, levels = rev(genes)),
    sample = factor(sample, levels = samples)
  )

p6 <- ggplot(onco, aes(sample, gene, fill = alt)) +
  geom_tile(colour = "white", linewidth = 0.35) +
  scale_fill_manual(
    values = c(Missense = "#E64B35", Nonsense = "#3C5488",
               Frameshift = "#00A087", Amplification = "#F39B7F",
               `Wild-type` = "grey92"),
    name = "Alteration"
  ) +
  labs(title = "Somatic alteration overview (oncoplot-lite)",
       subtitle = "Selected driver genes × samples; white grid for readability",
       x = NULL, y = NULL) +
  theme_sci() +
  theme(axis.text.x = element_text(angle = 90, vjust = 0.5, hjust = 1, size = 8),
        axis.line = element_blank(), axis.ticks = element_blank(),
        legend.position = "right")
save_fig(p6, "webr-oncoplot-lite-tile", 8.0, 5.2)

# ---- 7. QQ plot of residuals ----
set.seed(505)
resid <- tibble(r = rt(400, df = 6) * 0.9)
qq <- tibble(
  theoretical = qnorm(ppoints(nrow(resid))),
  sample = sort(resid$r)
)

p7 <- ggplot(qq, aes(theoretical, sample)) +
  geom_abline(slope = 1, intercept = 0, linetype = "dashed",
              colour = "grey50", linewidth = 0.45) +
  geom_point(colour = "#3C5488", alpha = 0.7, size = 1.8, stroke = 0) +
  labs(title = "Normal Q–Q plot of model residuals",
       subtitle = "Dashed line = theoretical N(0,1) reference",
       x = "Theoretical quantiles", y = "Sample quantiles") +
  theme_sci() +
  coord_equal()
save_fig(p7, "webr-qq-residuals", 6.2, 5.8)

# ---- 8. Slope chart prevalence by region ----
slope <- tibble(
  region = rep(c("North", "East", "South", "West", "Central"), 2),
  year = rep(c("2015", "2024"), each = 5),
  rate = c(12.4, 15.8, 18.2, 10.5, 14.1,
           11.0, 17.6, 22.4, 9.8, 16.9)
) %>% mutate(
  region = factor(region, levels = c("East", "South", "Central", "North", "West")),
  year = factor(year, levels = c("2015", "2024"))
)

p8 <- ggplot(slope, aes(year, rate, group = region, colour = region)) +
  geom_line(linewidth = 0.9) +
  geom_point(size = 3.2) +
  geom_text(data = filter(slope, year == "2015"),
            aes(label = region), hjust = 1.15, size = 3.3, show.legend = FALSE) +
  geom_text(data = filter(slope, year == "2024"),
            aes(label = sprintf("%.1f", rate)), hjust = -0.3, size = 3.2,
            show.legend = FALSE) +
  scale_colour_manual(values = c(North = "#8491B4", East = "#E64B35",
                                 South = "#00A087", West = "#F39B7F",
                                 Central = "#3C5488"), guide = "none") +
  scale_x_discrete(expand = expansion(mult = c(0.35, 0.25))) +
  labs(title = "Disease prevalence by region, 2015 vs 2024",
       subtitle = "Slope chart (per 1000 population)",
       x = NULL, y = "Prevalence rate") +
  theme_sci()
save_fig(p8, "webr-slope-prevalence", 6.6, 5.6)

# ---- 9. Multivariable HR forest ----
hr <- tibble(
  term = c("Age (per 10 y)", "Male sex", "ECOG ≥2", "Stage III–IV",
           "Prior therapy", "High LDH", "Liver mets", "CNS mets"),
  hr = c(1.18, 0.96, 1.55, 1.92, 1.22, 1.41, 1.68, 2.15),
  lo = c(1.05, 0.78, 1.18, 1.45, 0.95, 1.10, 1.25, 1.52),
  hi = c(1.33, 1.18, 2.04, 2.54, 1.57, 1.81, 2.26, 3.04)
) %>% mutate(
  term = fct_rev(factor(term, levels = term)),
  sig = lo > 1 | hi < 1
)

p9 <- ggplot(hr, aes(hr, term)) +
  geom_vline(xintercept = 1, linetype = "dashed", colour = "grey45", linewidth = 0.4) +
  geom_errorbar(aes(xmin = lo, xmax = hi, colour = sig), width = 0.18, linewidth = 0.55) +
  geom_point(aes(colour = sig, fill = sig), shape = 22, size = 3.4, stroke = 0.6) +
  scale_colour_manual(values = c("FALSE" = "#8491B4", "TRUE" = "#E64B35"), guide = "none") +
  scale_fill_manual(values = c("FALSE" = "#8491B4", "TRUE" = "#E64B35"), guide = "none") +
  scale_x_log10(breaks = c(0.75, 1, 1.5, 2, 3), limits = c(0.7, 3.3)) +
  labs(title = "Multivariable Cox model (hazard ratios)",
       subtitle = "Squares = HR; bars = 95% CI; red = CI excludes 1",
       x = "Hazard ratio (95% CI)", y = NULL) +
  theme_sci()
save_fig(p9, "webr-multivar-hr-forest", 7.2, 5.6)

# ---- 10. Z-score gene × sample heatmap ----
set.seed(606)
g_names <- paste0("GENE", sprintf("%02d", 1:14))
s_names <- paste0("T", sprintf("%02d", 1:12))
mat <- matrix(rnorm(length(g_names) * length(s_names)), nrow = length(g_names))
# add structure: first 5 genes up in last 6 samples
mat[1:5, 7:12] <- mat[1:5, 7:12] + 1.8
mat[6:9, 1:6] <- mat[6:9, 1:6] + 1.4
# row z-score
mat <- t(scale(t(mat)))
hm <- expand_grid(gene = g_names, sample = s_names) %>%
  mutate(
    z = as.vector(mat),
    gene = factor(gene, levels = rev(g_names)),
    sample = factor(sample, levels = s_names)
  )

p10 <- ggplot(hm, aes(sample, gene, fill = z)) +
  geom_tile(colour = "white", linewidth = 0.25) +
  scale_fill_gradient2(low = "#3C5488", mid = "white", high = "#E64B35",
                       midpoint = 0, limits = c(-2.5, 2.5), oob = squish,
                       name = "z") +
  labs(title = "Differentially expressed genes (row z-scores)",
       subtitle = "Samples T01–T12; white = mean expression per gene",
       x = NULL, y = NULL) +
  theme_sci() +
  theme(axis.line = element_blank(), axis.ticks = element_blank(),
        axis.text.x = element_text(angle = 90, vjust = 0.5, hjust = 1))
save_fig(p10, "webr-zscore-gene-heatmap", 7.0, 5.8)

# ---- 11. Loess biomarker vs age ----
set.seed(707)
bio <- tibble(
  age = runif(220, 25, 85),
  group = sample(c("Control", "Case"), 220, replace = TRUE, prob = c(0.45, 0.55))
) %>% mutate(
  marker = 2.2 + 0.018 * age + ifelse(group == "Case", 0.7, 0) +
    rnorm(n(), 0, 0.55) + ifelse(age > 60, (age - 60) * 0.01, 0)
)

p11 <- ggplot(bio, aes(age, marker, colour = group, fill = group)) +
  geom_point(alpha = 0.45, size = 1.7, stroke = 0) +
  geom_smooth(method = "loess", formula = y ~ x, linewidth = 0.9, alpha = 0.18, se = TRUE) +
  scale_colour_manual(values = c(Control = "#8491B4", Case = "#E64B35"), name = NULL) +
  scale_fill_manual(values = c(Control = "#8491B4", Case = "#E64B35"), guide = "none") +
  labs(title = "Circulating marker versus age",
       subtitle = "Points + LOESS smooth with 95% CI by case/control",
       x = "Age (years)", y = "Marker level (log10)") +
  theme_sci() +
  theme(legend.position = c(0.14, 0.88))
save_fig(p11, "webr-loess-marker-age", 7.0, 5.5)

# ---- 12. Diverging Likert stacked bar ----
likert_items <- c("Drug efficacy", "Safety profile", "Dosing convenience",
                  "Cost acceptability", "Overall satisfaction")
likert <- expand_grid(
  item = factor(likert_items, levels = rev(likert_items)),
  resp = factor(c("Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"),
                levels = c("Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"))
) %>% mutate(
  pct = c(
    # Drug efficacy
    4, 8, 12, 36, 40,
    # Safety
    6, 14, 18, 32, 30,
    # Dosing
    5, 10, 15, 38, 32,
    # Cost
    18, 22, 20, 25, 15,
    # Overall
    3, 7, 14, 40, 36
  ) / 100
)

# diverging: negative left of neutral
likert <- likert %>%
  mutate(
    side = case_when(
      resp %in% c("Strongly disagree", "Disagree") ~ "neg",
      resp == "Neutral" ~ "mid",
      TRUE ~ "pos"
    ),
    pct_plot = case_when(
      resp == "Strongly disagree" ~ -pct,
      resp == "Disagree" ~ -pct,
      resp == "Neutral" ~ pct / 2, # will draw twice carefully — simpler: keep stacked 100% instead
      TRUE ~ pct
    )
  )

# Use standard 100% stacked (cleaner, still publication-common)
p12 <- ggplot(likert, aes(item, pct, fill = resp)) +
  geom_col(position = "stack", width = 0.72, colour = "white", linewidth = 0.2) +
  coord_flip() +
  scale_fill_manual(
    values = c("Strongly disagree" = "#3C5488", "Disagree" = "#8491B4",
               "Neutral" = "grey80", "Agree" = "#F39B7F", "Strongly agree" = "#E64B35"),
    name = NULL
  ) +
  scale_y_continuous(labels = percent_format(), expand = expansion(mult = c(0, 0.02))) +
  labs(title = "Patient-reported treatment experience",
       subtitle = "Stacked Likert responses (100% of respondents per item)",
       x = NULL, y = "Percentage of respondents") +
  theme_sci() +
  theme(legend.position = "bottom", legend.direction = "horizontal",
        legend.justification = "left") +
  guides(fill = guide_legend(nrow = 2, byrow = TRUE))
save_fig(p12, "webr-likert-stacked", 7.6, 5.6)

message("DONE batch B: 12 figures")
