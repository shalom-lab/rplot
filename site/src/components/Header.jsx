import { IconGear, IconGitHub, IconSearch, IconStar } from "../lib/icons";
import { REPO_URL } from "../lib/byok";

export default function Header({
  q,
  starredOnly,
  onQuery,
  onToggleStarred,
  onOpenSettings,
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)]/80 bg-[var(--color-canvas)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-3 px-4">
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-[12px] bg-[var(--color-coral-soft)] text-[var(--color-coral-text)]">
            <span className="text-[13px] font-bold tracking-tight">R</span>
          </div>
          <div className="leading-tight">
            <div className="text-[14px] font-semibold tracking-tight text-[var(--color-ink)]">
              rplot
            </div>
            <div className="hidden text-[11px] text-[var(--color-muted)] sm:block">
              ggplot 精品图书架
            </div>
          </div>
        </div>

        <label className="r-search mx-auto flex h-10 w-full max-w-xl items-center gap-2 border border-[var(--color-line-strong)] bg-white px-3.5 shadow-[0_1px_2px_rgba(28,25,23,0.04)] transition focus-within:border-[var(--color-coral)] focus-within:ring-2 focus-within:ring-[var(--color-coral)]/25">
          <IconSearch className="size-4 shrink-0 text-[var(--color-muted)]" />
          <input
            type="search"
            value={q}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="搜索标题、标签、备注…"
            className="w-full min-w-0 border-0 bg-transparent text-[13px] outline-none placeholder:text-stone-400"
            autoComplete="off"
          />
          <kbd className="hidden shrink-0 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-1.5 py-0.5 font-mono text-[10px] text-stone-400 sm:inline">
            /
          </kbd>
        </label>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            title="仅看星标"
            aria-label="仅看星标"
            aria-pressed={starredOnly}
            onClick={onToggleStarred}
            className={`inline-flex size-9 items-center justify-center rounded-[12px] transition ${
              starredOnly
                ? "bg-[var(--color-coral-soft)] text-[var(--color-coral-text)]"
                : "text-[var(--color-muted)] hover:bg-white/70 hover:text-[var(--color-ink)]"
            }`}
          >
            <IconStar filled={starredOnly} className="size-4" />
          </button>
          <button
            type="button"
            title="BYOK 设置"
            aria-label="设置"
            onClick={onOpenSettings}
            className="inline-flex size-9 items-center justify-center rounded-[12px] text-[var(--color-muted)] transition hover:bg-white/70 hover:text-[var(--color-ink)]"
          >
            <IconGear className="size-4" />
          </button>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub 仓库"
            aria-label="GitHub 仓库"
            className="inline-flex size-9 items-center justify-center rounded-[12px] text-[var(--color-muted)] transition hover:bg-white/70 hover:text-[var(--color-ink)]"
          >
            <IconGitHub className="size-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
