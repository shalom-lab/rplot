export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed bottom-4 right-4 z-[80] max-w-[min(360px,calc(100vw-24px))] border px-3.5 py-2.5 text-[12.5px] text-white shadow-lg r-control ${
        toast.err
          ? "border-red-800 bg-red-700"
          : "border-stone-800 bg-stone-900"
      }`}
      role="status"
    >
      {toast.msg}
    </div>
  );
}
