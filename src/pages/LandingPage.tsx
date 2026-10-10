import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  BookOpen, 
  ChevronRight
} from 'lucide-react';
import { AuthModal, AuthMode } from '../components/auth/AuthModal';

type PaperStage = 'closed' | 'untying' | 'unrolling' | 'open';

export const LandingPage: React.FC = () => {
  const [stage, setStage] = useState<PaperStage>('closed');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [secondsRemaining, setSecondsRemaining] = useState(4);

  // Exact Timeline:
  // 0s – 4.5s: Closed physical paper with red scholar thread resting directly on desk
  // 4.5s – 5.8s: Red thread unties, knot releases, and cords glide off
  // 5.8s – 7.8s: Paper unrolls/unfolds with physical curled scroll edges
  // 7.8s+: Landing page displayed on the authentic unrolled parchment paper
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    const untieTimer = setTimeout(() => {
      setStage('untying');
    }, 4500);

    const unrollTimer = setTimeout(() => {
      setStage('unrolling');
    }, 5800);

    const openTimer = setTimeout(() => {
      setStage('open');
    }, 7800);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(untieTimer);
      clearTimeout(unrollTimer);
      clearTimeout(openTimer);
    };
  }, []);

  const handleSkipOrOpenNow = () => {
    setStage('open');
  };

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090d15] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-x-hidden font-sans">
      {/* Seamless Ambient Study Atmosphere: Rich dark desk surface with warm overhead study lamp vignette */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Overhead study lamp warm vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 45%, rgba(30, 40, 60, 0.4) 0%, rgba(12, 17, 27, 0.88) 60%, #06080e 100%)'
          }}
        />

        {/* Delicate study desk grid */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#94a3b8 0.75px, transparent 0.75px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Soft warm desk aura */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[550px] bg-indigo-950/20 rounded-full blur-[140px]" />
      </div>

      {/* Top Header Navbar */}
      <header className="relative z-30 border-b border-slate-800/60 bg-[#090d15]/85 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-opacity duration-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white block">
              AI RESEARCH SCIENTIST
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-tight block">
              Academic Literature Synthesis Platform
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {stage !== 'open' ? (
            <button
              onClick={handleSkipOrOpenNow}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Unroll Document</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <>
              <button
                onClick={() => openAuth('signin')}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all border border-transparent hover:border-slate-700 cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuth('signup')}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Stage Experience */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10 max-w-5xl w-full mx-auto">
        <AnimatePresence mode="wait">
          {/* ========================================================================= */}
          {/* STAGE 1: PHYSICAL CLOSED PAPER TIED WITH RED THREAD (No photo box!)      */}
          {/* ========================================================================= */}
          {stage === 'closed' || stage === 'untying' ? (
            <motion.div
              key="closed-paper-stage"
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.5 } }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="flex flex-col items-center justify-center my-auto select-none"
            >
              {/* Minimalist Status */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                className="mb-8 flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-slate-400"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span>
                  {stage === 'closed'
                    ? `Physical Research Document Tied With Red Cord • Opening in ${secondsRemaining}s`
                    : 'Unfastening Red Scholar Thread...'}
                </span>
              </motion.div>

              {/* Physical Paper Object directly resting on the table (NO image frame box!) */}
              <div 
                onClick={handleSkipOrOpenNow}
                title="Click to unroll immediately"
                className="relative cursor-pointer group"
              >
                {/* Physical Contact Shadow on the desk beneath the paper */}
                <motion.div
                  animate={{
                    scale: [1, 1.03, 1],
                    opacity: [0.75, 0.85, 0.75],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[92%] h-14 bg-black/95 rounded-full blur-xl pointer-events-none"
                />

                {/* THE PHYSICAL ROLLED PAPER (Realistic 3D Parchment Cylinder) */}
                <motion.div
                  animate={{
                    y: [0, -3, 0],
                  }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative w-[320px] sm:w-[480px] md:w-[560px] h-[115px] sm:h-[145px] md:h-[165px] rounded-[16px] sm:rounded-[22px] transition-transform duration-300 group-hover:scale-[1.02]"
                  style={{
                    background: `
                      linear-gradient(
                        180deg,
                        #d1c3ad 0%,
                        #ece2d1 12%,
                        #faf7f0 26%,
                        #f6f0e4 52%,
                        #e2d6c1 78%,
                        #bfae94 93%,
                        #8c7c64 100%
                      )
                    `,
                    boxShadow: '0 30px 65px -15px rgba(0, 0, 0, 0.95), inset 0 2px 6px rgba(255,255,255,0.7), inset 0 -4px 10px rgba(0,0,0,0.3)',
                    border: '1px solid #d4c6b1',
                  }}
                >
                  {/* Real Paper Pulp & Fiber Texture Overlay */}
                  <div 
                    className="absolute inset-0 opacity-[0.14] pointer-events-none mix-blend-multiply"
                    style={{
                      backgroundImage: `repeating-linear-gradient(45deg, #443425 0, #443425 1px, transparent 0, transparent 4px), repeating-linear-gradient(-45deg, #443425 0, #443425 1px, transparent 0, transparent 5px)`
                    }}
                  />

                  {/* Left Spiral Roll Curl Edge */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#9e8f77] via-[#cfc2aa] to-transparent opacity-75 pointer-events-none" />

                  {/* Right Spiral Roll Curl Edge */}
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#9e8f77] via-[#cfc2aa] to-transparent opacity-75 pointer-events-none" />

                  {/* Curled Paper Bottom Edge Flap */}
                  <div 
                    className="absolute bottom-1.5 left-3 right-3 h-4 bg-gradient-to-b from-[#e3d7c3] to-[#c7b79d] border-t border-[#bfae94] opacity-90 rounded-b-md"
                    style={{
                      boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                    }}
                  />

                  {/* Faint Printed Manuscript Archival Text on Paper Body */}
                  <div className="absolute left-8 sm:left-12 top-1/2 -translate-y-1/2 select-none opacity-40 pointer-events-none">
                    <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-[#44382c] uppercase font-bold block">
                      ARCHIVAL SPECIFICATION • 2026.04
                    </span>
                    <span className="text-[11px] sm:text-xs font-serif italic text-[#574c3d] block mt-0.5">
                      AI Research Scientist Manuscript
                    </span>
                  </div>

                  {/* ========================================================= */}
                  {/* VIBRANT RED SCHOLAR THREAD TIED AROUND THE CENTER         */}
                  {/* ========================================================= */}
                  <div className="absolute inset-0 pointer-events-none z-30">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 560 165" preserveAspectRatio="none">
                      <defs>
                        {/* Red Thread Contact Shadow on Paper */}
                        <filter id="redThreadShadow" x="-25%" y="-25%" width="150%" height="150%">
                          <feDropShadow dx="1" dy="2.5" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
                        </filter>

                        {/* Crimson Red Thread Gradient */}
                        <linearGradient id="redCordGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#991b1b" />
                          <stop offset="30%" stopColor="#dc2626" />
                          <stop offset="50%" stopColor="#ef4444" />
                          <stop offset="70%" stopColor="#dc2626" />
                          <stop offset="100%" stopColor="#7f1d1d" />
                        </linearGradient>
                      </defs>

                      {/* Main Red Thread Wrap around Cylinder */}
                      <motion.path
                        d="M 280 -2 Q 275 80 280 167"
                        fill="none"
                        stroke="url(#redCordGrad)"
                        strokeWidth="4"
                        filter="url(#redThreadShadow)"
                        strokeLinecap="round"
                        animate={
                          stage === 'untying'
                            ? { x: -80, opacity: 0 }
                            : { x: 0, opacity: 1 }
                        }
                        transition={{ duration: 1.1, ease: 'easeInOut' }}
                      />

                      {/* Center Red Knot Bow Loops & Tails */}
                      <motion.g
                        transform="translate(280, 82)"
                        filter="url(#redThreadShadow)"
                        animate={
                          stage === 'untying'
                            ? { scale: 0.2, opacity: 0, y: 30 }
                            : { scale: 1, opacity: 1, y: 0 }
                        }
                        transition={{ duration: 0.9, ease: 'easeInOut' }}
                      >
                        {/* Center Knot Core */}
                        <circle cx="0" cy="0" r="5" fill="#7f1d1d" />
                        <circle cx="-1" cy="-1" r="3.5" fill="#ef4444" />

                        {/* Left Loop */}
                        <path
                          d="M 0 0 C -25 -22 -32 10 -2 3"
                          fill="none"
                          stroke="url(#redCordGrad)"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                        />

                        {/* Right Loop */}
                        <path
                          d="M 0 0 C 25 -22 32 10 2 3"
                          fill="none"
                          stroke="url(#redCordGrad)"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                        />

                        {/* Hanging Red Thread Tail 1 */}
                        <path
                          d="M -2 3 Q -15 32 -8 58"
                          fill="none"
                          stroke="url(#redCordGrad)"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                        />

                        {/* Hanging Red Thread Tail 2 */}
                        <path
                          d="M 2 3 Q 18 36 12 64"
                          fill="none"
                          stroke="url(#redCordGrad)"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                        />
                      </motion.g>
                    </svg>
                  </div>
                </motion.div>
              </div>

              {/* Gentle Helper Footnote */}
              <p className="mt-8 text-xs text-slate-500 font-sans tracking-wide">
                Physical parchment paper tied with red scholar thread. Click paper or wait to unroll.
              </p>
            </motion.div>
          ) : (
            /* ========================================================================= */
            /* STAGE 2: AUTHENTIC UNROLLED PAPER (NO UI CARD! GENUINE PARCHMENT SCROLL)  */
            /* ========================================================================= */
            <motion.div
              key="unrolled-paper-stage"
              initial={{
                scaleY: 0.16,
                opacity: 0.4,
                y: -15,
              }}
              animate={{
                scaleY: 1,
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 1.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: 'top center' }}
              className="w-full flex flex-col items-center my-auto py-2 z-20 select-none"
            >
              {/* THE AUTHENTIC OPEN PARCHMENT RESEARCH DOCUMENT */}
              <div className="relative w-full max-w-4xl">
                {/* 1. TOP CURLED PARCHMENT SCROLL LIP (Physical 3D Roll Curl) */}
                <div 
                  className="w-full h-8 sm:h-10 rounded-t-lg -mb-1 relative z-20"
                  style={{
                    background: 'linear-gradient(180deg, #bcae97 0%, #ede2d1 40%, #faf7f0 75%, #d8cbba 100%)',
                    boxShadow: '0 -10px 25px -5px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.7)',
                    border: '1px solid #cfc0aa',
                    borderBottom: 'none',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
                </div>

                {/* 2. MAIN OPEN RESEARCH PAPER BODY (Organic Deckled Parchment Surface) */}
                <div 
                  className="relative w-full px-6 sm:px-12 md:px-16 py-8 sm:py-12 md:py-14 text-[#0f172a] overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, #fbf8f2 0%, #f6f0e4 50%, #f2ebdd 100%)',
                    boxShadow: '0 40px 90px -20px rgba(0, 0, 0, 0.98), 0 15px 40px -10px rgba(0, 0, 0, 0.7), inset 0 0 50px rgba(180, 160, 130, 0.18)',
                    borderLeft: '1px solid #d4c6b1',
                    borderRight: '1px solid #d4c6b1',
                  }}
                >
                  {/* Organic Pulp & Fiber Texture Overlay */}
                  <div 
                    className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-multiply"
                    style={{
                      backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 4px), repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 0, transparent 5px)`
                    }}
                  />

                  {/* Left & Right Subtle Curl Gradient */}
                  <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-[#cfc0aa]/30 to-transparent pointer-events-none" />
                  <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-[#cfc0aa]/30 to-transparent pointer-events-none" />

                  {/* Top Archival Preprint Bar */}
                  <div className="border-b border-[#cfc1aa] pb-3 mb-6 flex flex-wrap items-center justify-between gap-2 text-[9px] sm:text-[10px] font-mono text-[#64748b] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      <span className="font-bold text-[#1e293b]">ARXIV PREPRINT • VOL. 2026.04</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#78716c]">
                      <span>DOI: 10.1038/s41586-2026</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">PEER-REVIEWED SYNTHESIS</span>
                    </div>
                  </div>

                  {/* Header Badge */}
                  <div className="flex justify-center mb-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eae1d0]/80 border border-[#cbbaa1] text-[#475569] text-xs font-mono uppercase tracking-wider shadow-xs">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
                      <span className="font-semibold text-[#1e293b]">PEER-GRADE AI RESEARCH ASSISTANT</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  {/* Main Hero Title: AI RESEARCH SCIENTIST */}
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0f172a] uppercase font-sans text-center leading-tight">
                    AI RESEARCH SCIENTIST
                  </h1>

                  {/* Tagline: Transform Research Into Intelligence */}
                  <p className="mt-3 text-lg sm:text-2xl md:text-3xl font-medium tracking-tight text-[#4338ca] font-serif italic text-center">
                    Transform Research Into Intelligence
                  </p>

                  {/* Horizontal Paper Rule */}
                  <div className="my-5 flex items-center gap-3 max-w-xl mx-auto">
                    <div className="h-px bg-[#cfc1aa] flex-1" />
                    <span className="text-[8.5px] font-mono uppercase text-[#85796a] tracking-widest">
                      PROJECT ABSTRACT & SPECIFICATION
                    </span>
                    <div className="h-px bg-[#cfc1aa] flex-1" />
                  </div>

                  {/* Project Description Container on the Paper */}
                  <div className="max-w-2xl mx-auto bg-[#faf6ed]/90 border border-[#d6c7b0] rounded-xl p-5 sm:p-6 shadow-sm text-center backdrop-blur-xs">
                    <p className="text-xs sm:text-sm text-[#334155] leading-relaxed font-sans font-normal">
                      AI Research Scientist is an AI-powered research assistant designed to help users discover relevant research papers, analyze their abstracts and methodologies, identify research gaps, generate research questions, compare existing approaches, and transform research findings into structured documentation and presentations.
                    </p>
                  </div>

                  {/* Research Pipeline Progression */}
                  <div className="my-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#64748b]">
                    <span className="text-indigo-700 font-bold">RESEARCH</span>
                    <span className="text-[#a8a29e]">→</span>
                    <span className="text-cyan-700 font-bold">ANALYSIS</span>
                    <span className="text-[#a8a29e]">→</span>
                    <span className="text-emerald-700 font-bold">INSIGHTS</span>
                    <span className="text-[#a8a29e]">→</span>
                    <span className="text-amber-700 font-bold">RESEARCH GAPS</span>
                    <span className="text-[#a8a29e]">→</span>
                    <span className="text-indigo-700 font-bold">DOCUMENTATION</span>
                  </div>

                  {/* Primary Action Buttons: [ Sign In ]  [ Sign Up ] */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                    <button
                      onClick={() => openAuth('signin')}
                      className="px-7 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide text-white bg-[#1e293b] hover:bg-[#0f172a] border border-[#334155] shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </button>

                    <button
                      onClick={() => openAuth('signup')}
                      className="px-8 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 border border-indigo-500/50 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Sign Up</span>
                    </button>
                  </div>

                  {/* Footer Security Badge on the Paper */}
                  <div className="mt-7 pt-4 border-t border-[#cfc1aa] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#64748b] font-mono">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>PostgreSQL Authenticated Workspace • Full Research Modules Ready</span>
                    </div>
                    <div>
                      <span>STATUS: UNROLLED & ACTIVE</span>
                    </div>
                  </div>
                </div>

                {/* 3. BOTTOM CURLED PARCHMENT SCROLL LIP (Physical 3D Roll Curl) */}
                <div 
                  className="w-full h-8 sm:h-10 rounded-b-lg -mt-1 relative z-20"
                  style={{
                    background: 'linear-gradient(180deg, #d8cbba 0%, #faf7f0 25%, #ede2d1 60%, #bcae97 100%)',
                    boxShadow: '0 15px 30px -5px rgba(0,0,0,0.7), inset 0 -2px 4px rgba(255,255,255,0.7)',
                    border: '1px solid #cfc0aa',
                    borderTop: 'none',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-slate-800/60 bg-[#090d15]/85 backdrop-blur-md px-4 sm:px-8 py-3 text-center text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono">
          <span>AI Research Scientist</span>
          <span className="text-slate-600">•</span>
          <span>Archival Monograph System</span>
        </div>
        <div>
          © 2026 AI Research Scientist. All Existing Research Modules & Pipeline Preserved.
        </div>
      </footer>

      {/* Authentication Modal (Connected to PostgreSQL Backend) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};
