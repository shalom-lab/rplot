import ModalShell from "./ModalShell";

export default function ConfirmDelete({ fig, onCancel, onConfirm }) {
  return (
    <ModalShell
      title="确认删除"
      onClose={onCancel}
      footer={
        <>
          <button
            type="button"
            className="r-control h-9 border border-[var(--color-line-strong)] bg-white px-3.5 text-[12px] hover:bg-[var(--color-panel)]"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="button"
            className="r-control h-9 border border-red-600 bg-red-600 px-3.5 text-[12px] font-medium text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            确认删除
          </button>
        </>
      }
    >
      <p className="m-0 text-[12.5px] text-[var(--color-muted)]">
        将更新 <code className="font-mono text-[11px]">catalog.json</code> 并删除{" "}
        <code className="font-mono text-[11px]">{fig.file}</code>
      </p>
      <p className="mt-3 mb-0 text-[13.5px] font-semibold text-[var(--color-ink)]">
        {fig.title}
      </p>
    </ModalShell>
  );
}
