import { CheckCircle2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-20 sm:bottom-6 left-1/2 z-[3000] flex w-max max-w-[90vw] -translate-x-1/2 flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-[#292524] bg-[#1C1917] px-5 py-3 text-xs sm:text-sm font-semibold text-[#FAF7F2] shadow-2xl"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#D99B26]" />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
