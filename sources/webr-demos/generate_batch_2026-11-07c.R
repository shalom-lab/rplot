#!/usr/bin/env Rscript
# Batch 3 — WebR-safe single-panel SCI-style demos
# Packages: ggplot2, dplyr, tidyr, scales, forcats, tibble (+ base)
#
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

# ---- 1. Bland–Altman ----
set.seed(101)
n <- 160
m1 <- rnorm(n, 5.2, 0.9)
m2 <- m1 + rnorm(n, 0.08, 0.45)
ba <- tibble(
  mean = (m1 + m2) / 2,
  diff = m2 - m1
)
bias <- mean(ba$diff)
loa <- 1.96 * sd(ba$diff)

p1 <- ggplot(ba, aes(mean, diff)) +
  geom_hline(yintercept = 0, colour = "grey70", linewidth = 0.35) +
  geom_hline(yintercept = bias, colour = "#E64B35", linewidth = 0.7) +
  geom_hline(yintercept = c(bias - loa, bias + loa),
             colour = "#3C5488", linetype = "dashed", linewidth = 0.55) +
  geom_point(colour = "#8491B4", alpha = 0.65, size = 2, stroke = 0) +
  labs(title = "Bland–Altman agreement of two assays",
       subtitle = sprintf("Solid = mean bias (%.2f); dashed = ±1.96 SD limits", bias),
       x = "Mean of assay A and B", y = "Difference (B − A)") +
  theme_sci()
save_fig(p1, "webr-bland-altman", 7.0, 5.5)

# ---- 2. Manhattan-lite ----
set.seed(202)
chr_len <- c(20,18,16,15,14,13,12,11,10,10,9,9,8,7,7,6,6,5,5,4,3,3)
manh <- bind_rows(lapply(seq_along(chr_len), function(chr) {
  m <- chr_len[chr] * 40
  tibble(
    chr = chr,
    pos = sort(runif(m, 0, chr_len[chr])),
    p = pmin(10^(-rexp(m, 0.55)), 1)
  )
})) %>%
  mutate(
    neglog10 = pmin(-log10(p), 12),
    chr_f = factor(chr)
  )
# cumulative positions
offsets <- c(0, cumsum(chr_len)[-length(chr_len)])
manh <- manh %>%
  mutate(x = pos + offsets[chr],
         col = ifelse(chr %% 2 == 1, "odd", "even"),
         hit = neglog10 > 7.3)

centres <- tibble(chr = seq_along(chr_len), x = offsets + chr_len / 2)

p2 <- ggplot(manh, aes(x, neglog10, colour = col)) +
  geom_point(size = 0.55, alpha = 0.7, stroke = 0) +
  geom_point(data = filter(manh, hit), colour = "#E64B35", size = 1.15, stroke = 0) +
  geom_hline(yintercept = 7.3, linetype = "dashed", colour = "grey40", linewidth = 0.4) +
  scale_colour_manual(values = c(odd = "#3C5488", even = "#8491B4"), guide = "none") +
  scale_x_continuous(breaks = centres$x, labels = centres$chr) +
  labs(title = "Genome-wide association Manhattan plot",
       subtitle = "Dashed line = genome-wide threshold (−log10 p = 7.3)",
       x = "Chromosome", y = expression(-log[10]~italic(p))) +
  theme_sci()
save_fig(p2, "webr-manhattan-lite", 8.0, 5.4)

# ---- 3. Funnel plot ----
set.seed(303)
k <- 28
fun <- tibble(
  yi = rnorm(k, -0.25, 0.35),
  sei = runif(k, 0.08, 0.45)
) %>% mutate(
  inv_se = 1 / sei,
  lo = -0.25 - 1.96 * sei,
  hi = -0.25 + 1.96 * sei
)
# funnel outline at common effect
se_grid <- seq(0.05, 0.5, length.out = 60)
funnel_band <- tibble(
  sei = se_grid,
  lo = -0.25 - 1.96 * se_grid,
  hi = -0.25 + 1.96 * se_grid
)

p3 <- ggplot() +
  geom_ribbon(data = funnel_band, aes(x = sei, ymin = lo, ymax = hi),
              fill = "#4DBBD5", alpha = 0.15) +
  geom_hline(yintercept = -0.25, colour = "#E64B35", linewidth = 0.7) +
  geom_point(data = fun, aes(sei, yi), colour = "#3C5488", size = 2.4, alpha = 0.85) +
  scale_x_reverse() +
  coord_flip() +
  labs(title = "Funnel plot of treatment effect estimates",
       subtitle = "Pooled log risk ratio = −0.25; shaded = 95% pseudo-CI",
       x = "Standard error", y = "Effect size (log RR)") +
  theme_sci()
