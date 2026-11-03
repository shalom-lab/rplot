import ModalShell from "./ModalShell";
import { assetUrl } from "../lib/byok";

export default function Lightbox({ fig, onClose }) {
  return (
    <ModalShell title={fig.title} onClose={onClose} wide>
      <div className="-mx-4 -mt-4 rounded-t-[16px] bg-[#1c1917] px-4 pt-4">
        <img
          src={assetUrl(fig.file)}
          alt={fig.title}
          className="mx-auto max-h-[min(72vh,760px)] max-w-full object-contain"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="r-chip border border-[var(--color-coral)]/30 bg-[var(--color-coral-soft)] px-2 py-0.5 text-[11px] text-[var(--color-coral-text)]">
          {fig.category}
        </span>
        {(fig.tags || []).map((t) => (
          <span
            key={t}
            className="r-chip border border-[var(--color-line)] bg-[var(--color-panel)] px-2 py-0.5 text-[11px] text-[var(--color-muted)]"
          >
            {t}
          </span>
        ))}
      </div>
      {fig.note_zh ? (
        <p className="mt-2 mb-0 text-[12.5px] leading-relaxed text-stone-600">
          {fig.note_zh}
        </p>
      ) : null}
      {fig.paper_or_site ? (
        <p className="mt-2 mb-0 text-[12px]">
          <a
            href={fig.paper_or_site}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:underline"
          >
            查看来源 →
          </a>
        </p>
      ) : null}
    </ModalShell>
  );
}
