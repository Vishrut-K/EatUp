export function DietBadge({ isVeg, className = "" }) {
  return (
    <span
      title={isVeg ? "Vegetarian" : "Non-Vegetarian"}
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] ${
        isVeg ? "border-[#2D5A3C]" : "border-[#C83E2B]"
      } ${className}`}
    >
      {isVeg ? (
        <span className="h-2 w-2 rounded-full bg-[#2D5A3C]" />
      ) : (
        <span className="h-0 w-0 border-x-[4px] border-b-[7px] border-x-transparent border-b-[#C83E2B]" />
      )}
    </span>
  );
}
