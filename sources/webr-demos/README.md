# WebR-friendly figure demos

Scripts here regenerate single-panel, Nature/Lancet-style ggplot figures using only packages known to work under WebR (wasm):

- **Used:** `ggplot2`, `dplyr`, `tidyr`, `scales`, `forcats`, `tibble` (+ base R)
- **Avoided:** `survminer` / `survival`, `EnhancedVolcano`, `ComplexHeatmap`, `circlize`, `ggrepel`, `ggbeeswarm`, `ggridges`, `ggpubr`, `factoextra`, `MASS` (ellipse)

```bash
Rscript sources/webr-demos/generate_batch_2026-11-07.R
Rscript sources/webr-demos/generate_batch_2026-11-07b.R
```

Outputs land in `figures/webr-*.png` and are indexed in root `catalog.json`.
