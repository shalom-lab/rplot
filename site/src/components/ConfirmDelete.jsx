import ConfirmDialog from "./ConfirmDialog";

export default function ConfirmDelete({ fig, onCancel, onConfirm }) {
  return (
    <ConfirmDialog
      title="确认删除此图？"
      danger
      confirmLabel="确认删除"
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <p className="m-0">
        将通过 GitHub Contents API 更新{" "}
        <code className="rounded-[6px] bg-[var(--color-panel)] px-1 font-mono text-[11.5px] text-[var(--color-ink)]">
          catalog.json
        </code>{" "}
        并删除图片{" "}
        <code className="rounded-[6px] bg-[var(--color-panel)] px-1 font-mono text-[11.5px] text-[var(--color-ink)]">
          {fig.file}
        </code>
        。此操作不易撤销。
      </p>
      <p className="mt-3 mb-0 text-[13.5px] font-semibold text-[var(--color-ink)]">
        {fig.title}
      </p>
    </ConfirmDialog>
  );
}
