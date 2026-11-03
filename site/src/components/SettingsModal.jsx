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
            className="r-control h-9 border border-red-200 bg-red-50 px-3.5 text-[12px] text-red-700 hover:bg-red-100"
            onClick={handleClear}
          >
            清除
          </button>
          <button
            type="button"
            className="r-control h-9 border border-[var(--color-line-strong)] bg-white px-3.5 text-[12px] hover:bg-[var(--color-panel)]"
            onClick={onClose}
          >
            取消
          </button>
          <button
            type="button"
            disabled={saving}
            className="r-control inline-flex h-9 items-center gap-1.5 border border-[var(--color-accent)] bg-[var(--color-accent)] px-3.5 text-[12px] font-medium text-white hover:brightness-95 disabled:opacity-60"
            onClick={handleSave}
          >
            {saving ? <IconSpinner /> : null}
            {saving ? "测连中" : "保存"}
          </button>
        </>
      }
    >
      <p className="m-0 text-[12.5px] leading-relaxed text-[var(--color-muted)]">
        密钥只存本机{" "}
        <code className="rounded-lg bg-[var(--color-panel)] px-1.5 py-px font-mono text-[11px]">
          localStorage
        </code>
        。可事先注入，启动会自动读取。删除图需要 PAT。
      </p>
      <div
        className={`r-control mt-3 border px-3 py-2 text-[12px] ${
          saved
            ? "border-emerald-200 bg-emerald-50/80 text-emerald-900"
            : "border-amber-200 bg-amber-50/80 text-amber-950"
        }`}
      >
        {saved ? (
          <>
            已保存 · repo{" "}
            <code className="font-mono text-[11px]">{byok.repo}</code> · token{" "}
            {maskToken(byok.token)}
          </>
        ) : (
          "未设置 — 浏览 / 星标无需密钥；删除前请配置"
        )}
      </div>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted)]">
          gh-rplot-repo
        </span>
        <input
          className="r-control h-10 w-full border border-[var(--color-line-strong)] bg-[var(--color-panel)] px-3 font-mono text-[12.5px] outline-none transition focus:border-[var(--color-coral)] focus:bg-white focus:ring-2 focus:ring-[var(--color-coral)]/25"
          value={repo}
          placeholder={DEFAULT_REPO}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => setRepo(e.target.value)}
        />
      </label>
      <label className="mt-3 block">
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted)]">
          gh-rplot-token
        </span>
        <input
          type="password"
          className="r-control h-10 w-full border border-[var(--color-line-strong)] bg-[var(--color-panel)] px-3 font-mono text-[12.5px] outline-none transition focus:border-[var(--color-coral)] focus:bg-white focus:ring-2 focus:ring-[var(--color-coral)]/25"
          value={token}
          placeholder="ghp_… 或 github_pat_…"
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => setToken(e.target.value)}
        />
      </label>
    </ModalShell>
  );
}
