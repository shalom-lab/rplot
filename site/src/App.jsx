import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import FigureCard from "./components/FigureCard";
import SettingsModal from "./components/SettingsModal";
import ConfirmDelete from "./components/ConfirmDelete";
import Lightbox from "./components/Lightbox";
import Toast from "./components/Toast";
import { IconImage } from "./lib/icons";
import {
  assetUrl,
  deleteFigureRemote,
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
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const starredOnly = category === "__starred__";

  const showToast = useCallback((msg, err = false) => {
    setToast({ msg, err });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2600);
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
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
    if (starredOnly) return { title: "星标收藏", sub: "本机收藏的图，仅存在浏览器 localStorage" };
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

  function toggleStar(id) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeFavorites(next);
      return next;
    });
  }

  function requestDelete(fig) {
    if (!(byok.repo && byok.token)) {
      showToast(
        "删除需要 BYOK：请先点齿轮配置 gh-rplot-repo / gh-rplot-token",
        true
      );
      setSettingsOpen(true);
      return;
    }
    setPendingDelete(fig);
  }

  async function confirmDelete() {
    const fig = pendingDelete;
    setPendingDelete(null);
    if (!fig) return;
    setBusyId(fig.id);
    try {
      const data = await deleteFigureRemote({
        repo: byok.repo,
        token: byok.token,
        fig,
        catalog,
      });
      setCatalog(data);
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(fig.id);
        writeFavorites(next);
        return next;
      });
      showToast(`已删除 ${fig.id}`);
    } catch (err) {
      showToast(err.message || "删除失败", true);
    } finally {
      setBusyId(null);
    }
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
        <div className="border-b border-[var(--color-line)] px-4 py-3">
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
          <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="overflow-hidden border border-[var(--color-line)] r-card">
                <div className="skeleton aspect-[3/4] w-full" />
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
        starredOnly={starredOnly}
        onQuery={setQ}
        onToggleStarred={() =>
          setCategory((c) => (c === "__starred__" ? "all" : "__starred__"))
        }
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-5 pb-14">
        <Sidebar
          categories={catalog.categories || []}
          counts={counts}
          category={category}
          total={catalog.figures.length}
          onCategory={onSidebarCategory}
        />

        {/* Mobile category chips */}
        <div className="hidden" />

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

          <div className="mb-4">
            <h2 className="m-0 text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">
              {heading.title}
            </h2>
            <p className="mt-1 mb-0 text-[13px] text-[var(--color-muted)]">
              {heading.sub}
              <span className="mx-1.5 text-stone-300">·</span>
              <span className="font-mono text-[12px]">
                {figures.length} 张
              </span>
            </p>
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
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {figures.map((fig) => (
                <FigureCard
                  key={fig.id}
                  fig={fig}
                  starred={favorites.has(fig.id)}
                  deleting={busyId === fig.id}
                  onStar={toggleStar}
                  onDelete={requestDelete}
                  onOpen={setLightbox}
                />
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
      {pendingDelete && (
        <ConfirmDelete
          fig={pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
      {lightbox && (
        <Lightbox fig={lightbox} onClose={() => setLightbox(null)} />
      )}
      <Toast toast={toast} />
    </div>
  );
}
