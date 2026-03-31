// SVG icons for the widget system.
// Stroke-based, 14x14 viewBox, 1.5px stroke weight for terminal aesthetic.

const iconClass = 'w-3.5 h-3.5'

export function PopOutIcon({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="4.5" width="7.5" height="7.5" rx="1" />
      <path d="M9 9.5h2.5a1 1 0 001-1V2.5a1 1 0 00-1-1H5.5a1 1 0 00-1 1V5" />
    </svg>
  )
}

export function PopInIcon({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Single window (the grid) */}
      <rect x="2" y="2" width="10" height="10" rx="1.5" />
      {/* Arrow pointing into the window center */}
      <path d="M12 2L7.5 6.5" />
      <path d="M7.5 3v3.5H11" />
    </svg>
  )
}

export function MoreIcon({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="currentColor">
      <circle cx="3" cy="7" r="1.25" />
      <circle cx="7" cy="7" r="1.25" />
      <circle cx="11" cy="7" r="1.25" />
    </svg>
  )
}

export function DuplicateIcon({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" />
      <path d="M9.5 4.5V2.5a1 1 0 00-1-1h-6a1 1 0 00-1 1v6a1 1 0 001 1h2" />
    </svg>
  )
}

export function RemoveIcon({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 4h9M5.5 4V2.5h3V4M3.5 4v7.5a1 1 0 001 1h5a1 1 0 001-1V4" />
      <path d="M5.75 6.5v3M8.25 6.5v3" />
    </svg>
  )
}
