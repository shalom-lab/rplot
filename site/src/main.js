import "./style.css";

const APP = "rplot";
const KEY_REPO = `gh-${APP}-repo`;
const KEY_TOKEN = `gh-${APP}-token`;
const KEY_FAV = `rplot-favorites`;
const REPO_URL = "https://github.com/shalom-lab/rplot";
const DEFAULT_REPO = "shalom-lab/rplot";

/** @type {{name:string,description:string,categories:string[],figures:any[]}|null} */
let catalog = null;
let favorites = new Set();
let byok = { repo: "", token: "" };
let filter = { category: "all", q: "", starredOnly: false };
let busyDeleteId = null;

const $ = (sel, el = document) => el.querySelector(sel);

function loadFavorites() {
  try {
    const raw = localStorage.getItem(KEY_FAV);
    const arr = raw ? JSON.parse(raw) : [];
    favorites = new Set(Array.isArray(arr) ? arr : []);
  } catch {
    favorites = new Set();
  }
}

function saveFavorites() {
  localStorage.setItem(KEY_FAV, JSON.stringify([...favorites]));
}

function bootstrapByok() {
  byok.repo = localStorage.getItem(KEY_REPO) ?? "";
  byok.token = localStorage.getItem(KEY_TOKEN) ?? "";
}

function maskToken(t) {
  if (!t) return "";
  if (t.length <= 4) return "****";
  return "•".repeat(Math.min(20, t.length - 4)) + t.slice(-4);
}

function toast(msg, isErr = false) {
  let el = $("#toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.toggle("err", !!isErr);
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2600);
}

