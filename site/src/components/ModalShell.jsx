import { IconX } from "../lib/icons";

export default function ModalShell({
  title,
  onClose,
  children,
  footer,
  wide = false,
  layer = 60,
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: layer,
        background: "rgba(48, 40, 32, 0.42)",
        backdropFilter: "blur(3px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full overflow-hidden border border-[var(--color-line)] bg-[var(--color-card)] shadow-[0_24px_60px_rgba(28,25,23,0.22)] r-modal ${
          wide ? "max-w-4xl" : "max-w-[440px]"
        }`}
        style={{ background: "#fffdf9" }}
      >
        <div className="flex items-center gap-2 border-b border-[var(--color-line)] bg-[var(--color-panel)]/70 px-4 py-3">
          <h2 className="m-0 text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">
            {title}
          </h2>
          <div className="flex-1" />
          {onClose && (
            <button
              type="button"
              className="ui-btn ui-icon-btn ui-btn-ghost"
              onClick={onClose}
              aria-label="关闭"
            >
              <IconX className="size-4" />
            </button>
          )}
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-[var(--color-line)] bg-[var(--color-panel)]/40 px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
