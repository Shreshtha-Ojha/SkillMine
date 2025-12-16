export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0f] z-50">
      {/* Background Effects (use theme primary splash) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[var(--color-accent)]/8 rounded-full blur-3xl animate-pulse delay-500" />
      
      {/* Loader Container */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated Rings */}
        <div className="relative w-20 h-20">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--color-primary)] border-r-[var(--color-primary)] animate-spin" />
          {/* Middle Ring */}
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[var(--color-accent)] border-l-[var(--color-accent)] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          {/* Inner Ring */}
          <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-[var(--color-primary)]/70 animate-spin" style={{ animationDuration: '0.6s' }} />
          {/* Center Dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] animate-pulse" />
          </div>
        </div>
        
        {/* Text */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium text-[var(--color-foreground)] tracking-wide">Loading</p>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