function assetUrl(path) {
  const base = import.meta.env.BASE_URL || "/";
  const clean = String(path || "").replace(/^\//, "");
  return `${base}${clean}`;
}

function icon(name) {
  const icons = {
    search: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>`,
    gear: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"/><path fill-rule="evenodd" d="M7.1 1.2a1 1 0 011.8 0l.2.5a5.6 5.6 0 011.5.6l.5-.2a1 1 0 011.3.5l.4.8a1 1 0 01-.3 1.2l-.3.3c.1.5.1 1 .1 1.5l.3.3a1 1 0 01.3 1.2l-.4.8a1 1 0 01-1.3.5l-.5-.2a5.6 5.6 0 01-1.5.6l-.2.5a1 1 0 01-1.8 0l-.2-.5a5.6 5.6 0 01-1.5-.6l-.5.2a1 1 0 01-1.3-.5l-.4-.8a1 1 0 01.3-1.2l.3-.3a5.7 5.7 0 01-.1-1.5l-.3-.3a1 1 0 01-.3-1.2l.4-.8a1 1 0 011.3-.5l.5.2a5.6 5.6 0 011.5-.6l.2-.5zM8 10.2a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4z"/></svg>`,
    star: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5l1.7 3.5 3.8.6-2.7 2.7.6 3.8L8 10.3l-3.4 1.8.6-3.8L2.5 5.6l3.8-.6L8 1.5z"/></svg>`,
    starOutline: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 2.2l1.5 3.1 3.4.5-2.5 2.4.6 3.4L8 9.9 4.9 11.6l.6-3.4L3 5.8l3.4-.5L8 2.2z"/></svg>`,
    github: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`,
    x: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4l8 8M12 4l-8 8"/></svg>`,
  };
  return icons[name] || "";
}

function byokConfigured() {
  return !!(byok.repo && byok.token);
}

function filteredFigures() {
  if (!catalog) return [];
  const q = filter.q.trim().toLowerCase();
  return catalog.figures.filter((f) => {
    if (filter.starredOnly && !favorites.has(f.id)) return false;
    if (filter.category !== "all" && f.category !== filter.category) return false;
    if (!q) return true;
    const hay = [f.title, f.note_zh, f.id, f.category, ...(f.tags || [])]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

function render() {
  const app = $("#app");
  const figs = filteredFigures();
  const cats = catalog?.categories || [];
  const statusOk = byokConfigured();

  app.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <h1>rplot</h1>
        <span class="sub">ggplot 精品图 · 工具站</span>
      </div>
      <div class="filters">
        <div class="chip-row" id="cat-row">
          <button type="button" class="chip ${filter.category === "all" ? "active" : ""}" data-cat="all">全部</button>
          ${cats
            .map(
              (c) =>
                `<button type="button" class="chip ${
                  filter.category === c ? "active" : ""
                }" data-cat="${escapeAttr(c)}">${escapeHtml(c)}</button>`
            )
            .join("")}
        </div>
        <label class="search">
          <span class="ico">${icon("search")}</span>
          <input id="q" type="search" placeholder="关键词：标题 / 标签 / 备注" value="${escapeAttr(
            filter.q
          )}" autocomplete="off" />
        </label>
        <span class="meta-count">${figs.length} / ${catalog?.figures?.length || 0}</span>
      </div>
      <div class="top-actions">
        <button type="button" class="icon-btn ${filter.starredOnly ? "active" : ""}" id="btn-fav-filter" title="仅看星标" aria-label="仅看星标">${icon(
          filter.starredOnly ? "star" : "starOutline"
        )}</button>
        <button type="button" class="icon-btn" id="btn-settings" title="BYOK 设置" aria-label="设置">${icon(
          "gear"
        )}</button>
        <a class="icon-btn gh" href="${REPO_URL}" target="_blank" rel="noopener noreferrer" title="GitHub 仓库" aria-label="GitHub 仓库">${icon(
          "github"
        )}</a>
      </div>
    </header>
    <main class="main">
      ${
        figs.length
          ? `<div class="grid">${figs.map(cardHtml).join("")}</div>`
          : `<div class="empty">没有匹配的图。试试清空筛选或关键词。</div>`
      }
    </main>
    <div class="overlay" id="settings-modal" hidden></div>
    <div class="overlay" id="lightbox" hidden></div>
    <div class="overlay" id="confirm-modal" hidden></div>
  `;

  $("#cat-row")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    filter.category = btn.dataset.cat;
    render();
  });

  const q = $("#q");
  q?.addEventListener("input", () => {
    filter.q = q.value;
    // soft re-render body only would be nicer; full render is fine at this size
    const count = $(".meta-count");
    const list = filteredFigures();
    if (count) count.textContent = `${list.length} / ${catalog?.figures?.length || 0}`;
    const main = $(".main");
    if (main) {
      main.innerHTML = list.length
        ? `<div class="grid">${list.map(cardHtml).join("")}</div>`
        : `<div class="empty">没有匹配的图。试试清空筛选或关键词。</div>`;
      bindCardEvents();
    }
  });

  $("#btn-fav-filter")?.addEventListener("click", () => {
    filter.starredOnly = !filter.starredOnly;
    render();
  });

  $("#btn-settings")?.addEventListener("click", () => openSettings());

  bindCardEvents();

  // keep status hint unused; silence lint
  void statusOk;
}

function cardHtml(f) {
  const starred = favorites.has(f.id);
  const deleting = busyDeleteId === f.id;
  return `
    <article class="card" data-id="${escapeAttr(f.id)}">
      <div class="thumb" data-open="${escapeAttr(f.id)}" title="放大预览">
        <img src="${escapeAttr(assetUrl(f.file))}" alt="${escapeAttr(f.title)}" loading="lazy" />
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(f.title)}</h3>
        ${f.note_zh ? `<p class="note">${escapeHtml(f.note_zh)}</p>` : ""}
        <div class="tags">
          <span class="tag cat">${escapeHtml(f.category || "")}</span>
          ${(f.tags || [])
            .slice(0, 5)
            .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
            .join("")}
        </div>
        <div class="card-foot">
          <button type="button" class="btn ${starred ? "starred" : "ghost"}" data-star="${escapeAttr(
            f.id
          )}" title="星标">${starred ? "★ 已标" : "☆ 星标"}</button>
          <span class="spacer"></span>
          <button type="button" class="btn danger" data-del="${escapeAttr(
            f.id
          )}" ${deleting ? "disabled" : ""} title="从仓库删除（需 BYOK）">${
            deleting ? `<span class="spin"></span> 删除中` : "删除"
          }</button>
        </div>
      </div>
    </article>`;
}

function bindCardEvents() {
  document.querySelectorAll("[data-star]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-star");
      if (favorites.has(id)) favorites.delete(id);
      else favorites.add(id);
      saveFavorites();
      render();
    });
  });
  document.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-del");
      const fig = catalog.figures.find((x) => x.id === id);
      if (fig) confirmDelete(fig);
    });
  });
  document.querySelectorAll("[data-open]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-open");
      const fig = catalog.figures.find((x) => x.id === id);
      if (fig) openLightbox(fig);
    });
  });
}

function openLightbox(f) {
  const box = $("#lightbox");
  box.hidden = false;
  box.innerHTML = `
    <div class="modal wide">
      <div class="modal-hd">
        <h2>${escapeHtml(f.title)}</h2>
        <span class="spacer" style="flex:1"></span>
        <button type="button" class="icon-btn" id="lb-close" aria-label="关闭">${icon("x")}</button>
      </div>
      <div class="modal-bd lightbox">
        <img src="${escapeAttr(assetUrl(f.file))}" alt="${escapeAttr(f.title)}" />
        <p class="meta">${escapeHtml(f.category)} · ${(f.tags || []).join(", ")}
          ${f.paper_or_site ? ` · <a href="${escapeAttr(f.paper_or_site)}" target="_blank" rel="noopener">来源</a>` : ""}
          ${f.license ? ` · ${escapeHtml(f.license)}` : ""}
        </p>
        ${f.note_zh ? `<p class="meta">${escapeHtml(f.note_zh)}</p>` : ""}
      </div>
    </div>`;
  const close = () => {
    box.hidden = true;
    box.innerHTML = "";
  };
  $("#lb-close").onclick = close;
  box.onclick = (e) => {
    if (e.target === box) close();
  };
}

function openSettings() {
  const box = $("#settings-modal");
  const saved = byokConfigured();
  box.hidden = false;
  box.innerHTML = `
    <div class="modal">
      <div class="modal-hd">
        <h2>BYOK 设置</h2>
        <span style="flex:1"></span>
        <button type="button" class="icon-btn" id="set-close" aria-label="关闭">${icon("x")}</button>
      </div>
      <div class="modal-bd">
        <p class="hint">密钥只存本机 <code>localStorage</code>。可事先注入，启动会自动读取。删除图需要 PAT（Contents 写权限）。</p>
        <div class="status-line ${saved ? "ok" : "warn"}" id="byok-status">
          ${
            saved
              ? `已保存 · repo <code>${escapeHtml(byok.repo)}</code> · token ${maskToken(byok.token)}`
              : "未设置 — 浏览/星标无需密钥；删除前请配置"
          }
        </div>
        <div class="field">
          <label for="inp-repo"><code>gh-rplot-repo</code>（owner/name）</label>
          <input id="inp-repo" placeholder="${DEFAULT_REPO}" value="${escapeAttr(byok.repo)}" autocomplete="off" spellcheck="false" />
        </div>
        <div class="field">
          <label for="inp-token"><code>gh-rplot-token</code>（PAT）</label>
          <input id="inp-token" type="password" placeholder="ghp_… 或 github_pat_…" value="${escapeAttr(
            byok.token
          )}" autocomplete="off" spellcheck="false" />
        </div>
        <p class="hint">保存时会先测连 GitHub API，通过才写入。清除需二次确认。</p>
      </div>
      <div class="modal-ft">
        <button type="button" class="btn danger" id="set-clear">清除</button>
        <button type="button" class="btn" id="set-cancel">取消</button>
        <button type="button" class="btn primary" id="set-save">保存</button>
      </div>
    </div>`;

  const close = () => {
    box.hidden = true;
    box.innerHTML = "";
  };
  $("#set-close").onclick = close;
  $("#set-cancel").onclick = close;
  box.onclick = (e) => {
    if (e.target === box) close();
  };

  $("#set-clear").onclick = () => {
    if (!confirm("确认清除本机 BYOK 配置（gh-rplot-repo / gh-rplot-token）？")) return;
    localStorage.removeItem(KEY_REPO);
    localStorage.removeItem(KEY_TOKEN);
    byok = { repo: "", token: "" };
    toast("已清除 BYOK");
    close();
    render();
  };

  $("#set-save").onclick = async () => {
    const repo = $("#inp-repo").value.trim();
    const token = $("#inp-token").value.trim();
    const btn = $("#set-save");
    if (!repo || !token) {
      toast("请填写 repo 与 token", true);
      return;
    }
    if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) {
      toast("repo 格式应为 owner/name", true);
      return;
    }
    btn.disabled = true;
    btn.innerHTML = `<span class="spin"></span> 测连中`;
    try {
      await testGithub(repo, token);
      localStorage.setItem(KEY_REPO, repo);
      localStorage.setItem(KEY_TOKEN, token);
      byok = { repo, token };
      toast("测连成功，已保存");
      close();
      render();
    } catch (err) {
      toast(err.message || "测连失败", true);
      btn.disabled = false;
      btn.textContent = "保存";
    }
  };
}

async function testGithub(repo, token) {
  const [owner, name] = repo.split("/");
  const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("鉴权失败：请检查 PAT scope（需 repo 权限）与仓库名");
  }
  if (res.status === 404) {
    throw new Error("仓库不存在或当前 token 无权访问");
  }
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}`);
  }
  return res.json();
}

