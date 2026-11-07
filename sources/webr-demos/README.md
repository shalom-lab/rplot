# WebR-friendly figure demos

Scripts here regenerate single-panel, Nature/Lancet-style ggplot figures using only packages known to work under WebR (wasm):

- **Used:** `ggplot2`, `dplyr`, `tidyr`, `scales`, `forcats`, `tibble` (+ base R)
- **Avoided:** `survminer` / `survival`, `EnhancedVolcano`, `ComplexHeatmap`, `circlize`, `ggrepel`, `ggbeeswarm`, `ggridges`, `ggpubr`, `factoextra`, `MASS` (ellipse)

```bash
Rscript sources/webr-demos/generate_batch_2026-11-07.R
Rscript sources/webr-demos/generate_batch_2026-11-07b.R
Rscript sources/webr-demos/generate_batch_2026-11-07c.R
```

Outputs land in `figures/webr-*.png` and are indexed in root `catalog.json`.

**Do not** put panel letter tags (`A`/`B`/`C`/`D`, `a)`, `（A）`, `labs(tag=…)`, `plot_annotation(tag_levels=…)`) in generated images. Strip any such tags from imported multipanel crops before commit.
