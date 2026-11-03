import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import FigureCard from "./components/FigureCard";
import SettingsModal from "./components/SettingsModal";
import ConfirmDelete from "./components/ConfirmDelete";
import Lightbox from "./components/Lightbox";
import Toast from "./components/Toast";
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
  const [q, setQ] = useState("");
  const [starredOnly, setStarredOnly] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, err = false) => {
    setToast({ msg, err });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    // bootstrap BYOK + favorites already hydrated from localStorage
    fetch(assetUrl("catalog.json"))
      .then((r) => {
        if (!r.ok) throw new Error("无法加载 catalog.json");
        return r.json();
      })
      .then(setCatalog)
      .catch((e) => setLoadErr(e.message || "加载失败"));
  }, []);

  const figures = useMemo(() => {
    if (!catalog) return [];
    const needle = q.trim().toLowerCase();
    return catalog.figures.filter((f) => {
      if (starredOnly && !favorites.has(f.id)) return false;
      if (category !== "all" && f.category !== category) return false;
      if (!needle) return true;
      const hay = [f.title, f.note_zh, f.id, f.category, ...(f.tags || [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [catalog, q, category, starredOnly, favorites]);

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
      showToast("删除需要 BYOK：请先点齿轮配置 gh-rplot-repo / gh-rplot-token", true);
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

  if (loadErr) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-slate-500">
        加载失败：{loadErr}
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-slate-400">
        加载中…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        categories={catalog.categories || []}
        category={category}
        q={q}
        starredOnly={starredOnly}
        shown={figures.length}
        total={catalog.figures.length}
        onCategory={setCategory}
        onQuery={setQ}
        onToggleStarred={() => setStarredOnly((v) => !v)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="mx-auto max-w-[1400px] px-3 py-3 pb-8">
        {figures.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2">
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
          <div className="border border-dashed border-slate-300 bg-white px-4 py-14 text-center text-slate-500 rounded-md">
            没有匹配的图。试试清空筛选或关键词。
          </div>
        )}
      </main>

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
