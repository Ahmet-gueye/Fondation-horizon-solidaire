/**
 * Illustration décorative (vectorielle, créée pour le site) : un soleil se levant
 * sur l'horizon, un baobab et des cercles évoquant la communauté.
 * Ce n'est ni le logo, ni une photo : elle est purement décorative.
 */
export function HeroArt() {
  return (
    <div className="hero-art" aria-hidden="true">
      <svg viewBox="0 0 520 460" role="presentation" focusable="false">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff6d9" />
            <stop offset="1" stopColor="#e3f1e8" />
          </linearGradient>
          <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#f8c63a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#f8c63a" stopOpacity="0" />
          </radialGradient>
          <clipPath id="frame">
            <rect x="10" y="10" width="500" height="440" rx="48" />
          </clipPath>
        </defs>
        <g clipPath="url(#frame)">
          <rect x="10" y="10" width="500" height="440" fill="url(#sky)" />
          <circle cx="260" cy="250" r="190" fill="url(#sunGlow)" />
          <circle className="sun" cx="260" cy="250" r="86" fill="#f4b400" />
          <g stroke="#f4b400" strokeWidth="6" strokeLinecap="round" opacity="0.7">
            <path d="M260 120v-34M170 158l-22-24M350 158l22-24M128 240H96M392 240h32" />
          </g>
          <path d="M10 300c90-38 170-46 250-30s170 14 250-14v204H10z" fill="#1f8552" />
          <path d="M10 340c110-30 210-26 300-4s140 10 200-6v130H10z" fill="#0f5634" />
          <path d="M10 392c120-22 250-18 360 2 60 10 100 6 140-4v70H10z" fill="#08311f" />
          {/* Baobab */}
          <g fill="#08311f">
            <path d="M392 330c-2-30 0-58 6-78h18c6 20 8 48 6 78z" />
            <path d="M407 258c-28-10-52-4-70 10 12-18 34-30 62-28-20-14-44-14-64-4 18-16 46-22 70-12-6-14-20-24-36-28 22 0 38 10 46 26 8-16 24-26 46-26-16 4-30 14-36 28 24-10 52-4 70 12-20-10-44-10-64 4 28-2 50 10 62 28-18-14-42-20-70-10z" />
          </g>
          {/* Cercle de personnes stylisées */}
          <g transform="translate(118 318)">
            <circle cx="0" cy="0" r="11" fill="#1d63a8" />
            <path d="M-16 34c0-12 7-20 16-20s16 8 16 20z" fill="#1d63a8" />
            <circle cx="40" cy="-6" r="12" fill="#c0392b" />
            <path d="M22 32c0-13 8-22 18-22s18 9 18 22z" fill="#c0392b" />
            <circle cx="82" cy="0" r="11" fill="#0f8a84" />
            <path d="M66 34c0-12 7-20 16-20s16 8 16 20z" fill="#0f8a84" />
            <path d="M8 20c10 6 22 6 32 0M48 20c10 6 22 6 32 0" stroke="#fff6d9" strokeWidth="4" strokeLinecap="round" fill="none" />
          </g>
        </g>
      </svg>
    </div>
  );
}
