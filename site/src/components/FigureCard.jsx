import { IconCheck, IconStar } from "../lib/icons";
import { assetUrl } from "../lib/byok";

export default function FigureCard({
  fig,
  starred,
  selectMode,
  selected,
  onStar,
  onToggleSelect,
  onOpen,
}) {
  function handleCardClick() {
    if (selectMode) {
      onToggleSelect?.(fig.id);
      return;
    }
    onOpen(fig);
  }

  return (
    <article
      className={`group relative flex flex-col overflow-hidden border bg-[var(--color-card)] shadow-[0_1px_2px_rgba(28,25,23,0.03)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(28,25,23,0.08)] r-card ${
        selected
          ? "border-[var(--color-coral)] ring-2 ring-[var(--color-coral)]/30"
          : "border-[var(--color-line)]"
      }`}
    >
      <button
        type="button"
        className={`relative block w-full overflow-hidden bg-[#ebe4d8] text-left ${
          selectMode ? "cursor-pointer" : "cursor-zoom-in"
        }`}
        onClick={handleCardClick}
        title={selectMode ? (selected ? "取消选择" : "选择此图") : "放大预览"}
      >
        <img
          src={assetUrl(fig.file)}
          alt={fig.title}
          loading="lazy"
          className="block h-auto w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />

        {selectMode ? (
          <span
            className={`absolute left-2.5 top-2.5 inline-flex size-7 items-center justify-center rounded-[10px] border backdrop-blur-md ${
              selected
                ? "border-[var(--color-coral)] bg-[var(--color-coral)] text-white"
                : "border-white/40 bg-white/85 text-stone-500"
            }`}
            aria-hidden
          >
            {selected ? <IconCheck className="size-3.5" /> : null}
          </span>
        ) : (
          <span
            className={`absolute right-2.5 top-2.5 inline-flex ${
              starred
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
            } transition`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStar(fig.id);
              }}
              title={starred ? "取消星标" : "加星标"}
              aria-label={starred ? "取消星标" : "加星标"}
              className={`inline-flex size-8 items-center justify-center rounded-[12px] border backdrop-blur-md transition ${
                starred
                  ? "border-amber-200/55 bg-amber-50/95 text-amber-700"
                  : "border-white/30 bg-white/85 text-stone-600 hover:bg-white"
              }`}
            >
              <IconStar filled={starred} className="size-3.5" />
            </button>
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-1 px-3.5 py-3">
        <h3 className="m-0 line-clamp-2 text-[13.5px] font-semibold leading-snug text-[var(--color-ink)]">
          {fig.title}
        </h3>
        <p className="m-0 truncate text-[12px] text-[var(--color-muted)]">
          {fig.category}
          {fig.tags?.length ? ` · ${fig.tags.slice(0, 2).join(" · ")}` : ""}
        </p>
      </div>
    </article>
  );
}
