export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0f] z-50">
      <div className="absolute inset-0 bg-[rgba(126,16,44,0.06)]" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[rgba(126,16,44,0.12)] rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[rgba(215,169,168,0.05)] rounded-full blur-3xl animate-pulse" />
      
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--color-primary)] border-r-[#6b0f26] animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#d7a9a8] border-l-[#e1d4c1] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
          </div>
        </div>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
