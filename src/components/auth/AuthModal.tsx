import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Loader2
} from 'lucide-react';

export type AuthMode = 'signin' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onSuccess,
}) => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>(initialMode);
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

  if (!isOpen) return null;

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
    setInfoMessage(null);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage('Password recovery instructions will be sent to your registered academic email address.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setInfoMessage(null);

    // Validation
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid academic or professional email address.');
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

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        await signUp(fullName.trim(), trimmedEmail, password);
        setSuccessMessage('Account created successfully! Entering academic workspace...');
      } else {
        await signIn(trimmedEmail, password);
        setSuccessMessage('Authentication verified! Entering academic workspace...');
      }

      // Small delay to show smooth success animation, then redirect into existing frontend
      setTimeout(() => {
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard');
        }
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl shadow-indigo-950/50 p-6 sm:p-8 z-10 text-slate-100 overflow-hidden backdrop-blur-xl">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">
            AI Research Scientist
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
          {mode === 'signup' ? 'Create Research Account' : 'Sign In to Workspace'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          {mode === 'signup'
            ? 'Join the intelligent literature and research synthesis platform'
            : 'Access your research papers, methodologies, and pipeline'}
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Info Alert */}
        {infoMessage && (
          <div className="mb-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs flex items-start gap-2.5 animate-in slide-in-from-top-1">
            <Sparkles className="w-4 h-4 shrink-0 text-sky-400 mt-0.5" />
            <div className="flex-1 font-medium">{infoMessage}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (Sign Up only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Aris Thorne"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@university.edu"
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Password
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Remember Me (Sign In only) */}
          {mode === 'signin' && (
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-700 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-2 text-xs text-slate-400 cursor-pointer">
                Remember Me
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-xs tracking-wide text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with PostgreSQL...</span>
              </>
            ) : mode === 'signup' ? (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Mode Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => switchMode('signin')}
                className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => switchMode('signup')}
                className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
