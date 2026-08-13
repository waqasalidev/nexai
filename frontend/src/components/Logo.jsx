import { Link } from "@tanstack/react-router";

export function LogoMark({ className = "h-8 w-8" }) {
  return (
    <div className={`relative shrink-0 ${className}`}>
      <svg viewBox="0 0 512 512" fill="none" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="nexai-component-grad-1" x1="60" y1="60" x2="450" y2="450" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="nexai-component-grad-2" x1="120" y1="400" x2="400" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>

        <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#nexai-component-grad-1)" fillOpacity="0.12" stroke="url(#nexai-component-grad-1)" strokeWidth="8" strokeOpacity="0.35" />
        <path d="M 124 388 V 164 L 212 116 V 340 Z" fill="url(#nexai-component-grad-1)" />
        <path d="M 196 156 L 316 356 V 212 L 236 124 Z" fill="url(#nexai-component-grad-2)" />
        <path d="M 300 124 V 348 L 388 396 V 172 Z" fill="url(#nexai-component-grad-1)" />
        <circle cx="256" cy="256" r="30" fill="#38bdf8" />
        <circle cx="256" cy="256" r="14" fill="#ffffff" />
      </svg>
    </div>
  );
}

export function Logo({ showText = true, iconOnly = false, className = "", onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
    >
      <LogoMark className="h-8 w-8 transition-transform group-hover:scale-105" />
      {!iconOnly && (
        <span className={`font-display text-lg font-bold tracking-tight ${showText ? "block" : "hidden sm:block"}`}>
          Nex<span className="gradient-text font-black">AI</span>
        </span>
      )}
    </Link>
  );
}
