import type { ButtonHTMLAttributes } from "react";

type NeonButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function NeonButton({
  className = "",
  variant = "primary",
  ...props
}: NeonButtonProps) {
  const variants = {
    primary:
      "bg-[linear-gradient(135deg,#00D1FF,#7B61FF)] text-white shadow-[0_16px_40px_rgba(0,209,255,0.18)] hover:scale-[1.01]",
    secondary:
      "border border-white/12 bg-white/[0.07] text-white hover:bg-white/[0.11]",
    ghost: "text-[#A9B4C3] hover:bg-white/[0.07] hover:text-white",
    danger:
      "border border-red-400/30 bg-red-500/10 text-red-100 hover:bg-red-500/20",
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
