export default function Sidebar({ categories, counts, category, total, onCategory }) {
  return (
    <aside className="hidden w-[228px] shrink-0 md:block">
      <div className="sticky top-[4.25rem] hairline-r min-h-[calc(100vh-5rem)] space-y-5 pr-4">
        <div>
          <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
            浏览
          </p>
          <nav className="space-y-0.5">
            <button
              type="button"
              className="sidebar-item"
              aria-current={category === "all" ? "true" : undefined}
              onClick={() => onCategory("all")}
            >
              <span>全部图集</span>
              <span className="sidebar-count">{total}</span>
            </button>
            <button
              type="button"
              className="sidebar-item"
              aria-current={category === "__starred__" ? "true" : undefined}
              onClick={() => onCategory("__starred__")}
            >
              <span>星标收藏</span>
              <span className="sidebar-count">{counts.__starred__ || 0}</span>
            </button>
          </nav>
        </div>

        <div>
          <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
            分类
          </p>
          <nav className="space-y-0.5">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className="sidebar-item"
                aria-current={category === c ? "true" : undefined}
                onClick={() => onCategory(c)}
              >
                <span className="truncate">{c}</span>
                <span className="sidebar-count">{counts[c] || 0}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}