save_fig(p3, "webr-funnel-meta", 6.6, 5.8)

# ---- 4. Pareto adverse events ----
ae <- tibble(
  event = c("Nausea", "Fatigue", "Diarrhoea", "Rash", "Neutropenia",
            "Anaemia", "ALT elevation", "Headache", "Myalgia", "Other"),
  n = c(48, 41, 33, 27, 22, 18, 14, 11, 9, 16)
) %>%
  mutate(event = fct_reorder(event, n),
         pct = n / sum(n),
         cum = cumsum(sort(n, decreasing = TRUE)) / sum(n))
# for dual axis: reorder by n desc for cum on same order
ae2 <- ae %>% arrange(desc(n)) %>%
  mutate(event = factor(event, levels = event),
         cum = cumsum(n) / sum(n),
         pct = n / sum(n))

p4 <- ggplot(ae2, aes(event, n)) +
  geom_col(fill = "#4DBBD5", width = 0.72) +
  geom_line(aes(y = cum * max(n), group = 1), colour = "#E64B35", linewidth = 0.9) +
  geom_point(aes(y = cum * max(n)), colour = "#E64B35", size = 2.4) +
  scale_y_continuous(
    name = "Event count",
    sec.axis = sec_axis(~ . / max(ae2$n), name = "Cumulative share", labels = percent_format())
  ) +
  labs(title = "Treatment-emergent adverse events (Pareto)",
       subtitle = "Bars = counts; line = cumulative proportion",
       x = NULL) +
  theme_sci() +
  theme(axis.text.x = element_text(angle = 35, hjust = 1))
save_fig(p4, "webr-pareto-adverse", 7.4, 5.6)

# ---- 5. ECDF by group ----
set.seed(505)
ecd <- bind_rows(
  tibble(value = rlnorm(180, log(12), 0.35), group = "Control"),
  tibble(value = rlnorm(180, log(18), 0.40), group = "Case")
) %>% mutate(group = factor(group, levels = c("Control", "Case")))

p5 <- ggplot(ecd, aes(value, colour = group)) +
  stat_ecdf(linewidth = 0.95) +
  scale_colour_manual(values = c(Control = "#8491B4", Case = "#E64B35"), name = NULL) +
  scale_x_continuous(trans = "log10") +
  scale_y_continuous(labels = percent_format()) +
  labs(title = "Empirical CDF of circulating marker",
       subtitle = "Log10 scale; case vs control",
       x = "Marker concentration", y = "Cumulative proportion") +
  theme_sci() +
  theme(legend.position = c(0.2, 0.82))
save_fig(p5, "webr-ecdf-biomarker", 7.0, 5.5)

# ---- 6. Residual vs fitted ----
set.seed(606)
fit <- tibble(
  fitted = sort(runif(220, 1, 8)),
  resid = rnorm(220, 0, 0.85) + sin(fitted / 2) * 0.15
)

p6 <- ggplot(fit, aes(fitted, resid)) +
  geom_hline(yintercept = 0, linetype = "dashed", colour = "grey50", linewidth = 0.45) +
  geom_point(colour = "#3C5488", alpha = 0.55, size = 1.9, stroke = 0) +
  geom_smooth(method = "loess", formula = y ~ x, se = TRUE,
              colour = "#E64B35", fill = "#E64B35", alpha = 0.12, linewidth = 0.8) +
  labs(title = "Residuals versus fitted values",
       subtitle = "LOESS trend should stay near zero if mean structure is adequate",
       x = "Fitted values", y = "Residuals") +
  theme_sci()
save_fig(p6, "webr-resid-fitted", 7.0, 5.5)

# ---- 7. Ranked means with 95% CI (dot-and-whisker) ----
set.seed(707)
dw <- tibble(
  site = paste0("Site ", LETTERS[1:10]),
  mean = c(62, 58, 55, 51, 49, 47, 44, 41, 38, 34),
  se = c(2.1, 2.4, 1.9, 2.2, 2.0, 2.5, 2.3, 1.8, 2.1, 2.4)
) %>% mutate(
  lo = mean - 1.96 * se,
  hi = mean + 1.96 * se,
  site = fct_reorder(site, mean)
)

