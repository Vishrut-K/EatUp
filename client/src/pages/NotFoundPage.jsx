import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-[640px] flex-col items-center justify-center px-5 py-16 text-center">
      <span className="mb-3 rounded-full border border-[#EAE3D9] bg-white px-3.5 py-1 text-[11px] font-bold tracking-[0.16em] text-[#C83E2B] uppercase">
        404 · Off The Menu
      </span>
      <h1 className="font-editorial mb-3 text-5xl sm:text-6xl tracking-tight text-[#1C1917]">
        This table doesn&apos;t <span className="italic text-[#C83E2B]">exist.</span>
      </h1>
      <p className="mb-8 max-w-[420px] text-sm leading-relaxed text-[#57534E]">
        The page you&apos;re looking for may have moved or is no longer on today&apos;s menu. Let&apos;s get you back to fresh kitchens.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-6 py-3 text-sm font-bold text-[#FAF7F2] transition hover:bg-[#C83E2B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 rounded-full border border-[#EAE3D9] bg-white px-6 py-3 text-sm font-bold text-[#1C1917] transition hover:border-[#1C1917]"
        >
          <Compass className="h-4 w-4" />
          Explore Kitchens
        </Link>
      </div>
    </div>
  );
}
