export function SkeletonLine({ width = '100%', height = '12px' }: { width?: string; height?: string }) {
  return (
    <div
      className="rounded bg-terminal-border/40 animate-pulse"
      style={{ width, height }}
    />
  )
}

export function SkeletonChart() {
  return (
    <div className="flex-1 flex items-end gap-1 px-2 min-h-[120px]">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-terminal-border/30 animate-pulse"
          style={{ height: `${30 + Math.random() * 60}%`, animationDelay: `${i * 50}ms` }}
        />
      ))}
    </div>
  )
}

export function SkeletonCircle({ size = 120 }: { size?: number }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div
        className="rounded-full border-8 border-terminal-border/30 animate-pulse"
        style={{ width: size, height: size }}
      />
    </div>
  )
}

export function SummarySkeleton() {
  return (
    <div className="flex flex-col gap-3 h-full">
      <div>
        <SkeletonLine width="100px" height="10px" />
        <div className="mt-2">
          <SkeletonLine width="200px" height="24px" />
        </div>
      </div>
      <div className="flex gap-6">
        <div className="flex flex-col gap-1">
          <SkeletonLine width="40px" height="10px" />
          <SkeletonLine width="120px" height="16px" />
        </div>
      </div>
      <SkeletonChart />
    </div>
  )
}

export function NewsSkeleton() {
  return (
    <div className="flex flex-col gap-3 h-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-2">
          <div className="w-1 rounded-full bg-terminal-border/30 animate-pulse" style={{ height: '32px' }} />
          <div className="flex-1 flex flex-col gap-1.5">
            <SkeletonLine width="90%" height="11px" />
            <SkeletonLine width="60%" height="11px" />
            <SkeletonLine width="100px" height="9px" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AllocationSkeleton() {
  return (
    <div className="flex flex-col h-full gap-2">
      <SkeletonCircle />
      <div className="flex justify-center gap-4">
        <SkeletonLine width="60px" height="10px" />
        <SkeletonLine width="60px" height="10px" />
        <SkeletonLine width="60px" height="10px" />
      </div>
    </div>
  )
}