function confirmDelete(fig) {
  if (!byokConfigured()) {
    toast("删除需要 BYOK：请先点齿轮配置 gh-rplot-repo / gh-rplot-token", true);
    openSettings();
    return;
  }
  const box = $("#confirm-modal");
  box.hidden = false;
  box.innerHTML = `
    <div class="modal">
      <div class="modal-hd"><h2>确认删除</h2></div>
      <div class="modal-bd">
        <p class="hint">将通过 GitHub Contents API：</p>
        <ol class="hint" style="margin:0;padding-left:18px">
          <li>从 <code>catalog.json</code> 移除该条目</li>
          <li>删除图片 <code>${escapeHtml(fig.file)}</code></li>
        </ol>
        <p><strong>${escapeHtml(fig.title)}</strong></p>
        <p class="hint">操作不可轻易撤销，请确认。</p>
      </div>
      <div class="modal-ft">
        <button type="button" class="btn" id="del-cancel">取消</button>
        <button type="button" class="btn danger" id="del-ok">确认删除</button>
      </div>
    </div>`;
  const close = () => {
    box.hidden = true;
    box.innerHTML = "";
  };
  $("#del-cancel").onclick = close;
  box.onclick = (e) => {
    if (e.target === box) close();
  };
  $("#del-ok").onclick = async () => {
    close();
    await deleteFigure(fig);
  };
}