p7 <- ggplot(dw, aes(mean, site)) +
  geom_errorbar(aes(xmin = lo, xmax = hi), width = 0.2, colour = "grey45", linewidth = 0.5) +
  geom_point(colour = "#E64B35", size = 3.2) +
  labs(title = "Mean response rate by study site",
       subtitle = "Dot-and-whisker with 95% CI; sites ordered by mean",
       x = "Mean response rate (%)", y = NULL) +
  theme_sci()
save_fig(p7, "webr-dotwhisker-sites", 7.0, 5.6)

# ---- 8. Multi-model ROC ----
roc_curve <- function(auc_target, n = 400) {
  # approximate ROC via binormal
  a <- sqrt(2) * qnorm(auc_target)
  fpr <- seq(0, 1, length.out = n)
  tpr <- pnorm(a + qnorm(fpr))
  tibble(fpr = fpr, tpr = pmax(0, pmin(1, tpr)))
}
roc <- bind_rows(
  roc_curve(0.91) %>% mutate(model = "Signature"),
  roc_curve(0.78) %>% mutate(model = "Clinical only"),
  roc_curve(0.66) %>% mutate(model = "Single marker")
) %>% mutate(model = factor(model, levels = c("Signature", "Clinical only", "Single marker")))

p8 <- ggplot(roc, aes(fpr, tpr, colour = model)) +
  geom_abline(slope = 1, intercept = 0, linetype = "dashed", colour = "grey55", linewidth = 0.4) +
  geom_line(linewidth = 1.05) +
  scale_colour_manual(values = c(Signature = "#E64B35", `Clinical only` = "#3C5488",
                                 `Single marker` = "#00A087"), name = NULL) +
  scale_x_continuous(labels = percent_format(), limits = c(0, 1), expand = c(0.01, 0.01)) +
  scale_y_continuous(labels = percent_format(), limits = c(0, 1), expand = c(0.01, 0.01)) +
  coord_equal() +
  labs(title = "ROC curves for three nested models",
       subtitle = "AUC ≈ 0.91 / 0.78 / 0.66 (illustrative)",
       x = "1 − Specificity (FPR)", y = "Sensitivity (TPR)") +
  theme_sci() +
  theme(legend.position = c(0.72, 0.22))
save_fig(p8, "webr-roc-multi", 6.4, 5.8)

# ---- 9. Range / high-low lab plot ----
set.seed(909)
rng <- tibble(
  analyte = c("Na", "K", "Cl", "HCO3", "BUN", "Cre", "Glu", "Ca", "Mg", "Phos"),
  low = c(136, 3.5, 98, 22, 7, 0.6, 70, 8.5, 1.6, 2.5),
  high = c(145, 5.1, 107, 29, 20, 1.2, 100, 10.2, 2.4, 4.5),
  patient = c(142, 3.2, 104, 18, 28, 1.6, 156, 7.9, 1.4, 5.2)
) %>% mutate(
  analyte = factor(analyte, levels = rev(analyte)),
  flag = patient < low | patient > high
)

p9 <- ggplot(rng, aes(y = analyte)) +
  geom_segment(aes(x = low, xend = high, yend = analyte),
               colour = "grey75", linewidth = 3.2, lineend = "round") +
  geom_point(aes(x = patient, colour = flag), size = 3.2) +
  scale_colour_manual(values = c("FALSE" = "#3C5488", "TRUE" = "#E64B35"),
                      labels = c("FALSE" = "In range", "TRUE" = "Out of range"),
                      name = NULL) +
  labs(title = "Patient values against reference ranges",
       subtitle = "Grey bars = reference interval; points = observed",
       x = "Concentration (assay units)", y = NULL) +
  theme_sci() +
  theme(legend.position = "top", legend.justification = "left")
save_fig(p9, "webr-range-lab-values", 7.2, 5.6)

# ---- 10. Mosaic / 100% stacked stage × response ----
mos <- expand_grid(
  stage = factor(c("I", "II", "III", "IV"), levels = c("I","II","III","IV")),
  response = factor(c("CR/PR", "SD", "PD"), levels = c("CR/PR", "SD", "PD"))
) %>% mutate(
  n = c(28, 12, 5,  22, 18, 10,  14, 20, 22,  8, 16, 30)
) %>%
  group_by(stage) %>%
  mutate(pct = n / sum(n)) %>%
  ungroup()

