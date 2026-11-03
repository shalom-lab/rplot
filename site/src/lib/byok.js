export const APP = "rplot";
export const KEY_REPO = `gh-${APP}-repo`;
export const KEY_TOKEN = `gh-${APP}-token`;
export const KEY_FAV = "rplot-favorites";
export const DEFAULT_REPO = "shalom-lab/rplot";
export const REPO_URL = "https://github.com/shalom-lab/rplot";

export function readByok() {
  return {
    repo: localStorage.getItem(KEY_REPO) ?? "",
    token: localStorage.getItem(KEY_TOKEN) ?? "",
  };
}

export function writeByok(repo, token) {
  localStorage.setItem(KEY_REPO, repo);
  localStorage.setItem(KEY_TOKEN, token);
}

export function clearByok() {
  localStorage.removeItem(KEY_REPO);
  localStorage.removeItem(KEY_TOKEN);
}

export function maskToken(t) {
  if (!t) return "";
  if (t.length <= 4) return "****";
  return "•".repeat(Math.min(20, t.length - 4)) + t.slice(-4);
}

export function readFavorites() {
  try {
    const raw = localStorage.getItem(KEY_FAV);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function writeFavorites(set) {
  localStorage.setItem(KEY_FAV, JSON.stringify([...set]));
}

export function assetUrl(path) {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${String(path || "").replace(/^\//, "")}`;
}

function headers(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function testGithub(repo, token) {
  const [owner, name] = repo.split("/");
  const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
    headers: headers(token),
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("鉴权失败：请检查 PAT scope（需 repo 权限）与仓库名");
  }
  if (res.status === 404) {
    throw new Error("仓库不存在或当前 token 无权访问");
  }
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json();
}

async function getContent(repo, token, path) {
  const [owner, name] = repo.split("/");
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${name}/contents/${path}?ref=main`,
    { headers: headers(token) }
  );
  if (res.status === 401 || res.status === 403) {
    throw new Error("鉴权失败：检查 PAT scope / 仓库名");
  }
  if (!res.ok) throw new Error(`读取 ${path} 失败（${res.status}）`);
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

export async function deleteFigureRemote({ repo, token, fig, catalog }) {
  const catalogMeta = await getContent(repo, token, "catalog.json");
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
  data.categories = [
    ...new Set(data.figures.map((x) => x.category).filter(Boolean)),
  ].sort();

  const [owner, name] = repo.split("/");
  const putRes = await fetch(
    `https://api.github.com/repos/${owner}/${name}/contents/catalog.json`,
    {
      method: "PUT",
      headers: { ...headers(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `chore(rplot): remove figure ${fig.id} from catalog`,
        content: utf8ToBase64(JSON.stringify(data, null, 2) + "\n"),
        sha: catalogMeta.sha,
        branch: "main",
      }),
    }
  );
  if (!putRes.ok) {
    if (putRes.status === 401 || putRes.status === 403) {
      throw new Error("写入失败：鉴权或权限不足");
    }
    throw new Error(`写入 catalog.json 失败（${putRes.status}）`);
  }

  const imgMeta = await getContent(repo, token, fig.file);
  const delRes = await fetch(
    `https://api.github.com/repos/${owner}/${name}/contents/${fig.file}`,
    {
      method: "DELETE",
      headers: { ...headers(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `chore(rplot): delete figure image ${fig.file}`,
        sha: imgMeta.sha,
        branch: "main",
      }),
    }
  );
  if (!delRes.ok) {
    if (delRes.status === 401 || delRes.status === 403) {
      throw new Error("删除文件失败：鉴权或权限不足");
    }
    throw new Error(`删除 ${fig.file} 失败（${delRes.status}）`);
  }

  void catalog;
  return data;
}

export async function deleteFiguresRemote({ repo, token, figs }) {
  if (!figs?.length) throw new Error("未选择要删除的图");
  const ids = new Set(figs.map((f) => f.id));
  const catalogMeta = await getContent(repo, token, "catalog.json");
  const raw = decodeURIComponent(
    escape(atob(catalogMeta.content.replace(/\n/g, "")))
  );
  const data = JSON.parse(raw);
  const before = data.figures?.length || 0;
  data.figures = (data.figures || []).filter((x) => !ids.has(x.id));
  const removed = before - data.figures.length;
  if (removed === 0) {
    throw new Error("catalog 中未找到所选条目（可能已被删除）");
  }
  data.figure_count = data.figures.length;
  data.updated = new Date().toISOString().slice(0, 10);
  data.categories = [
    ...new Set(data.figures.map((x) => x.category).filter(Boolean)),
  ].sort();

  const [owner, name] = repo.split("/");
  const idList = [...ids].slice(0, 8).join(", ");
  const putRes = await fetch(
    `https://api.github.com/repos/${owner}/${name}/contents/catalog.json`,
    {
      method: "PUT",
      headers: { ...headers(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `chore(rplot): remove ${removed} figure(s) from catalog (${idList}${ids.size > 8 ? ", …" : ""})`,
        content: utf8ToBase64(JSON.stringify(data, null, 2) + "\n"),
        sha: catalogMeta.sha,
        branch: "main",
      }),
    }
  );
  if (!putRes.ok) {
    if (putRes.status === 401 || putRes.status === 403) {
      throw new Error("写入失败：鉴权或权限不足");
    }
    throw new Error(`写入 catalog.json 失败（${putRes.status}）`);
  }

  for (const fig of figs) {
    try {
      const imgMeta = await getContent(repo, token, fig.file);
      const delRes = await fetch(
        `https://api.github.com/repos/${owner}/${name}/contents/${fig.file}`,
        {
          method: "DELETE",
          headers: { ...headers(token), "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `chore(rplot): delete figure image ${fig.file}`,
            sha: imgMeta.sha,
            branch: "main",
          }),
        }
      );
      if (!delRes.ok && delRes.status !== 404) {
        throw new Error(`删除 ${fig.file} 失败（${delRes.status}）`);
      }
    } catch (err) {
      if (String(err.message || "").includes("404")) continue;
      throw err;
    }
  }

  return data;
}
