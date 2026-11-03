import ModalShell from "./ModalShell";
import { assetUrl } from "../lib/byok";

export default function Lightbox({ fig, onClose }) {
  return (
    <ModalShell title={fig.title} onClose={onClose} wide>
      <div className="bg-slate-950 -mx-3 -mt-3 px-3 pt-3">
        <img
          src={assetUrl(fig.file)}
          alt={fig.title}
          className="mx-auto max-h-[min(70vh,720px)] max-w-full object-contain"
        />
      </div>
      <p className="mt-2.5 mb-0 text-xs text-slate-500">
        {fig.category}
        {fig.tags?.length ? ` · ${fig.tags.join(", ")}` : ""}
        {fig.license ? ` · ${fig.license}` : ""}
        {fig.paper_or_site ? (
          <>
            {" · "}
            <a
              href={fig.paper_or_site}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-700 hover:underline"
            >
              来源
            </a>
          </>
        ) : null}
      </p>
      {fig.note_zh ? (
        <p className="mt-1 mb-0 text-xs text-slate-600">{fig.note_zh}</p>
      ) : null}
    </ModalShell>
  );
}
