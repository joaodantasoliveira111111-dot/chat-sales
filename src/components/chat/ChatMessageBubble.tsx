type ChatMessageBubbleProps = {
  children: React.ReactNode;
  tone?: "bot" | "user" | "system";
  author?: string;
};

export function ChatMessageBubble({
  children,
  tone = "bot",
  author,
}: ChatMessageBubbleProps) {
  const toneClass = {
    bot: "mr-auto rounded-bl-md border-white/10 bg-[#17202B] text-white",
    user: "ml-auto rounded-br-md border-cyan-300/35 bg-gradient-to-br from-cyan-400 to-violet-500 text-white",
    system:
      "mx-auto border-violet-300/25 bg-violet-300/10 text-violet-50 text-center",
  }[tone];
  const rowClass = tone === "user" ? "justify-end" : "justify-start";
  const avatarClass =
    tone === "user"
      ? "order-2 bg-gradient-to-br from-cyan-300 to-violet-400 text-[#071019]"
      : "bg-white/[0.08] text-cyan-100";

  return (
    <div className={`flex w-full gap-2 ${rowClass}`}>
      {tone !== "system" ? (
        <div
          className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${avatarClass}`}
        >
          {tone === "user" ? "EU" : "AP"}
        </div>
      ) : null}
      <div className={`max-w-[86%] ${tone === "user" ? "order-1" : ""}`}>
        {author ? (
          <p
            className={`mb-1 px-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
              tone === "user" ? "text-right text-cyan-100" : "text-[#A9B4C3]"
            }`}
          >
            {author}
          </p>
        ) : null}
        <div
          className={`whitespace-pre-line rounded-3xl border px-4 py-3 text-[15px] leading-6 shadow-[0_12px_32px_rgba(0,0,0,0.22)] ${toneClass}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
