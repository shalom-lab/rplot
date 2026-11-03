import { useState } from "react";
import ModalShell from "./ModalShell";
import ConfirmDialog from "./ConfirmDialog";
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
  const [confirmClear, setConfirmClear] = useState(false);
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

  function doClear() {
    clearByok();
    onCleared();
    setConfirmClear(false);
    toast("已清除 BYOK");
    onClose();
  }

  return (
    <>
      <ModalShell
        title="设置 · BYOK"
        onClose={saving ? undefined : onClose}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-danger mr-auto"
              disabled={saving || (!byok.repo && !byok.token && !repo && !token)}
              onClick={() => setConfirmClear(true)}
            >
              清除密钥
            </button>
            <button
              type="button"
              className="ui-btn"
              disabled={saving}
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary min-w-[88px]"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? <IconSpinner className="size-3.5" /> : null}
              {saving ? "测连中" : "保存"}
            </button>
          </>
        }
      >
        <p className="m-0 text-[13px] leading-relaxed text-[var(--color-muted)]">
          密钥只保存在本机{" "}
          <code className="rounded-[8px] border border-[var(--color-line)] bg-[var(--color-panel)] px-1.5 py-0.5 font-mono text-[11.5px] text-[var(--color-ink)]">
            localStorage
          </code>
          ，不会写入仓库。可事先注入；启动时自动读取。删除图需要 PAT（Contents 写权限）。
        </p>

        <div
          className={`ui-banner mt-3.5 ${saved ? "ui-banner-ok" : "ui-banner-warn"}`}
        >
          {saved ? (
            <div className="space-y-1">
              <div className="font-medium">已配置</div>
              <div className="font-mono text-[11.5px] opacity-90">
                gh-rplot-repo · {byok.repo}
              </div>
              <div className="font-mono text-[11.5px] opacity-90">
                gh-rplot-token · {maskToken(byok.token)}
              </div>
            </div>
          ) : (
            <div>
              <div className="font-medium">尚未配置</div>
              <div className="mt-0.5 opacity-90">
                浏览与星标无需密钥；删除前请填写下方字段并保存。
              </div>
            </div>
          )}
        </div>

        <label className="mt-4 block">
          <span className="mb-1.5 flex items-center gap-2 text-[12px] font-medium text-[var(--color-ink)]">
            仓库
            <code className="rounded-[6px] bg-[var(--color-panel)] px-1.5 py-px font-mono text-[10.5px] font-normal text-[var(--color-muted)]">
              gh-rplot-repo
            </code>
          </span>
          <input
            className="ui-field ui-field-mono"
            value={repo}
            placeholder={DEFAULT_REPO}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => setRepo(e.target.value)}
          />
          <span className="mt-1.5 block text-[11.5px] text-[var(--color-muted)]">
            格式 owner/name，例如 {DEFAULT_REPO}
          </span>
        </label>

        <label className="mt-3.5 block">
          <span className="mb-1.5 flex items-center gap-2 text-[12px] font-medium text-[var(--color-ink)]">
            Personal Access Token
            <code className="rounded-[6px] bg-[var(--color-panel)] px-1.5 py-px font-mono text-[10.5px] font-normal text-[var(--color-muted)]">
              gh-rplot-token
            </code>
          </span>
          <input
            type="password"
            className="ui-field ui-field-mono"
            value={token}
            placeholder="ghp_… 或 github_pat_…"
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => setToken(e.target.value)}
          />
          <span className="mt-1.5 block text-[11.5px] text-[var(--color-muted)]">
            保存时会先测连 GitHub API，通过后才写入本机。
          </span>
        </label>
      </ModalShell>

      {confirmClear && (
        <ConfirmDialog
          title="清除 BYOK 配置？"
          danger
          confirmLabel="确认清除"
          onCancel={() => setConfirmClear(false)}
          onConfirm={doClear}
        >
          <p className="m-0">
            将删除本机{" "}
            <code className="rounded-[6px] bg-[var(--color-panel)] px-1 font-mono text-[11.5px] text-[var(--color-ink)]">
              gh-rplot-repo
            </code>{" "}
            与{" "}
            <code className="rounded-[6px] bg-[var(--color-panel)] px-1 font-mono text-[11.5px] text-[var(--color-ink)]">
              gh-rplot-token
            </code>
            。浏览不受影响；之后删除图需重新配置。
          </p>
        </ConfirmDialog>
      )}
    </>
  );
}
