export function DietBadge({ isVeg, className = "" }) {
  return (
    <span
      title={isVeg ? "Vegetarian" : "Non-Vegetarian"}
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-2 ${
        isVeg ? "border-[#15803D]" : "border-[#B91C1C]"
      } ${className}`}
    >
      {isVeg ? (
        <span className="h-2 w-2 rounded-full bg-[#15803D]" />
      ) : (
        <span className="h-0 w-0 border-x-[4px] border-b-[8px] border-x-transparent border-b-[#B91C1C]" />
      )}
    </span>
  );
}
