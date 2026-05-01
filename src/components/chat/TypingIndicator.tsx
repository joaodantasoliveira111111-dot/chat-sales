export function TypingIndicator() {
  return (
    <div className="mr-auto flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.07] px-4 py-3">
      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.2s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.1s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" />
    </div>
  );
}
