import { useEffect, useRef, useState } from "react";
import { IconMore, IconSpinner, IconStar } from "../lib/icons";
import { assetUrl } from "../lib/byok";

export default function FigureCard({
  fig,
  starred,
  deleting,
  onStar,
  onDelete,
  onOpen,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e) {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <article className="group flex flex-col overflow-hidden border border-[var(--color-line)] bg-[var(--color-card)] shadow-[0_1px_2px_rgba(28,25,23,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-line-strong)] hover:shadow-[0_12px_28px_rgba(28,25,23,0.08)] r-card">
      <button
        type="button"
        className="relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden bg-[#ebe4d8] text-left"
        onClick={() => onOpen(fig)}
        title="放大预览"
      >
        <img
          src={assetUrl(fig.file)}
          alt={fig.title}
          loading="lazy"
          className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition group-hover:opacity-100" />

        {/* Quiet actions on image */}
        <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStar(fig.id);
            }}
            title={starred ? "取消星标" : "星标"}
            className={`inline-flex size-8 items-center justify-center rounded-[12px] border backdrop-blur-md transition ${
              starred
                ? "border-amber-200/50 bg-amber-50/95 text-amber-700 opacity-100"
                : "border-white/30 bg-white/80 text-stone-600 opacity-0 group-hover:opacity-100 hover:bg-white"
            }`}
          >
            <IconStar filled={starred} className="size-3.5" />
          </button>

          <div
            className="relative opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100"
            ref={menuRef}
          >
            <button
              type="button"
              title="更多"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="inline-flex size-8 items-center justify-center rounded-[12px] border border-white/30 bg-white/80 text-stone-600 backdrop-blur-md hover:bg-white"
            >
              {deleting ? (
                <IconSpinner className="size-3.5" />
              ) : (
                <IconMore className="size-3.5" />
              )}
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+6px)] z-20 min-w-[128px] overflow-hidden border border-[var(--color-line)] bg-white py-1 shadow-lg r-control"
              >
                <button
                  type="button"
                  role="menuitem"
                  disabled={deleting}
                  className="flex w-full items-center px-3 py-2 text-left text-[12px] text-[var(--color-danger)] hover:bg-red-50 disabled:opacity-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete(fig);
                  }}
                >
                  {deleting ? "删除中…" : "删除此图"}
                </button>
              </div>
            )}
          </div>
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-1.5 px-3.5 py-3">
        <h3 className="m-0 line-clamp-2 text-[13.5px] font-semibold leading-snug text-[var(--color-ink)]">
          {fig.title}
        </h3>
        <p className="m-0 truncate text-[12px] text-[var(--color-muted)]">
          {fig.category}
          {fig.tags?.length ? ` · ${fig.tags.slice(0, 2).join(" · ")}` : ""}
        </p>
        {fig.note_zh ? (
          <p className="m-0 line-clamp-2 text-[11.5px] leading-relaxed text-stone-400">
            {fig.note_zh}
          </p>
        ) : null}
      </div>
    </article>
  );
}
