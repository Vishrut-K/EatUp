import { useToast } from "../../context/ToastContext";

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[3000] flex -translate-x-1/2 flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-[#0F172A] px-5 py-3 text-sm font-bold text-white shadow-xl"
        >
          <span>{t.icon}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
