type ChatMessageBubbleProps = {
  children: React.ReactNode;
  tone?: "bot" | "user" | "system";
};

export function ChatMessageBubble({ children, tone = "bot" }: ChatMessageBubbleProps) {
  const toneClass = {
    bot: "mr-auto rounded-bl-md border-white/10 bg-white/[0.07] text-white",
    user: "ml-auto rounded-br-md border-cyan-300/30 bg-cyan-300/10 text-cyan-50",
    system:
      "mx-auto border-violet-300/25 bg-violet-300/10 text-violet-50 text-center",
  }[tone];

  return (
    <div
      className={`max-w-[92%] whitespace-pre-line rounded-3xl border px-4 py-3 text-[15px] leading-6 shadow-[0_12px_32px_rgba(0,0,0,0.18)] sm:max-w-[84%] ${toneClass}`}
    >
      {children}
    </div>
  );
}
