import type { ButtonHTMLAttributes } from "react";

export function ChatButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`min-h-12 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-left text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/[0.11] focus:outline-none focus:ring-2 focus:ring-cyan-300/40 disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}
