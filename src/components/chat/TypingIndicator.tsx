export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-surface rounded-card rounded-bl-sm px-4 py-3.5 shadow-card border border-border/40 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-ink-tertiary animate-bounce-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
