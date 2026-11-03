import { useState } from "react";
import ModalShell from "./ModalShell";
import { IconSpinner } from "../lib/icons";
import {
  DEFAULT_REPO,
  clearByok,
  maskToken,
  testGithub,
  writeByok,
} from "../lib/byok";

export default function SettingsModal({ byok, onClose, onSaved, onCleared, toast }) {
  const [repo, setRepo] = useState(byok.repo || "");
  const [token, setToken] = useState(byok.token || "");
  const [saving, setSaving] = useState(false);
  const saved = !!(byok.repo && byok.token);

  async function handleSave() {
    const r = repo.trim();
    const t = token.trim();
    if (!r || !t) {
      toast("请填写 repo 与 token", true);
      return;
    }
    if (!/^[^/\s]+\/[^/\s]+$/.test(r)) {
      toast("repo 格式应为 owner/name", true);
      return;
    }
    setSaving(true);
    try {
      await testGithub(r, t);
      writeByok(r, t);
      onSaved({ repo: r, token: t });
      toast("测连成功，已保存");
      onClose();
    } catch (err) {
      toast(err.message || "测连失败", true);
    } finally {
      setSaving(false);
    }
  }

  function handleClear() {
    if (!confirm("确认清除本机 BYOK 配置（gh-rplot-repo / gh-rplot-token）？")) {
      return;
    }
    clearByok();
    onCleared();
    toast("已清除 BYOK");
    onClose();
  }

  return (
    <ModalShell
      title="BYOK 设置"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="h-7 border border-red-200 bg-red-50 px-2.5 text-red-700 hover:bg-red-100 rounded-sm"
            onClick={handleClear}
          >
            清除
          </button>
          <button
            type="button"
            className="h-7 border border-slate-200 bg-white px-2.5 text-slate-700 hover:bg-slate-50 rounded-sm"
            onClick={onClose}
          >
            取消
          </button>
          <button
            type="button"
            disabled={saving}
            className="inline-flex h-7 items-center gap-1.5 border border-sky-700 bg-sky-700 px-2.5 text-white hover:bg-sky-800 disabled:opacity-60 rounded-sm"
            onClick={handleSave}
          >
            {saving ? <IconSpinner /> : null}
            {saving ? "测连中" : "保存"}
          </button>
        </>
      }
    >
      <p className="m-0 text-xs text-slate-500">
        密钥只存本机 <code className="rounded-sm bg-slate-100 px-1">localStorage</code>
        。可事先注入，启动会自动读取。删除图需要 PAT（Contents 写权限）。
      </p>
      <div
        className={`mt-2.5 border px-2 py-1.5 text-xs rounded-sm ${
          saved
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-900"
        }`}
      >
        {saved ? (
          <>
            已保存 · repo <code>{byok.repo}</code> · token {maskToken(byok.token)}
          </>
        ) : (
          "未设置 — 浏览/星标无需密钥；删除前请配置"
        )}
      </div>
      <label className="mt-3 block">
        <span className="mb-1 block text-xs text-slate-500">
          <code>gh-rplot-repo</code>（owner/name）
        </span>
        <input
          className="h-8 w-full border border-slate-200 bg-slate-50 px-2 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 rounded-sm"
          value={repo}
          placeholder={DEFAULT_REPO}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => setRepo(e.target.value)}
        />
      </label>
      <label className="mt-2.5 block">
        <span className="mb-1 block text-xs text-slate-500">
          <code>gh-rplot-token</code>（PAT）
        </span>
        <input
          type="password"
          className="h-8 w-full border border-slate-200 bg-slate-50 px-2 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 rounded-sm"
          value={token}
          placeholder="ghp_… 或 github_pat_…"
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => setToken(e.target.value)}
        />
      </label>
      <p className="mt-2.5 mb-0 text-xs text-slate-500">
        保存时会先测连 GitHub API，通过才写入。清除需二次确认。
      </p>
    </ModalShell>
  );
}
