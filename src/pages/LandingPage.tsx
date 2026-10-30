import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  BookOpen, 
  ChevronRight,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  MousePointerClick,
  Layers,
  Cpu,
  FileText,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AIAssistantPanel } from '../components/assistant/AIAssistantPanel';

type PaperStage = 'closed' | 'opening' | 'open';
type AuthMode = 'signin' | 'signup';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, signInDemo } = useAuth();

  const [stage, setStage] = useState<PaperStage>('closed');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');

  // Sign Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleOpenPaper = () => {
    if (stage === 'open') return;
    setStage('opening');
    setTimeout(() => {
      setStage('open');
    }, 700);
  };

  const handleClosePaper = () => {
    setStage('closed');
    setErrorMessage(null);
    setSuccessMessage(null);
    setInfoMessage(null);
  };

  const switchMode = (newMode: AuthMode) => {
    setAuthMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setInfoMessage(null);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage('Password recovery instructions will be transmitted to your registered academic email.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setInfoMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please provide a valid academic or professional email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (authMode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full academic name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify your password confirmation.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        await signUp(fullName.trim(), trimmedEmail, password);
        setSuccessMessage('Academic account registered! Entering research workspace...');
      } else {
        await signIn(trimmedEmail, password);
        setSuccessMessage('Authentication verified! Loading your academic workspace...');
      }

      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials or try Instant Demo Access.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setIsLoading(true);
    setSuccessMessage('Demo Researcher credentials applied! Loading workspace...');
    try {
      await signInDemo();
    } catch (e) {
      console.warn('Demo sign in notice:', e);
    }
    setTimeout(() => {
      navigate('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#090d15] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-x-hidden font-sans">
      {/* Seamless Ambient Study Atmosphere: Rich dark desk surface with warm overhead study lamp vignette */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Overhead study lamp warm vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 45%, rgba(30, 40, 60, 0.45) 0%, rgba(12, 17, 27, 0.9) 60%, #06080e 100%)'
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
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[600px] bg-indigo-950/25 rounded-full blur-[150px]" />
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
              Autonomous Academic Literature Synthesis Platform
            </span>
          </div>
        </div>

        {/* Top Navbar Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {stage === 'closed' ? (
            <button
              onClick={handleOpenPaper}
              className="text-xs font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-lg border border-slate-700 hover:border-indigo-500/60 bg-slate-900/60 hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-950/40"
            >
              <MousePointerClick className="w-3.5 h-3.5 text-indigo-400" />
              <span>Click Scroll to Open Paper</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleClosePaper}
                className="text-[11px] font-mono text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/50 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Roll scroll back closed"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Re-roll Scroll</span>
              </button>
              <button
                onClick={handleDemoAccess}
                className="px-3 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/50 rounded-lg border border-amber-600/40 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Instant Demo Access</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10 max-w-5xl w-full mx-auto">
        <AnimatePresence mode="wait">
          {/* ========================================================================= */}
          {/* STAGE 1: ENTRANCE - ROLLED SCROLL WITH RED RIBBON IMAGE (CLICK TO OPEN)   */}
          {/* ========================================================================= */}
          {stage === 'closed' || stage === 'opening' ? (
            <motion.div
              key="closed-scroll-entrance"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={
                stage === 'opening'
                  ? { opacity: 0, scale: 1.15, y: -20, rotate: 2 }
                  : { opacity: 1, scale: 1, y: 0, rotate: 0 }
              }
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(8px)', transition: { duration: 0.5 } }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="flex flex-col items-center justify-center my-auto select-none"
            >
              {/* Minimalist Academic Status Pill */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono tracking-widest uppercase text-slate-300 shadow-lg shadow-black/40"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>ACADEMIC RESEARCH CHARTER • SEALED WITH RED RIBBON</span>
              </motion.div>

              {/* Physical Contact Shadow & Overhead Lamp Halo */}
              <div className="relative group cursor-pointer" onClick={handleOpenPaper}>
                {/* Desk Ambient Warm Radial Aura */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[540px] h-[340px] sm:h-[440px] bg-gradient-to-r from-amber-500/15 via-red-500/10 to-indigo-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

                {/* Desk Contact Shadow */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[75%] h-12 bg-black/90 rounded-full blur-xl pointer-events-none transition-all duration-300 group-hover:w-[85%] group-hover:h-14 group-hover:opacity-100" />

                {/* PURE ROLLED PAPER SCROLL DIRECTLY ON DESK (NO CARD FRAME) */}
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="relative z-10 transition-transform duration-300 group-hover:scale-[1.04]"
                >
                  <img
                    src="/scroll_pure_isolated.png"
                    alt="Sealed Academic Research Paper Scroll"
                    className="w-[300px] sm:w-[420px] md:w-[480px] h-auto object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.9)]"
                  />

                  {/* Interactive Hover Prompt */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="px-4 py-2 rounded-xl bg-slate-950/90 text-white text-xs font-semibold tracking-wide border border-indigo-400/60 shadow-2xl backdrop-blur-md flex items-center gap-2 transform -translate-y-2">
                      <MousePointerClick className="w-4 h-4 text-amber-300 animate-bounce" />
                      <span>Click Paper to Open & Sign In</span>
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Clear Invitation Button Below Image */}
              <div className="mt-8 flex flex-col items-center gap-3">
                <button
                  onClick={handleOpenPaper}
                  className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-xl shadow-indigo-600/30 border border-indigo-400/40 transition-all flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <MousePointerClick className="w-4 h-4 text-amber-300" />
                  <span>Click Paper to Open & Enter</span>
                  <ArrowRight className="w-4 h-4 text-indigo-200" />
                </button>

                <p className="text-xs text-slate-400 font-mono tracking-tight flex items-center gap-1.5">
                  <span>Click the scroll or button above to unfold the manuscript.</span>
                </p>
              </div>
            </motion.div>
          ) : (
            /* ========================================================================= */
            /* STAGE 2: AUTHENTIC UNROLLED PAPER - HOSTING THE SIGN PAGE DIRECTLY        */
            /* ========================================================================= */
            <motion.div
              key="unrolled-paper-sign-stage"
              initial={{
                scaleY: 0.12,
                opacity: 0.3,
                y: -25,
              }}
              animate={{
                scaleY: 1,
                opacity: 1,
                y: 0,
              }}
              exit={{
                scaleY: 0.1,
                opacity: 0,
                y: 20,
                transition: { duration: 0.4 },
              }}
              transition={{
                duration: 1.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: 'top center' }}
              className="w-full flex flex-col items-center my-auto py-2 z-20"
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

                {/* 2. MAIN OPEN RESEARCH PAPER BODY */}
                <div 
                  className="relative w-full px-5 sm:px-10 md:px-12 py-8 sm:py-10 text-[#0f172a] overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, #fcf9f4 0%, #f7f2e8 50%, #f3ece0 100%)',
                    boxShadow: '0 40px 90px -20px rgba(0, 0, 0, 0.98), 0 15px 40px -10px rgba(0, 0, 0, 0.7), inset 0 0 50px rgba(180, 160, 130, 0.15)',
                    borderLeft: '1px solid #d4c6b1',
                    borderRight: '1px solid #d4c6b1',
                  }}
                >
                  {/* Organic Pulp Texture Overlay */}
                  <div 
                    className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-multiply"
                    style={{
                      backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 4px), repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 0, transparent 5px)`
                    }}
                  />

                  {/* Left & Right Subtle Curl Gradient */}
                  <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-[#cfc0aa]/30 to-transparent pointer-events-none" />
                  <div className="absolute top-0 bottom-0 right-0 w-6 bg-gradient-to-l from-[#cfc0aa]/30 to-transparent pointer-events-none" />

                  {/* Top Archival Preprint Bar */}
                  <div className="border-b border-[#cfc1aa] pb-3 mb-6 flex flex-wrap items-center justify-between gap-2 text-[9px] sm:text-[10px] font-mono text-[#64748b] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      <span className="font-bold text-[#1e293b]">AI RESEARCH SCIENTIST CHARTER • VOL. 2026.04</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#78716c]">
                      <span>DOI: 10.1038/s41586-2026</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">PEER-GRADE WORKSPACE</span>
                    </div>
                  </div>

                  {/* Paper Header Title */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eae1d0]/80 border border-[#cbbaa1] text-[#475569] text-xs font-mono uppercase tracking-wider mb-2.5 shadow-xs">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
                      <span className="font-semibold text-[#1e293b]">ACADEMIC RESEARCH PLATFORM</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>

                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#0f172a] uppercase font-sans leading-tight">
                      AI RESEARCH SCIENTIST
                    </h1>
                    <p className="mt-1 text-sm sm:text-lg font-medium text-[#4338ca] font-serif italic">
                      Transform Scientific Papers Into Publication-Ready Intelligence
                    </p>
                  </div>

                  {/* Horizontal Manuscript Divider */}
                  <div className="my-5 flex items-center gap-3 max-w-2xl mx-auto">
                    <div className="h-px bg-[#cfc1aa] flex-1" />
                    <span className="text-[9px] font-mono uppercase text-[#85796a] tracking-widest font-semibold">
                      RESEARCH WORKSPACE ADMISSION CHARTER
                    </span>
                    <div className="h-px bg-[#cfc1aa] flex-1" />
                  </div>

                  {/* DUAL-COLUMN LAYOUT: Research Overview (Left) + The Sign In/Up Form (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-4xl mx-auto">
                    {/* Left Column: Platform Capabilities & Monograph Synopsis */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                      <div className="bg-[#fbf7ee]/90 border border-[#d6c7b0] rounded-xl p-4 sm:p-5 shadow-xs">
                        <h3 className="text-xs font-mono uppercase font-bold text-[#1e293b] tracking-wider mb-2 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-indigo-700" />
                          <span>Autonomous Synthesis</span>
                        </h3>
                        <p className="text-xs text-[#334155] leading-relaxed">
                          Discover PubMed, arXiv, and Nature papers, extract empirical evidence, generate research hypotheses, benchmark architectures, and draft formatted IEEE/ACM manuscripts.
                        </p>
                      </div>

                      {/* Feature Highlights */}
                      <div className="space-y-2 text-xs text-[#475569]">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-emerald-700 text-[10px] font-bold">✓</span>
                          </div>
                          <span>Multi-repository academic paper discovery & deep analysis</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-emerald-700 text-[10px] font-bold">✓</span>
                          </div>
                          <span>Research gap extraction & evolutionary literature matrix</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-emerald-700 text-[10px] font-bold">✓</span>
                          </div>
                          <span>Interactive React Flow proposed system architecture</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-emerald-700 text-[10px] font-bold">✓</span>
                          </div>
                          <span>Automated IEEE / ACM documentation & slide deck generation</span>
                        </div>
                      </div>

                      {/* Pipeline Tags */}
                      <div className="p-3 bg-[#ede3d1]/60 rounded-xl border border-[#cbbaa1] text-[10px] font-mono text-[#475569]">
                        <span className="font-bold text-[#1e293b] block mb-1">SYNTHESIS PIPELINE:</span>
                        <div className="flex flex-wrap gap-1 text-[#64748b]">
                          <span className="bg-white/80 px-1.5 py-0.5 rounded border border-[#cbbaa1] text-indigo-800 font-semibold">PAPERS</span>
                          <span>→</span>
                          <span className="bg-white/80 px-1.5 py-0.5 rounded border border-[#cbbaa1] text-cyan-800 font-semibold">GAPS</span>
                          <span>→</span>
                          <span className="bg-white/80 px-1.5 py-0.5 rounded border border-[#cbbaa1] text-emerald-800 font-semibold">METHODS</span>
                          <span>→</span>
                          <span className="bg-white/80 px-1.5 py-0.5 rounded border border-[#cbbaa1] text-amber-800 font-semibold">DOCS</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: THE SIGN PAGE FORM DIRECTLY ON THE PAPER */}
                    <div className="lg:col-span-7 bg-[#ffffff]/90 border border-[#d1c2ab] rounded-2xl p-5 sm:p-7 shadow-xl shadow-[#4a3f35]/15 backdrop-blur-xs">
                      {/* Sign In / Sign Up Mode Switcher Tabs */}
                      <div className="flex items-center p-1 bg-[#ede4d4] rounded-xl border border-[#d6c7b0] mb-5">
                        <button
                          type="button"
                          onClick={() => switchMode('signin')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            authMode === 'signin'
                              ? 'bg-[#1e293b] text-white shadow-sm'
                              : 'text-[#475569] hover:text-[#0f172a]'
                          }`}
                        >
                          Sign In
                        </button>
                        <button
                          type="button"
                          onClick={() => switchMode('signup')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            authMode === 'signup'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-[#475569] hover:text-[#0f172a]'
                          }`}
                        >
                          Sign Up (New Account)
                        </button>
                      </div>

                      {/* Notification Alerts */}
                      {errorMessage && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{errorMessage}</span>
                        </div>
                      )}

                      {successMessage && (
                        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-tight font-medium">{successMessage}</span>
                        </div>
                      )}

                      {infoMessage && (
                        <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-start gap-2.5">
                          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{infoMessage}</span>
                        </div>
                      )}

                      {/* The Form */}
                      <form onSubmit={handleSubmit} className="space-y-3.5">
                        {/* Full Name field (Only in Sign Up) */}
                        {authMode === 'signup' && (
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#334155] mb-1">
                              Full Academic Name
                            </label>
                            <div className="relative">
                              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                              <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="e.g. Dr. Jane Smith"
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#faf7f0] border border-[#cfc1aa] text-[#0f172a] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-600 transition-all"
                              />
                            </div>
                          </div>
                        )}

                        {/* Email field */}
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#334155] mb-1">
                            Academic / Institutional Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="scholar@university.edu"
                              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#faf7f0] border border-[#cfc1aa] text-[#0f172a] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-600 transition-all"
                            />
                          </div>
                        </div>

                        {/* Password field */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#334155]">
                              Password
                            </label>
                            {authMode === 'signin' && (
                              <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-[11px] font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer"
                              >
                                Forgot password?
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full pl-9 pr-10 py-2 text-xs rounded-xl bg-[#faf7f0] border border-[#cfc1aa] text-[#0f172a] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-600 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#1e293b] cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password field (Only in Sign Up) */}
                        {authMode === 'signup' && (
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#334155] mb-1">
                              Confirm Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full pl-9 pr-10 py-2 text-xs rounded-xl bg-[#faf7f0] border border-[#cfc1aa] text-[#0f172a] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-600 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#1e293b] cursor-pointer"
                              >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center justify-between text-xs text-[#475569] pt-1">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-3.5 h-3.5 rounded border-[#cbd5e1] text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Keep session active for 30 days</span>
                          </label>
                        </div>

                        {/* Primary Submit Button */}
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                            authMode === 'signup'
                              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                              : 'bg-[#1e293b] hover:bg-[#0f172a] shadow-slate-900/30'
                          } ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                              <span>Authenticating...</span>
                            </>
                          ) : authMode === 'signup' ? (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-300" />
                              <span>Create Academic Account & Enter</span>
                            </>
                          ) : (
                            <>
                              <span>Sign In to Research Workspace</span>
                              <ArrowRight className="w-4 h-4 text-slate-300" />
                            </>
                          )}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-2 my-2.5">
                          <div className="h-px bg-[#e2d6c1] flex-1" />
                          <span className="text-[10px] font-mono uppercase text-[#85796a]">OR</span>
                          <div className="h-px bg-[#e2d6c1] flex-1" />
                        </div>

                        {/* Instant One-Click Demo Access */}
                        <button
                          type="button"
                          onClick={handleDemoAccess}
                          disabled={isLoading}
                          className="w-full py-2 px-3 rounded-xl font-semibold text-xs text-indigo-900 bg-[#eef2ff] hover:bg-[#e0e7ff] border border-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Instant Demo Access (Dr. Alex Vance)</span>
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Footer Security Badge on the Paper */}
                  <div className="mt-8 pt-4 border-t border-[#cfc1aa] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#64748b] font-mono">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>PostgreSQL & JWT Secured Academic Platform</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleClosePaper}
                        className="text-indigo-800 hover:text-indigo-950 font-bold underline cursor-pointer"
                      >
                        Roll Back Closed
                      </button>
                      <span>•</span>
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
          © 2026 AI Research Scientist. All Existing Research Modules & Full Pipeline Preserved.
        </div>
      </footer>

      {/* Floating Chatbot Assistant on Bottom-Right */}
      <AIAssistantPanel />
    </div>
  );
};
