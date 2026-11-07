import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import FigureCard from "./components/FigureCard";
import SettingsModal from "./components/SettingsModal";
import ConfirmDialog from "./components/ConfirmDialog";
import Lightbox from "./components/Lightbox";
import Toast from "./components/Toast";
import { IconImage } from "./lib/icons";
import {
  assetUrl,
  deleteFiguresRemote,
  readByok,
  readFavorites,
  writeFavorites,
} from "./lib/byok";

export default function App() {
  const [catalog, setCatalog] = useState(null);
  const [loadErr, setLoadErr] = useState("");
  const [byok, setByok] = useState(() => readByok());
  const [favorites, setFavorites] = useState(() => readFavorites());
  const [category, setCategory] = useState("all");
  const [tag, setTag] = useState("all");
  const [q, setQ] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [toast, setToast] = useState(null);

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [bulkStep, setBulkStep] = useState(0); // 0 none, 1 first confirm, 2 second confirm
  const [bulkBusy, setBulkBusy] = useState(false);
  const [deletingCount, setDeletingCount] = useState(0);

  const starredOnly = category === "__starred__";

  const showToast = useCallback((msg, err = false, ms = 2600) => {
    setToast({ msg, err });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), ms);
  }, []);

  useEffect(() => {
    fetch(assetUrl("catalog.json"))
      .then((r) => {
        if (!r.ok) throw new Error("无法加载 catalog.json");
        return r.json();
      })
      .then(setCatalog)
      .catch((e) => setLoadErr(e.message || "加载失败"));
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (
        e.key === "/" &&
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        document.querySelector('input[type="search"]')?.focus();
      }
      if (e.key === "Escape" && selectMode) {
        setSelectMode(false);
        setSelected(new Set());
        setBulkStep(0);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectMode]);

  const counts = useMemo(() => {
    const map = { __starred__: favorites.size };
    if (!catalog) return map;
    for (const f of catalog.figures) {
      map[f.category] = (map[f.category] || 0) + 1;
    }
    return map;
  }, [catalog, favorites]);

  const popularTags = useMemo(() => {
    if (!catalog) return [];
    const freq = new Map();
    for (const f of catalog.figures) {
      for (const t of f.tags || []) {
        freq.set(t, (freq.get(t) || 0) + 1);
      }
    }
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 12)
      .map(([t]) => t);
  }, [catalog]);

  const figures = useMemo(() => {
    if (!catalog) return [];
    const needle = q.trim().toLowerCase();
    return catalog.figures.filter((f) => {
      if (starredOnly && !favorites.has(f.id)) return false;
      if (!starredOnly && category !== "all" && f.category !== category) {
        return false;
      }
      if (tag !== "all" && !(f.tags || []).includes(tag)) return false;
      if (!needle) return true;
      const hay = [f.title, f.note_zh, f.id, f.category, ...(f.tags || [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [catalog, q, category, tag, starredOnly, favorites]);

  const heading = useMemo(() => {
    if (starredOnly) {
      return { title: "星标收藏", sub: "本机收藏的图，仅存在浏览器 localStorage" };
    }
    if (category === "all") {
      return {
        title: "全部图集",
        sub: "真实 ggplot / 科研图参考，按分类与关键词浏览",
      };
    }
    return {
      title: category,
      sub: `分类 · ${counts[category] || 0} 张`,
    };
  }, [category, starredOnly, counts]);

  const selectedFigs = useMemo(() => {
    if (!catalog) return [];
    return catalog.figures.filter((f) => selected.has(f.id));
  }, [catalog, selected]);

  function toggleStar(id) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeFavorites(next);
      return next;
    });
  }

  function toggleSelectId(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
    setBulkStep(0);
  }

  function requestBulkDelete() {
    if (bulkBusy) {
      showToast("正在删除中，请稍候", true);
      return;
    }
    if (selected.size === 0) {
      showToast("请先选择要删除的图", true);
      return;
    }
    if (!(byok.repo && byok.token)) {
      showToast(
        "删除需要 BYOK：请先点齿轮配置 gh-rplot-repo / gh-rplot-token",
        true
      );
      setSettingsOpen(true);
      return;
    }
    setBulkStep(1);
  }

  function runBulkDelete() {
    if (bulkBusy) return;
    const figs = selectedFigs.slice();
    const count = figs.length;
    if (!count || !catalog) return;

    const ids = new Set(figs.map((f) => f.id));
    const catalogSnapshot = catalog;
    const favSnapshot = new Set(favorites);

    // Close confirm immediately — delete runs in background
    setBulkStep(0);
    setBulkBusy(true);
    setDeletingCount(count);

    // Optimistic remove from gallery
    setCatalog((prev) => {
      if (!prev) return prev;
      const nextFigures = prev.figures.filter((f) => !ids.has(f.id));
      return {
        ...prev,
        figures: nextFigures,
        figure_count: nextFigures.length,
        categories: [
          ...new Set(nextFigures.map((x) => x.category).filter(Boolean)),
        ].sort(),
      };
    });

    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });

    setFavorites((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      writeFavorites(next);
      return next;
    });

    showToast(`正在删除 ${count} 张…`, false, 4000);

    void (async () => {
      try {
        const data = await deleteFiguresRemote({
          repo: byok.repo,
          token: byok.token,
          figs,
        });
        setCatalog(data);
        showToast(`已删除 ${count} 张图`);
      } catch (err) {
        setCatalog(catalogSnapshot);
        setFavorites(() => {
          writeFavorites(favSnapshot);
          return new Set(favSnapshot);
        });
        showToast(err.message || "批量删除失败", true, 4000);
      } finally {
        setBulkBusy(false);
        setDeletingCount(0);
      }
    })();
  }

  function onSidebarCategory(next) {
    setCategory(next);
    setTag("all");
  }

  if (loadErr) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="r-card border border-red-200 bg-white p-8 shadow-sm">
          <p className="m-0 text-[14px] font-medium text-red-700">加载失败</p>
          <p className="mt-2 mb-0 text-[12.5px] text-[var(--color-muted)]">
            {loadErr}
          </p>
        </div>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="min-h-screen bg-[var(--color-canvas)]">
        <div className="hairline-b px-4 py-3">
          <div className="mx-auto flex max-w-[1500px] items-center gap-3">
            <div className="skeleton h-8 w-28 r-control" />
            <div className="skeleton mx-auto h-10 max-w-xl flex-1 r-search" />
            <div className="skeleton h-9 w-28 r-control" />
          </div>
        </div>
        <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-5">
          <div className="hidden w-[220px] space-y-2 md:block">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-9 w-full r-chip" />
            ))}
          </div>
          <div className="masonry flex-1">
            {[220, 280, 240, 300, 260, 230, 290, 250, 270, 210].map((h, i) => (
              <div
                key={i}
                className="masonry-item overflow-hidden border border-[var(--color-line)] r-card"
              >
                <div className="skeleton w-full" style={{ height: h }} />
                <div className="space-y-2 p-3">
                  <div className="skeleton h-3.5 w-4/5 r-chip" />
                  <div className="skeleton h-3 w-2/5 r-chip" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <Header
        q={q}
        selectMode={selectMode}
        selectedCount={selected.size}
        deleteBusy={bulkBusy}
        deletingCount={deletingCount}
        onQuery={setQ}
        onToggleSelect={() => {
          if (selectMode) exitSelectMode();
          else {
            setSelectMode(true);
            setSelected(new Set());
          }
        }}
        onOpenSettings={() => setSettingsOpen(true)}
        onBulkDelete={requestBulkDelete}
      />

      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-5 pb-14">
        <Sidebar
          categories={catalog.categories || []}
          counts={counts}
          category={category}
          total={catalog.figures.length}
          onCategory={onSidebarCategory}
        />

        <main className="min-w-0 flex-1">
          <div className="mb-4 md:hidden">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                className="filter-chip shrink-0"
                aria-pressed={category === "all"}
                onClick={() => onSidebarCategory("all")}
              >
                全部
              </button>
              {(catalog.categories || []).map((c) => (
                <button
                  key={c}
                  type="button"
                  className="filter-chip shrink-0"
                  aria-pressed={category === c}
                  onClick={() => onSidebarCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="m-0 text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">
                {heading.title}
              </h2>
              <p className="mt-1 mb-0 text-[13px] text-[var(--color-muted)]">
                {selectMode
                  ? `选择模式 · 已选 ${selected.size} 张 · Esc 退出`
                  : heading.sub}
                <span className="mx-1.5 text-stone-300">·</span>
                <span className="font-mono text-[12px]">{figures.length} 张</span>
              </p>
            </div>
          </div>

          {popularTags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="filter-chip"
                aria-pressed={tag === "all"}
                onClick={() => setTag("all")}
              >
                全部标签
              </button>
              {popularTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="filter-chip"
                  aria-pressed={tag === t}
                  onClick={() => setTag(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {figures.length ? (
            <div className="masonry">
              {figures.map((fig) => (
                <div key={fig.id} className="masonry-item">
                  <FigureCard
                    fig={fig}
                    starred={favorites.has(fig.id)}
                    selectMode={selectMode}
                    selected={selected.has(fig.id)}
                    onStar={toggleStar}
                    onToggleSelect={toggleSelectId}
                    onOpen={setLightbox}
                    onToast={showToast}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="r-card mx-auto mt-8 flex max-w-md flex-col items-center border border-dashed border-[var(--color-line-strong)] bg-white/60 px-6 py-14 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-[14px] border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-muted)]">
                <IconImage className="size-6" />
              </div>
              <p className="m-0 text-[14px] font-medium text-[var(--color-ink)]">
                没有匹配的图
              </p>
              <p className="mt-1.5 mb-0 text-[12.5px] text-[var(--color-muted)]">
                试试换个分类、标签，或清空搜索词。
              </p>
              <button
                type="button"
                className="r-control mt-4 h-9 border border-[var(--color-line-strong)] bg-white px-3.5 text-[12px] hover:bg-[var(--color-panel)]"
                onClick={() => {
                  setCategory("all");
                  setTag("all");
                  setQ("");
                }}
              >
                重置筛选
              </button>
            </div>
          )}
        </main>
      </div>

      {settingsOpen && (
        <SettingsModal
          byok={byok}
          onClose={() => setSettingsOpen(false)}
          onSaved={setByok}
          onCleared={() => setByok({ repo: "", token: "" })}
          toast={showToast}
        />
      )}

      {bulkStep === 1 && (
        <ConfirmDialog
          title="确认删除所选图？"
          danger
          confirmLabel="继续"
          cancelLabel="取消"
          onCancel={() => setBulkStep(0)}
          onConfirm={() => {
            if (!bulkBusy) setBulkStep(2);
          }}
        >
          <p className="m-0">
            已选择 <strong>{selectedFigs.length}</strong> 张图。下一步将再次确认后，通过
            GitHub Contents API 更新{" "}
            <code className="rounded-[6px] bg-[var(--color-panel)] px-1 font-mono text-[11.5px] text-[var(--color-ink)]">
              catalog.json
            </code>{" "}
            并删除对应图片文件。
          </p>
          <ul className="mt-3 mb-0 max-h-40 list-disc overflow-auto pl-5 text-[12.5px]">
            {selectedFigs.slice(0, 12).map((f) => (
              <li key={f.id}>{f.title}</li>
            ))}
            {selectedFigs.length > 12 ? (
              <li>…另有 {selectedFigs.length - 12} 张</li>
            ) : null}
          </ul>
        </ConfirmDialog>
      )}

      {bulkStep === 2 && (
        <ConfirmDialog
          title="再次确认永久删除"
          danger
          confirmLabel="确认删除"
          cancelLabel="返回"
          onCancel={() => setBulkStep(1)}
          onConfirm={runBulkDelete}
        >
          <p className="m-0">
            将从仓库 <code className="font-mono text-[12px]">{byok.repo}</code>{" "}
            永久删除这 <strong>{selectedFigs.length}</strong>{" "}
            张图（catalog + 图片）。此操作不易撤销，请再次确认。
          </p>
        </ConfirmDialog>
      )}

      {lightbox && !selectMode && (
        <Lightbox fig={lightbox} onClose={() => setLightbox(null)} />
      )}
      <Toast toast={toast} />
    </div>
  );
}
