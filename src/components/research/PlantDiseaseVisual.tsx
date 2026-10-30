import React from 'react';

export const PlantDiseaseVisual: React.FC = () => {
  return (
    <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-[#070a1e] border border-cyan-500/30 shadow-[inset_0_0_30px_rgba(6,182,212,0.15)] select-none">
      {/* Background Cyber Grid */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 240, 255, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 240, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />

      <svg className="w-full h-full" viewBox="0 0 540 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="leaf-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="radar-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="leaf-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* --- LEFT SECTION: Bio-Digital Analyzer & Neural Network --- */}
        <g transform="translate(16, 16)">
          <text x="0" y="8" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">
            Bio-digital analyzer
          </text>

          {/* Neural Network Layer Diagram */}
          <g transform="translate(4, 20)">
            {/* Synaptic connection lines */}
            <g stroke="#0369a1" strokeWidth="0.8" opacity="0.6">
              {/* Input to Hidden 1 */}
              <line x1="10" y1="10" x2="40" y2="5" />
              <line x1="10" y1="10" x2="40" y2="25" />
              <line x1="10" y1="10" x2="40" y2="45" />
              <line x1="10" y1="30" x2="40" y2="5" />
              <line x1="10" y1="30" x2="40" y2="25" />
              <line x1="10" y1="30" x2="40" y2="45" />
              <line x1="10" y1="50" x2="40" y2="5" />
              <line x1="10" y1="50" x2="40" y2="25" />
              <line x1="10" y1="50" x2="40" y2="45" />

              {/* Hidden 1 to Output */}
              <line x1="40" y1="5" x2="70" y2="15" />
              <line x1="40" y1="5" x2="70" y2="35" />
              <line x1="40" y1="25" x2="70" y2="15" />
              <line x1="40" y1="25" x2="70" y2="35" />
              <line x1="40" y1="45" x2="70" y2="15" />
              <line x1="40" y1="45" x2="70" y2="35" />
            </g>

            {/* Input Nodes */}
            <circle cx="10" cy="10" r="3" fill="#00f0ff" filter="url(#leaf-glow)" />
            <circle cx="10" cy="30" r="3" fill="#00f0ff" filter="url(#leaf-glow)" />
            <circle cx="10" cy="50" r="3" fill="#00f0ff" filter="url(#leaf-glow)" />

            {/* Hidden Nodes */}
            <circle cx="40" cy="5" r="3" fill="#38bdf8" />
            <circle cx="40" cy="25" r="3" fill="#00f0ff" />
            <circle cx="40" cy="45" r="3" fill="#38bdf8" />

            {/* Output Nodes */}
            <circle cx="70" cy="15" r="3.5" fill="#a855f7" />
            <circle cx="70" cy="35" r="3.5" fill="#00f0ff" filter="url(#leaf-glow)" />
          </g>

          {/* Sequence Code Telemetry */}
          <g transform="translate(0, 88)">
            <text x="0" y="8" fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold">
              Sequence
            </text>
            <text x="0" y="20" fill="#38bdf8" fontSize="5.5" fontFamily="monospace" opacity="0.85">
              C66E666E666EE6E066E666EE6E066E66
            </text>
            <text x="0" y="30" fill="#0284c7" fontSize="5.5" fontFamily="monospace" opacity="0.85">
              E66E066E666EE6E066E666EE6E066E66
            </text>
            <text x="0" y="40" fill="#38bdf8" fontSize="5.5" fontFamily="monospace" opacity="0.85">
              C66E666E666EE6E066E666EE6E066E66
            </text>
            <text x="0" y="50" fill="#0284c7" fontSize="5.5" fontFamily="monospace" opacity="0.85">
              E66E066E666EE6E066E666EE6E066E66
            </text>
            <text x="0" y="60" fill="#00f0ff" fontSize="5.5" fontFamily="monospace" opacity="0.85">
              01001100010101110010100100110100
            </text>
            <text x="0" y="70" fill="#38bdf8" fontSize="5.5" fontFamily="monospace" opacity="0.85">
              88755EE7086700078900420096
            </text>
          </g>
        </g>

        {/* --- CENTER SECTION: HOLOGRAPHIC NEON BIO-LEAF --- */}
        <g transform="translate(255, 120)">
          {/* Subtle Backing Halo */}
          <ellipse cx="0" cy="0" rx="42" ry="75" fill="#00f0ff" opacity="0.06" filter="url(#leaf-glow)" />

          {/* Main Leaf Outer Contour (Serrated Organic Silhouette) */}
          <path
            d="M 0 -85
               C 22 -72, 38 -52, 44 -28
               C 48 -10, 48 15, 38 42
               C 28 65, 12 78, 0 88
               C -12 78, -28 65, -38 42
               C -48 15, -48 -10, -44 -28
               C -38 -52, -22 -72, 0 -85 Z"
            stroke="url(#leaf-grad)"
            strokeWidth="2"
            fill="none"
            filter="url(#leaf-glow)"
          />

          {/* Central Stem (Main Vein) */}
          <path
            d="M 0 -85 L 0 98"
            stroke="#00f0ff"
            strokeWidth="2.2"
            strokeLinecap="round"
            filter="url(#leaf-glow)"
          />

          {/* Lateral Secondary Veins (Right Side) */}
          <path
            d="M 0 -60 Q 18 -68 32 -58
               M 0 -38 Q 24 -46 42 -30
               M 0 -15 Q 26 -20 44 -4
               M 0 10 Q 25 8 41 22
               M 0 35 Q 22 36 34 50
               M 0 60 Q 15 62 20 72"
            stroke="#38bdf8"
            strokeWidth="1.2"
            fill="none"
            opacity="0.85"
          />

          {/* Lateral Secondary Veins (Left Side) */}
          <path
            d="M 0 -60 Q -18 -68 -32 -58
               M 0 -38 Q -24 -46 -42 -30
               M 0 -15 Q -26 -20 -44 -4
               M 0 10 Q -25 8 -41 22
               M 0 35 Q -22 36 -34 50
               M 0 60 Q -15 62 -20 72"
            stroke="#38bdf8"
            strokeWidth="1.2"
            fill="none"
            opacity="0.85"
          />

          {/* Tertiary Wireframe Lattice Lines (Holographic Mesh) */}
          <g stroke="#0284c7" strokeWidth="0.6" opacity="0.6">
            <line x1="-20" y1="-50" x2="-5" y2="-30" />
            <line x1="-30" y1="-25" x2="-10" y2="-5" />
            <line x1="-32" y1="5" x2="-12" y2="25" />
            <line x1="-25" y1="35" x2="-8" y2="52" />
            <line x1="20" y1="-50" x2="5" y2="-30" />
            <line x1="30" y1="-25" x2="10" y2="-5" />
            <line x1="32" y1="5" x2="12" y2="25" />
            <line x1="25" y1="35" x2="8" y2="52" />
          </g>

          {/* Neural Synapse Nodes on Leaf Veins */}
          <circle cx="0" cy="-60" r="3" fill="#ffffff" filter="url(#leaf-glow)" />
          <circle cx="0" cy="-15" r="3.5" fill="#00f0ff" filter="url(#leaf-glow)" />
          <circle cx="0" cy="35" r="3" fill="#38bdf8" filter="url(#leaf-glow)" />

          <circle cx="32" cy="-58" r="2.5" fill="#00f0ff" />
          <circle cx="42" cy="-30" r="2.5" fill="#38bdf8" />
          <circle cx="44" cy="-4" r="3" fill="#ffffff" filter="url(#leaf-glow)" />
          <circle cx="41" cy="22" r="2.5" fill="#00f0ff" />

          <circle cx="-32" cy="-58" r="2.5" fill="#00f0ff" />
          <circle cx="-42" cy="-30" r="2.5" fill="#38bdf8" />
          <circle cx="-44" cy="-4" r="3" fill="#ffffff" filter="url(#leaf-glow)" />
          <circle cx="-41" cy="22" r="2.5" fill="#00f0ff" />
        </g>

        {/* --- RIGHT SECTION: DUAL CIRCULAR RADAR RETICLES & SPECTRAL HUD --- */}
        <g transform="translate(450, 65)">
          {/* Upper Circular Radar Scope */}
          <circle cx="0" cy="0" r="38" stroke="#0369a1" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
          <circle cx="0" cy="0" r="30" stroke="#00f0ff" strokeWidth="1.8" filter="url(#radar-glow)" />
          <circle cx="0" cy="0" r="22" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 2" />
          <circle cx="0" cy="0" r="14" stroke="#38bdf8" strokeWidth="1.2" opacity="0.8" />
          <circle cx="0" cy="0" r="6" fill="#00f0ff" filter="url(#leaf-glow)" />

          {/* Crosshairs */}
          <line x1="-42" y1="0" x2="42" y2="0" stroke="#00f0ff" strokeWidth="0.8" opacity="0.6" />
          <line x1="0" y1="-42" x2="0" y2="42" stroke="#00f0ff" strokeWidth="0.8" opacity="0.6" />

          {/* Rotating Scanner Sector Line */}
          <line x1="0" y1="0" x2="26" y2="-20" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" className="animate-spin-slow origin-center" />
        </g>

        <g transform="translate(450, 160)">
          {/* Lower Circular Radar Scope */}
          <circle cx="0" cy="0" r="32" stroke="#0284c7" strokeWidth="1.2" opacity="0.8" />
          <circle cx="0" cy="0" r="24" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="18 6" filter="url(#radar-glow)" />
          <circle cx="0" cy="0" r="14" stroke="#0369a1" strokeWidth="1" />
          <circle cx="0" cy="0" r="5" fill="#0284c7" />

          {/* Targeting Bracket Ticks */}
          <path d="M -28 -15 L -34 -15 L -34 -5" stroke="#38bdf8" strokeWidth="1" fill="none" />
          <path d="M 28 -15 L 34 -15 L 34 -5" stroke="#38bdf8" strokeWidth="1" fill="none" />
          <path d="M -28 15 L -34 15 L -34 5" stroke="#38bdf8" strokeWidth="1" fill="none" />
          <path d="M 28 15 L 34 15 L 34 5" stroke="#38bdf8" strokeWidth="1" fill="none" />
        </g>

        {/* Spectral Frequency Bars (Bottom Right) */}
        <g transform="translate(385, 195)">
          {[12, 22, 16, 28, 35, 20, 32, 40, 24, 18].map((height, i) => (
            <rect
              key={i}
              x={i * 8}
              y={40 - height}
              width="4.5"
              height={height}
              fill="#00f0ff"
              opacity="0.85"
              rx="1"
            />
          ))}
          <text x="82" y="38" fill="#64748b" fontSize="6" fontFamily="monospace">
            PATHOGEN CONF: 98.7%
          </text>
        </g>
      </svg>
    </div>
  );
};
