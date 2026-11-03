export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed bottom-3 right-3 z-[80] max-w-[min(360px,calc(100vw-24px))] px-3 py-2 text-[12.5px] text-white shadow-lg rounded-md transition ${
        toast.err ? "bg-red-700" : "bg-slate-900"
      }`}
      role="status"
    >
      {toast.msg}
    </div>
  );
}
