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
            className="h-7 border border-slate-200 bg-white px-2.5 text-slate-700 hover:bg-slate-50 rounded-sm"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="button"
            className="h-7 border border-red-300 bg-red-50 px-2.5 text-red-700 hover:bg-red-100 rounded-sm"
            onClick={onConfirm}
          >
            确认删除
          </button>
        </>
      }
    >
      <p className="m-0 text-xs text-slate-500">将通过 GitHub Contents API：</p>
      <ol className="mt-1.5 mb-0 list-decimal pl-4 text-xs text-slate-500">
        <li>
          从 <code>catalog.json</code> 移除该条目
        </li>
        <li>
          删除图片 <code>{fig.file}</code>
        </li>
      </ol>
      <p className="mt-2.5 mb-0 text-[13px] font-semibold text-slate-900">{fig.title}</p>
      <p className="mt-1.5 mb-0 text-xs text-slate-500">操作不可轻易撤销，请确认。</p>
    </ModalShell>
  );
}
