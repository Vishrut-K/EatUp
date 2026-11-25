export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="my-7 rounded-[18px] border border-[#E5EBE7] bg-white px-5 py-16 text-center">
      <div className="mb-4 text-5xl">{icon}</div>
      <h3 className="mb-2 text-xl font-extrabold text-[#111827]">{title}</h3>
      <p className="mx-auto mb-5 max-w-[420px] text-[0.95rem] text-[#4B5563]">{subtitle}</p>
      {action}
    </div>
  );
}
