import ModalShell from "./ModalShell";

/**
 * In-app confirm — never window.confirm / alert.
 */
export default function ConfirmDialog({
  title,
  children,
  confirmLabel = "确认",
  cancelLabel = "取消",
  danger = false,
  onConfirm,
  onCancel,
  busy = false,
}) {
  return (
    <ModalShell
      title={title}
      onClose={busy ? undefined : onCancel}
      layer={70}
      footer={
        <>
          <button
            type="button"
            className="ui-btn"
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? "ui-btn ui-btn-danger-solid" : "ui-btn ui-btn-primary"}
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "处理中…" : confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-[13px] leading-relaxed text-[var(--color-muted)]">
        {children}
      </div>
    </ModalShell>
  );
}
