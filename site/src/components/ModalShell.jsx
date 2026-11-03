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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`w-full border border-[var(--color-line)] bg-[var(--color-card)] shadow-[0_24px_60px_rgba(28,25,23,0.2)] r-modal ${
          wide ? "max-w-4xl" : "max-w-[420px]"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-4 py-3">
          <h2 className="m-0 text-[14px] font-semibold tracking-tight text-[var(--color-ink)]">
            {title}
          </h2>
          <div className="flex-1" />
          {onClose && (
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-[12px] text-[var(--color-muted)] hover:bg-[var(--color-panel)] hover:text-[var(--color-ink)]"
              onClick={onClose}
              aria-label="关闭"
            >
              <IconX className="size-3.5" />
            </button>
          )}
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-[var(--color-line)] px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
