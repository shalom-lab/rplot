import { IconX } from "../lib/icons";

export default function ModalShell({
  title,
  onClose,
  children,
  footer,
  wide = false,
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/45 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`w-full border border-slate-200 bg-white shadow-xl rounded-md ${
          wide ? "max-w-4xl" : "max-w-md"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2.5">
          <h2 className="m-0 text-[14px] font-bold tracking-tight text-slate-900">
            {title}
          </h2>
          <div className="flex-1" />
          {onClose && (
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-sm"
              onClick={onClose}
              aria-label="关闭"
            >
              <IconX />
            </button>
          )}
        </div>
        <div className="px-3 py-3">{children}</div>
        {footer && (
          <div className="flex justify-end gap-1.5 border-t border-slate-200 px-3 py-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
