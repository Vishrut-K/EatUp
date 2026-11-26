import { Utensils } from "lucide-react";

export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="my-8 rounded-2xl border border-[#EAE3D9] bg-white px-6 py-16 text-center shadow-[0_2px_16px_-4px_rgba(28,25,23,0.04)]">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#EAE3D9] bg-[#FAF7F2] text-[#C83E2B]">
        {typeof icon === "string" || !icon ? <Utensils className="h-6 w-6" /> : icon}
      </div>
      <h3 className="font-editorial mb-2 text-3xl tracking-tight text-[#1C1917]">{title}</h3>
      <p className="mx-auto mb-6 max-w-[420px] text-sm leading-relaxed text-[#57534E]">{subtitle}</p>
      {action}
    </div>
  );
}
