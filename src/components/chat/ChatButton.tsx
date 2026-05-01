import type { ButtonHTMLAttributes } from "react";
import { ArrowUpRight } from "lucide-react";

export function ChatButton({
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`group flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-cyan-300/25 bg-gradient-to-r from-cyan-400/16 to-violet-500/16 px-4 py-3 text-left text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:border-cyan-200/60 hover:from-cyan-400/24 hover:to-violet-500/24 focus:outline-none focus:ring-2 focus:ring-cyan-300/50 disabled:opacity-60 ${className}`}
      {...props}
    >
      <span>{children}</span>
      <ArrowUpRight
        size={17}
        className="shrink-0 text-cyan-100 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </button>
  );
}
