import { useState } from "react";
import { IconCopy, IconSelect, IconSpinner, IconStar } from "../lib/icons";
import { assetUrl } from "../lib/byok";

async function copyImageToClipboard(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("图片加载失败");
  let blob = await res.blob();
  // Clipboard API reliably accepts image/png
  if (blob.type !== "image/png") {
    const bmp = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0);
    blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("转 PNG 失败"))),
        "image/png"
      );
    });
  }
  if (!navigator.clipboard?.write) {
    throw new Error("当前浏览器不支持复制图片");
  }
  await navigator.clipboard.write([
    new ClipboardItem({ [blob.type]: blob }),
  ]);
}

export default function FigureCard({
  fig,
  starred,
  selectMode,
  selected,
  onStar,
  onToggleSelect,
  onOpen,
  onToast,
}) {
  const [copying, setCopying] = useState(false);
  const src = assetUrl(fig.file);

  function handleImageClick() {
    if (selectMode) {
      onToggleSelect?.(fig.id);
      return;
    }
    onOpen(fig);
  }

  async function handleCopy(e) {
    e.stopPropagation();
    if (copying) return;
    setCopying(true);
    try {
      await copyImageToClipboard(src);
      onToast?.("已复制图片到剪贴板");
    } catch (err) {
      onToast?.(err.message || "复制失败", true);
    } finally {
      setCopying(false);
    }
  }

  const tagsLine = [
    fig.category,
    ...(fig.tags?.slice(0, 2) || []),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={`group relative flex flex-col overflow-hidden border bg-[var(--color-card)] shadow-[0_1px_2px_rgba(28,25,23,0.03)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(28,25,23,0.08)] r-card ${
        selected
          ? "border-[var(--color-coral)] ring-2 ring-[var(--color-coral)]/30"
          : "border-[var(--color-line)]"
      }`}
    >
      <div
        className={`relative w-full overflow-hidden bg-white leading-none ${
          selectMode ? "cursor-pointer" : "cursor-zoom-in"
        }`}
        onClick={handleImageClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleImageClick();
          }
        }}
        title={selectMode ? (selected ? "取消选择" : "选择此图") : "放大预览"}
      >
        <img
          src={src}
          alt={fig.title}
          loading="lazy"
          className="m-0 block h-auto w-full max-w-full align-top transition duration-300 group-hover:scale-[1.015]"
          draggable={false}
        />

        {/* Top-right: select checkbox only (select mode) */}
        {selectMode && (
          <span
            className={`pointer-events-none absolute right-2 top-2 inline-flex size-7 items-center justify-center drop-shadow-[0_0_2px_rgba(255,255,255,0.95)] ${
              selected ? "text-[var(--color-theme)]" : "text-[var(--color-theme)]/70"
            }`}
            aria-hidden
          >
            <IconSelect className="size-[18px]" checked={selected} />
          </span>
        )}
      </div>

      {/* Footer: left meta + right copy/star (no share) */}
      <div className="card-meta-hairline flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <h3 className="m-0 truncate text-[13px] font-semibold leading-snug text-[var(--color-ink)]">
            {fig.title}
          </h3>
          {tagsLine ? (
            <p className="m-0 truncate text-[11.5px] leading-snug text-[var(--color-muted)]">
              {tagsLine}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            title="复制图片"
            aria-label="复制图片"
            disabled={copying}
            className="icon-theme inline-flex size-7 items-center justify-center rounded-full border-0 bg-transparent p-0 transition hover:bg-[var(--color-theme-soft)] disabled:opacity-50"
          >
            {copying ? (
              <IconSpinner className="size-4" />
            ) : (
              <IconCopy className="size-4" />
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStar(fig.id);
            }}
            title={starred ? "取消星标" : "加星标"}
            aria-label={starred ? "取消星标" : "加星标"}
            aria-pressed={starred}
            className={`icon-theme inline-flex size-7 items-center justify-center rounded-full border-0 p-0 transition ${
              starred
                ? "bg-[var(--color-theme-soft)] opacity-100"
                : "bg-transparent hover:bg-[var(--color-theme-soft)]"
            }`}
          >
            <IconStar filled={starred} className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