async function ghHeaders() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${byok.token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function getContent(path) {
  const [owner, name] = byok.repo.split("/");
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${name}/contents/${path}?ref=main`,
    { headers: await ghHeaders() }
  );
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("鉴权失败：检查 PAT scope / 仓库名");
    }
    throw new Error(`读取 ${path} 失败（${res.status}）`);
  }
  return res.json();
}

async function putContent(path, contentBase64, sha, message) {
  const [owner, name] = byok.repo.split("/");
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${name}/contents/${path}`,
    {
      method: "PUT",
      headers: { ...(await ghHeaders()), "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: contentBase64,
        sha,
        branch: "main",
      }),
    }
  );
  if (!res.ok) {
    const t = await res.text();
    if (res.status === 401 || res.status === 403) {
      throw new Error("写入失败：鉴权或权限不足");
    }
    throw new Error(`写入 ${path} 失败（${res.status}） ${t.slice(0, 160)}`);
  }
  return res.json();
}

async function deleteContent(path, sha, message) {
  const [owner, name] = byok.repo.split("/");
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${name}/contents/${path}`,
    {
      method: "DELETE",
      headers: { ...(await ghHeaders()), "Content-Type": "application/json" },
      body: JSON.stringify({ message, sha, branch: "main" }),
    }
  );
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("删除文件失败：鉴权或权限不足");
    }
    throw new Error(`删除 ${path} 失败（${res.status}）`);
  }
  return res.json();
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

async function deleteFigure(fig) {
  busyDeleteId = fig.id;
  render();
  try {
    const catalogMeta = await getContent("catalog.json");
    const raw = decodeURIComponent(
      escape(atob(catalogMeta.content.replace(/\n/g, "")))
    );
    const data = JSON.parse(raw);
    const before = data.figures?.length || 0;
    data.figures = (data.figures || []).filter((x) => x.id !== fig.id);
    if (data.figures.length === before) {
      throw new Error("catalog 中未找到该条目（可能已被删除）");
    }
    data.figure_count = data.figures.length;
    data.updated = new Date().toISOString().slice(0, 10);
    // refresh categories from remaining
    const catSet = new Set(data.figures.map((x) => x.category).filter(Boolean));
    data.categories = [...catSet].sort();

    const newJson = JSON.stringify(data, null, 2) + "\n";
    await putContent(
      "catalog.json",
      utf8ToBase64(newJson),
      catalogMeta.sha,
      `chore(rplot): remove figure ${fig.id} from catalog`
    );

    const imgMeta = await getContent(fig.file);
    await deleteContent(
      fig.file,
      imgMeta.sha,
      `chore(rplot): delete figure image ${fig.file}`
    );

    catalog = data;
    favorites.delete(fig.id);
    saveFavorites();
    toast(`已删除 ${fig.id}`);
  } catch (err) {
    toast(err.message || "删除失败", true);
  } finally {
    busyDeleteId = null;
    render();
  }
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

async function boot() {
  bootstrapByok();
  loadFavorites();
  const res = await fetch(assetUrl("catalog.json"));
  if (!res.ok) throw new Error("无法加载 catalog.json");
  catalog = await res.json();
  render();
}

boot().catch((err) => {
  document.getElementById("app").innerHTML = `<div class="empty">加载失败：${escapeHtml(
    err.message
  )}</div>`;
});
