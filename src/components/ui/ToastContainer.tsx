import React from 'react';
import { useResearch } from '../../context/ResearchContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useResearch();

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-indigo-500 shrink-0" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border border-border bg-card text-card-foreground shadow-lg backdrop-blur-md"
          >
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-foreground tracking-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
