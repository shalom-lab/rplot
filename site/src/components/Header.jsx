import { IconGear, IconGitHub, IconSearch, IconStar } from "../lib/icons";
import { REPO_URL } from "../lib/byok";

export default function Header({
  categories,
  category,
  q,
  starredOnly,
  shown,
  total,
  onCategory,
  onQuery,
  onToggleStarred,
  onOpenSettings,
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 px-3 py-2">
        <div className="flex shrink-0 items-baseline gap-1.5 pr-1">
          <h1 className="m-0 text-[15px] font-bold tracking-tight text-slate-900">
            rplot
          </h1>
          <span className="hidden text-xs text-slate-500 sm:inline">
            ggplot 精品图 · 工具站
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <div className="flex max-w-full flex-wrap gap-1">
            <Chip active={category === "all"} onClick={() => onCategory("all")}>
              全部
            </Chip>
            {categories.map((c) => (
              <Chip
                key={c}
                active={category === c}
                onClick={() => onCategory(c)}
              >
                {c}
              </Chip>
            ))}
          </div>

          <label className="flex h-7 min-w-[160px] max-w-[280px] flex-1 items-center gap-1.5 border border-slate-200 bg-slate-50 px-2 rounded-sm focus-within:border-sky-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100">
            <IconSearch className="size-3.5 shrink-0 text-slate-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="关键词：标题 / 标签 / 备注"
              className="w-full min-w-0 border-0 bg-transparent outline-none placeholder:text-slate-400"
              autoComplete="off"
            />
          </label>

          <span className="shrink-0 tabular-nums text-xs text-slate-500">
            {shown} / {total}
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            title="仅看星标"
            aria-label="仅看星标"
            onClick={onToggleStarred}
            className={`inline-flex size-7.5 items-center justify-center rounded-sm border ${
              starredOnly
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800"
            }`}
            style={{ width: 30, height: 30 }}
          >
            <IconStar filled={starredOnly} className="size-4" />
          </button>
          <button
            type="button"
            title="BYOK 设置"
            aria-label="设置"
            onClick={onOpenSettings}
            className="inline-flex items-center justify-center border border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-sm"
            style={{ width: 30, height: 30 }}
          >
            <IconGear />
          </button>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub 仓库"
            aria-label="GitHub 仓库"
            className="inline-flex items-center justify-center border border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-sm"
            style={{ width: 30, height: 30 }}
          >
            <IconGitHub />
          </a>
        </div>
      </div>
    </header>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-6 whitespace-nowrap border px-2 text-xs rounded-sm ${
        active
          ? "border-sky-300 bg-sky-50 font-semibold text-sky-800"
          : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}
