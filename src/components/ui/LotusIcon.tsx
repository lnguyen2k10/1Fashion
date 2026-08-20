export function LotusIcon({ className = "w-8 h-8", strokeWidth = 1 }: { className?: string, strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Center petal */}
      <path d="M12 22C12 22 16 14 16 6C12 8 12 16 12 22Z" />
      <path d="M12 22C12 22 8 14 8 6C12 8 12 16 12 22Z" />
      
      {/* Inner side petals */}
      <path d="M11 20.5C7 16.5 4 11 4 7C7 9 9 14 10.5 18" />
      <path d="M13 20.5C17 16.5 20 11 20 7C17 9 15 14 13.5 18" />
      
      {/* Outer side petals */}
      <path d="M9.5 21C4.5 19 1 15 1 11C4 12 7 15 9 19" />
      <path d="M14.5 21C19.5 19 23 15 23 11C20 12 17 15 15 19" />
    </svg>
  )
}
