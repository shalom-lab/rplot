import { useRef } from "react";
import { IconGear, IconGitHub, IconSearch, IconSelect } from "../lib/icons";
import { REPO_URL } from "../lib/byok";

const DELETE_DEBOUNCE_MS = 600;

function BrandLogo({ className = "size-8" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <polygon
        points="16,2 28,9.5 28,22.5 16,30 4,22.5 4,9.5"
        fill="var(--color-accent)"
      />
      <text
        x="16"
        y="21.5"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="14"
        fontWeight="700"
        fontFamily="Inter, system-ui, sans-serif"
      >
        R
      </text>
    </svg>
  );
}

export default function Header({
  q,
  selectMode,
  selectedCount = 0,
  deleteBusy = false,
  deletingCount = 0,
  onQuery,
  onToggleSelect,
  onOpenSettings,
  onBulkDelete,
}) {
  const deleteLock = useRef(false);

  function handleDeleteClick() {
    if (deleteBusy) return;
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
        <div className="flex shrink-0 items-center gap-2.5">
          <BrandLogo className="size-[30px] shrink-0" />
          <div className="flex items-center gap-2.5">
            <span className="text-[16px] font-bold tracking-tight text-[var(--color-ink)]">
              Rplot
            </span>
            <span
              className="hidden h-4 w-px bg-[var(--color-line-strong)] sm:block"
              aria-hidden="true"
            />
            <span className="hidden text-[13px] font-medium text-[var(--color-muted)] sm:inline">
              R 科研图形图库
            </span>
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
          {deleteBusy && (
            <span className="tabular-nums text-[12.5px] text-[var(--color-muted)]">
              正在删除 {deletingCount} 张…
            </span>
          )}
          {selectMode && !deleteBusy && (
            <span className="tabular-nums text-[12.5px] text-[var(--color-muted)]">
              已选 {selectedCount}
            </span>
          )}
          {selectMode && (
            <button
              type="button"
              className="ui-btn ui-btn-danger h-8 px-2.5 text-[12.5px]"
              disabled={selectedCount === 0 || deleteBusy}
              onClick={handleDeleteClick}
              title={
                deleteBusy
                  ? "正在删除，请稍候"
                  : selectedCount === 0
                    ? "请先勾选卡片"
                    : "删除所选"
              }
            >
              {deleteBusy ? "删除中" : "删除"}
            </button>
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
