import { IconSpinner, IconStar } from "../lib/icons";
import { assetUrl } from "../lib/byok";

export default function FigureCard({
  fig,
  starred,
  deleting,
  onStar,
  onDelete,
  onOpen,
}) {
  return (
    <article className="group flex flex-col overflow-hidden border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow rounded-md">
      <button
        type="button"
        className="relative aspect-[16/11] cursor-zoom-in overflow-hidden bg-slate-100 text-left"
        onClick={() => onOpen(fig)}
        title="放大预览"
      >
        <img
          src={assetUrl(fig.file)}
          alt={fig.title}
          loading="lazy"
          className="size-full object-cover transition duration-200 group-hover:scale-[1.02]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-900/25 to-transparent opacity-0 transition group-hover:opacity-100" />
      </button>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <h3 className="m-0 line-clamp-2 text-[12.5px] font-semibold leading-snug text-slate-900">
          {fig.title}
        </h3>
        {fig.note_zh ? (
          <p className="m-0 line-clamp-2 text-xs text-slate-500">{fig.note_zh}</p>
        ) : null}
        <div className="flex flex-wrap gap-1">
          <span className="border border-sky-200 bg-sky-50 px-1.5 py-px text-[11px] text-sky-800 rounded-sm">
            {fig.category}
          </span>
          {(fig.tags || []).slice(0, 5).map((t) => (
            <span
              key={t}
              className="border border-slate-200 bg-slate-50 px-1.5 py-px text-[11px] text-slate-500 rounded-sm"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-1 pt-1">
          <button
            type="button"
            onClick={() => onStar(fig.id)}
            className={`inline-flex h-7 items-center gap-1 border px-2 text-xs rounded-sm ${
              starred
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <IconStar filled={starred} />
            {starred ? "已标" : "星标"}
          </button>
          <div className="flex-1" />
          <button
            type="button"
            disabled={deleting}
            onClick={() => onDelete(fig)}
            className="inline-flex h-7 items-center gap-1 border border-red-200 bg-red-50 px-2 text-xs text-red-700 hover:bg-red-100 disabled:opacity-60 rounded-sm"
            title="从仓库删除（需 BYOK）"
          >
            {deleting ? <IconSpinner /> : null}
            {deleting ? "删除中" : "删除"}
          </button>
        </div>
      </div>
    </article>
  );
}
