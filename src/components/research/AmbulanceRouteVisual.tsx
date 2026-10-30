import React from 'react';

export const AmbulanceRouteVisual: React.FC = () => {
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

      {/* SVG Layer for City Street Grid, Routes, Nodes, and Telemetry HUD */}
      <svg className="w-full h-full" viewBox="0 0 540 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Glowing Filters */}
          <filter id="neon-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-glow-magenta" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="magenta-cyan-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#00f0ff" />
          </linearGradient>
          <linearGradient id="area-cyan-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Perspective City Street Grid Lines */}
        <g stroke="#0e3a66" strokeWidth="1.2" opacity="0.6">
          {/* Main Avenues (Horizontal & Diagonal Perspective) */}
          <line x1="200" y1="140" x2="520" y2="60" />
          <line x1="160" y1="180" x2="480" y2="100" />
          <line x1="190" y1="220" x2="530" y2="140" />
          <line x1="140" y1="110" x2="430" y2="40" />
          
          {/* Cross Streets */}
          <line x1="220" y1="70" x2="280" y2="230" />
          <line x1="290" y1="50" x2="360" y2="220" />
          <line x1="360" y1="40" x2="440" y2="200" />
          <line x1="430" y1="35" x2="510" y2="180" />

          {/* Grid Blocks (Secondary Buildings) */}
          <rect x="235" y="115" width="40" height="25" fill="#0d1b3a" stroke="#163866" strokeWidth="0.8" rx="2" opacity="0.8" />
          <rect x="290" y="100" width="55" height="30" fill="#0d1b3a" stroke="#163866" strokeWidth="0.8" rx="2" opacity="0.8" />
          <rect x="360" y="85" width="60" height="30" fill="#0d1b3a" stroke="#163866" strokeWidth="0.8" rx="2" opacity="0.8" />
          <rect x="310" y="150" width="65" height="35" fill="#0c1733" stroke="#163866" strokeWidth="0.8" rx="2" opacity="0.8" />
          <rect x="390" y="130" width="70" height="40" fill="#0c1733" stroke="#163866" strokeWidth="0.8" rx="2" opacity="0.8" />
        </g>

        {/* Dynamic Route 1 (Alternative Traffic Path - Cyan) */}
        <path
          d="M 180 170 L 250 145 L 320 165 L 410 115 L 480 90"
          stroke="#00f0ff"
          strokeWidth="2.5"
          strokeDasharray="4 4"
          filter="url(#neon-glow-cyan)"
          opacity="0.85"
        />

        {/* Priority Emergency Ambulance Route (Magenta to Cyan Radiant Line) */}
        <path
          d="M 170 195 L 230 165 L 260 120 L 340 100 L 400 125 L 460 75 L 500 65"
          stroke="url(#magenta-cyan-grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#neon-glow-magenta)"
        />

        {/* Waypoint Nodes along the Route */}
        {/* Node 1: Origin */}
        <circle cx="170" cy="195" r="5" fill="#f43f5e" filter="url(#neon-glow-magenta)" />
        <circle cx="170" cy="195" r="9" stroke="#f43f5e" strokeWidth="1.2" opacity="0.6" className="animate-ping" />

        {/* Node 2: Intermediate Transfer */}
        <circle cx="260" cy="120" r="4.5" fill="#d946ef" filter="url(#neon-glow-magenta)" />
        <circle cx="260" cy="120" r="8" stroke="#d946ef" strokeWidth="1" opacity="0.5" />

        {/* Node 3: Congestion Bypass Node */}
        <circle cx="340" cy="100" r="5" fill="#00f0ff" filter="url(#neon-glow-cyan)" />
        <circle cx="340" cy="100" r="11" stroke="#00f0ff" strokeWidth="1.5" opacity="0.8" className="animate-pulse" />

        {/* Node 4: Junction Priority Green Light */}
        <circle cx="400" cy="125" r="4.5" fill="#38bdf8" filter="url(#neon-glow-cyan)" />

        {/* Node 5: Destination Hospital Beacon */}
        <circle cx="460" cy="75" r="6" fill="#00f0ff" filter="url(#neon-glow-cyan)" />
        <circle cx="460" cy="75" r="14" stroke="#00f0ff" strokeWidth="1.5" opacity="0.7" className="animate-ping" />
        <circle cx="460" cy="75" r="22" stroke="#00f0ff" strokeWidth="0.8" opacity="0.4" />

        {/* --- HUD OVERLAYS --- */}

        {/* HUD Top Left: Route Clearance Score */}
        <g transform="translate(14, 14)">
          <rect width="135" height="62" rx="6" fill="#090e24" stroke="#1d4ed8" strokeWidth="0.8" opacity="0.85" />
          <text x="8" y="14" fill="#94a3b8" fontSize="7" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">
            ROUTE CLEARANCE SCORE
          </text>
          <text x="8" y="32" fill="#00f0ff" fontSize="16" fontFamily="monospace" fontWeight="900" filter="url(#neon-glow-cyan)">
            018
          </text>

          {/* Mini circular radar */}
          <g transform="translate(108, 30)">
            <circle cx="0" cy="0" r="14" stroke="#1e3a8a" strokeWidth="1" fill="#030712" />
            <circle cx="0" cy="0" r="9" stroke="#0284c7" strokeWidth="0.8" strokeDasharray="2 2" />
            <circle cx="0" cy="0" r="4" fill="#00f0ff" opacity="0.9" />
            <line x1="0" y1="0" x2="10" y2="-8" stroke="#38bdf8" strokeWidth="1.5" className="animate-spin-slow origin-center" />
          </g>

          {/* Sparkline */}
          <path
            d="M 8 50 L 25 45 L 42 52 L 60 40 L 78 46 L 95 38"
            stroke="#38bdf8"
            strokeWidth="1.2"
            fill="none"
          />
        </g>

        {/* Center Top: Distance Callout */}
        <g transform="translate(200, 16)">
          <rect width="65" height="24" rx="4" fill="#0d1433" stroke="#00f0ff" strokeWidth="0.8" opacity="0.9" />
          <circle cx="10" cy="12" r="3" fill="#00f0ff" filter="url(#neon-glow-cyan)" />
          <text x="20" y="16" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
            3.87 KM
          </text>
          <line x1="32" y1="24" x2="32" y2="35" stroke="#00f0ff" strokeWidth="1" strokeDasharray="2 2" />
        </g>

        {/* HUD Top Right: Traffic Flux Area Graph */}
        <g transform="translate(390, 14)">
          <rect width="135" height="48" rx="6" fill="#090e24" stroke="#1e293b" strokeWidth="0.8" opacity="0.85" />
          <text x="8" y="13" fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold">
            LIVE TELEMETRY FLUX
          </text>
          {/* Area fill */}
          <path
            d="M 8 40 L 20 34 L 35 38 L 50 25 L 68 32 L 85 20 L 105 28 L 125 18 L 125 42 L 8 42 Z"
            fill="url(#area-cyan-fill)"
          />
          {/* Top curve */}
          <path
            d="M 8 40 L 20 34 L 35 38 L 50 25 L 68 32 L 85 20 L 105 28 L 125 18"
            stroke="#00f0ff"
            strokeWidth="1.5"
            fill="none"
          />
        </g>

        {/* HUD Bottom Left: Metrics, Bar Chart & 94% Gauge */}
        <g transform="translate(14, 90)">
          <rect width="135" height="138" rx="6" fill="#090e24" stroke="#1e293b" strokeWidth="0.8" opacity="0.85" />
          
          <text x="8" y="16" fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold">
            SIGNAL OPTIMIZATION
          </text>

          {/* Multi-column Bar Chart */}
          <g transform="translate(8, 26)">
            {/* Bars */}
            {[25, 42, 18, 38, 55, 30, 48, 62].map((height, i) => (
              <g key={i} transform={`translate(${i * 14}, 0)`}>
                <rect x="0" y={65 - height} width="7" height={height} fill="#0284c7" rx="1.5" opacity="0.85" />
                <rect x="0" y={65 - height} width="7" height="2" fill="#00f0ff" />
              </g>
            ))}
            <line x1="0" y1="65" x2="115" y2="65" stroke="#334155" strokeWidth="0.8" />
          </g>

          {/* 94% Circular Gauge & Counter */}
          <g transform="translate(8, 102)">
            {/* Circular Progress */}
            <g transform="translate(20, 16)">
              <circle cx="0" cy="0" r="16" stroke="#1e293b" strokeWidth="3" fill="none" />
              <circle
                cx="0"
                cy="0"
                r="16"
                stroke="#00f0ff"
                strokeWidth="3"
                strokeDasharray="90 100"
                strokeLinecap="round"
                fill="none"
                filter="url(#neon-glow-cyan)"
              />
              <text x="0" y="4" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                94%
              </text>
            </g>

            {/* Stat Value */}
            <g transform="translate(48, 8)">
              <text x="0" y="10" fill="#64748b" fontSize="6.5" fontFamily="monospace" fontWeight="bold">
                RESPONSES
              </text>
              <text x="0" y="24" fill="#00f0ff" fontSize="13" fontFamily="monospace" fontWeight="900" filter="url(#neon-glow-cyan)">
                15,938
              </text>
            </g>
          </g>
        </g>

        {/* Small Data Matrix in Bottom Right */}
        <g transform="translate(435, 175)" opacity="0.75">
          <rect width="90" height="52" rx="4" fill="#080d22" stroke="#1e293b" strokeWidth="0.8" />
          <text x="6" y="12" fill="#38bdf8" fontSize="6" fontFamily="monospace">NODE TELEMETRY</text>
          <text x="6" y="24" fill="#64748b" fontSize="5.5" fontFamily="monospace">Latency: 1.2ms</text>
          <text x="6" y="34" fill="#64748b" fontSize="5.5" fontFamily="monospace">GPS Packets: 48.9k/s</text>
          <text x="6" y="44" fill="#00f0ff" fontSize="5.5" fontFamily="monospace">Status: SYNC [OPTIMAL]</text>
        </g>
      </svg>
    </div>
  );
};
