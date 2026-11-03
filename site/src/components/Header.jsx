import { useRef } from "react";
import { IconGear, IconGitHub, IconSearch, IconSelect } from "../lib/icons";
import { REPO_URL } from "../lib/byok";

const DELETE_DEBOUNCE_MS = 600;

export default function Header({
  q,
  selectMode,
  selectedCount = 0,
  onQuery,
  onToggleSelect,
  onOpenSettings,
  onBulkDelete,
}) {
  const deleteLock = useRef(false);

  function handleDeleteClick() {
    if (selectedCount === 0) return;
    if (deleteLock.current) return;
    deleteLock.current = true;
    try {
      onBulkDelete?.();
    } finally {
      window.setTimeout(() => {
        deleteLock.current = false;
      }, DELETE_DEBOUNCE_MS);
    }
  }

  return (
    <header className="sticky top-0 z-40 hairline-b bg-[var(--color-canvas)]/92 backdrop-blur-md">
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

        {/* Right: [已选] [删除] [选择] [gear] [GitHub] — select fixed left of settings */}
        <div className="flex shrink-0 items-center gap-2">
          {selectMode && (
            <>
              <span className="tabular-nums text-[12.5px] text-[var(--color-muted)]">
                已选 {selectedCount}
              </span>
              <button
                type="button"
                className="border-0 bg-transparent px-1 text-[12.5px] font-medium text-[#9f4034] transition hover:opacity-70 disabled:opacity-40"
                disabled={selectedCount === 0}
                onClick={handleDeleteClick}
                title={selectedCount === 0 ? "请先勾选卡片" : "删除所选"}
              >
                删除
              </button>
            </>
          )}

          <button
            type="button"
            title={selectMode ? "退出选择模式" : "进入选择模式"}
            aria-label="选择"
            aria-pressed={selectMode}
            onClick={onToggleSelect}
            className="ui-btn ui-icon-btn"
          >
            <IconSelect className="size-[18px]" checked={selectMode} />
          </button>

          <button
            type="button"
            title="设置 · BYOK"
            aria-label="设置"
            onClick={onOpenSettings}
            className="ui-btn ui-icon-btn"
          >
            <IconGear className="size-[18px]" />
          </button>

          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub 仓库"
            aria-label="GitHub 仓库"
            className="ui-btn ui-icon-btn"
          >
            <IconGitHub className="size-[18px]" />
          </a>
        </div>
      </div>
    </header>
  );
}
