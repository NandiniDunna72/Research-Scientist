import React from 'react';

export const HolographicAICore: React.FC = () => {
  return (
    <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center pointer-events-none select-none">
      {/* Ambient Radial Flare */}
      <div className="absolute inset-0 bg-radial from-cyan-500/20 via-purple-500/10 to-transparent blur-2xl" />

      <svg className="w-full h-full overflow-visible" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="core-glow-cyan" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="core-glow-magenta" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="cube-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#d946ef" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="cube-face-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#d946ef" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* --- GROUND PLANE: PERSPECTIVE CONCENTRIC NEON RINGS --- */}
        <g transform="translate(100, 155)">
          {/* Outer Cyan Ring */}
          <ellipse
            cx="0"
            cy="0"
            rx="85"
            ry="24"
            stroke="#00f0ff"
            strokeWidth="1.8"
            strokeDasharray="16 8 4 8"
            filter="url(#core-glow-cyan)"
            opacity="0.85"
          />

          {/* Middle Magenta Ring */}
          <ellipse
            cx="0"
            cy="0"
            rx="65"
            ry="18"
            stroke="#d946ef"
            strokeWidth="2"
            filter="url(#core-glow-magenta)"
            opacity="0.8"
          />

          {/* Inner Cyan Glowing Ring */}
          <ellipse
            cx="0"
            cy="0"
            rx="45"
            ry="12"
            stroke="#00f0ff"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            opacity="0.9"
          />

          {/* Core Concentric Focal Disc */}
          <ellipse
            cx="0"
            cy="0"
            rx="25"
            ry="7"
            fill="#00f0ff"
            opacity="0.25"
            filter="url(#core-glow-cyan)"
          />

          {/* Radial Tick Lines */}
          {[-70, -45, -20, 0, 20, 45, 70].map((x, i) => (
            <line
              key={i}
              x1={x}
              y1={-Math.sqrt(Math.max(0, 1 - (x / 85) ** 2)) * 24}
              x2={x}
              y2={-Math.sqrt(Math.max(0, 1 - (x / 85) ** 2)) * 24 - 4}
              stroke="#00f0ff"
              strokeWidth="1.2"
              opacity="0.7"
            />
          ))}
        </g>

        {/* --- VERTICAL HOLOGRAPHIC LIGHT BEAMS --- */}
        <g opacity="0.6">
          <line x1="60" y1="150" x2="60" y2="60" stroke="#00f0ff" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
          <line x1="100" y1="155" x2="100" y2="40" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
          <line x1="140" y1="150" x2="140" y2="60" stroke="#d946ef" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
        </g>

        {/* --- FLOATING 3D HOLOGRAPHIC CUBE (ISOMETRIC) --- */}
        <g transform="translate(100, 95)" className="animate-float">
          {/* Back Glowing Core */}
          <circle cx="0" cy="0" r="16" fill="#00f0ff" opacity="0.3" filter="url(#core-glow-cyan)" />

          {/* Isometric Cube Faces */}
          {/* Top Face */}
          <polygon
            points="0,-32 28,-16 0,0 -28,-16"
            fill="url(#cube-face-fill)"
            stroke="#00f0ff"
            strokeWidth="1.8"
            filter="url(#core-glow-cyan)"
          />

          {/* Left Face */}
          <polygon
            points="-28,-16 0,0 0,32 -28,16"
            fill="url(#cube-face-fill)"
            stroke="#8b5cf6"
            strokeWidth="1.8"
            opacity="0.9"
          />

          {/* Right Face */}
          <polygon
            points="0,0 28,-16 28,16 0,32"
            fill="url(#cube-face-fill)"
            stroke="#d946ef"
            strokeWidth="1.8"
            filter="url(#core-glow-magenta)"
          />

          {/* Floating AI Logo Text inside the Hologram */}
          <text
            x="0"
            y="6"
            fill="#ffffff"
            fontSize="18"
            fontFamily="system-ui, sans-serif"
            fontWeight="900"
            letterSpacing="1"
            textAnchor="middle"
            filter="url(#core-glow-cyan)"
          >
            AI
          </text>

          {/* Subtle Corner Vertices */}
          <circle cx="0" cy="-32" r="2.5" fill="#ffffff" filter="url(#core-glow-cyan)" />
          <circle cx="28" cy="-16" r="2.5" fill="#00f0ff" />
          <circle cx="-28" cy="-16" r="2.5" fill="#00f0ff" />
          <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
          <circle cx="0" cy="32" r="2.5" fill="#d946ef" filter="url(#core-glow-magenta)" />
          <circle cx="28" cy="16" r="2.5" fill="#d946ef" />
          <circle cx="-28" cy="16" r="2.5" fill="#8b5cf6" />
        </g>

        {/* Ambient Rising Holographic Spark Particles */}
        <circle cx="85" cy="70" r="1.5" fill="#00f0ff" opacity="0.8" className="animate-ping" />
        <circle cx="120" cy="65" r="1.2" fill="#d946ef" opacity="0.8" />
        <circle cx="105" cy="50" r="1" fill="#ffffff" opacity="0.9" className="animate-pulse" />
        <circle cx="75" cy="115" r="1.5" fill="#00f0ff" opacity="0.7" />
        <circle cx="130" cy="120" r="1.5" fill="#d946ef" opacity="0.7" />
      </svg>
    </div>
  );
};