p10 <- ggplot(mos, aes(stage, pct, fill = response)) +
  geom_col(width = 0.72, colour = "white", linewidth = 0.25) +
  scale_fill_manual(values = c(`CR/PR` = "#00A087", SD = "#4DBBD5", PD = "#E64B35"),
                    name = "Best response") +
  scale_y_continuous(labels = percent_format(), expand = expansion(mult = c(0, 0.02))) +
  labs(title = "Best overall response by clinical stage",
       subtitle = "100% stacked composition within each stage",
       x = "AJCC stage", y = "Proportion of patients") +
  theme_sci()
save_fig(p10, "webr-mosaic-stage-response", 6.8, 5.5)

# ---- 11. Parallel coordinates (scaled clinical) ----
set.seed(1111)
pc <- tibble(
  id = 1:60,
  group = sample(c("Responder", "Non-responder"), 60, replace = TRUE, prob = c(0.45, 0.55)),
  Age = rnorm(60, 62, 9),
  LDH = rnorm(60, 220, 55),
  CRP = rlnorm(60, log(8), 0.5),
  Albumin = rnorm(60, 38, 5),
  NLR = rlnorm(60, log(3), 0.4)
) %>%
  mutate(across(c(Age, LDH, CRP, Albumin, NLR), ~ as.numeric(scale(.x)))) %>%
  pivot_longer(c(Age, LDH, CRP, Albumin, NLR), names_to = "var", values_to = "z") %>%
  mutate(var = factor(var, levels = c("Age", "LDH", "CRP", "Albumin", "NLR")),
         group = factor(group, levels = c("Responder", "Non-responder")))

p11 <- ggplot(pc, aes(var, z, group = id, colour = group)) +
  geom_line(alpha = 0.28, linewidth = 0.45) +
  geom_point(alpha = 0.35, size = 1.2, stroke = 0) +
  scale_colour_manual(values = c(Responder = "#00A087", `Non-responder` = "#E64B35"), name = NULL) +
  labs(title = "Parallel coordinates of baseline clinical features",
       subtitle = "Variables standardised to z-scores; one line per patient",
       x = NULL, y = "Standardised value (z)") +
  theme_sci() +
  theme(legend.position = "top", legend.justification = "left")
save_fig(p11, "webr-parallel-coords", 7.4, 5.6)

# ---- 12. Cumulative incidence (manual step) ----
set.seed(1212)
ci_step <- function(time, event) {
  # event=1 incidence of interest; simple 1-KM among those with event of interest
  # (illustrative Aalen-Johansen-like when only one cause)
  o <- order(time); time <- time[o]; event <- event[o]
  ut <- sort(unique(time[event == 1]))
  n <- length(time); s <- 1; cif <- 0
  out_t <- 0; out_c <- 0
  for (t in ut) {
    r <- sum(time >= t)
    d <- sum(time == t & event == 1)
    if (r > 0) {
      cif <- cif + s * (d / r)
      s <- s * (1 - d / r)
    }
    out_t <- c(out_t, t); out_c <- c(out_c, cif)
  }
  out_t <- c(out_t, max(time)); out_c <- c(out_c, cif)
  tibble(time = out_t, cif = out_c)
}
g1 <- tibble(time = pmin(rexp(120, 1/24), 48), event = as.integer(runif(120) < 0.55))
g2 <- tibble(time = pmin(rexp(120, 1/36), 48), event = as.integer(runif(120) < 0.40))
ci <- bind_rows(
  ci_step(g1$time, g1$event) %>% mutate(arm = "Control"),
  ci_step(g2$time, g2$event) %>% mutate(arm = "Treatment")
)

p12 <- ggplot(ci, aes(time, cif, colour = arm)) +
  geom_step(linewidth = 0.95, direction = "hv") +
  scale_colour_manual(values = c(Control = "#8491B4", Treatment = "#E64B35"), name = NULL) +
  scale_y_continuous(limits = c(0, 1), labels = percent_format()) +
  scale_x_continuous(breaks = seq(0, 48, 12), limits = c(0, 48)) +
  labs(title = "Cumulative incidence of primary endpoint",
       subtitle = "Step-function estimates by treatment arm (illustrative)",
       x = "Months since enrolment", y = "Cumulative incidence") +
  theme_sci() +
  theme(legend.position = c(0.2, 0.82))
save_fig(p12, "webr-cuminc-endpoint", 7.0, 5.5)

message("DONE batch C: 12 figures (no panel tags)")
