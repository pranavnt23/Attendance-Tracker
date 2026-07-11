import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, X, Trash2 } from 'lucide-react';

// ─── Context ────────────────────────────────────────────────────────────────

const DialogContext = createContext(null);

/**
 * useDialog — hook to open dialogs and toasts from anywhere in the app.
 *
 * Usage:
 *   const { alert, confirm, toast } = useDialog();
 *
 *   // Non-blocking notification (auto-dismisses)
 *   toast('Saved successfully!', 'success');           // variants: success | error | info | warning
 *
 *   // Blocking info alert (user must dismiss)
 *   await alert('You cannot delete your own account.', { variant: 'warning' });
 *
 *   // Blocking confirmation dialog (returns true/false)
 *   const ok = await confirm('Delete this session?', { variant: 'danger', confirmLabel: 'Delete' });
 *   if (ok) { ... }
 */
export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used inside <DialogProvider>');
  return ctx;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TOAST_DURATION = 4000;

let toastIdCounter = 0;

// ─── Toast Item ──────────────────────────────────────────────────────────────

const TOAST_STYLES = {
  success: {
    bar: 'bg-emerald-500',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    border: 'border-emerald-200 dark:border-emerald-800/50',
    bg: 'bg-white dark:bg-slate-900',
  },
  error: {
    bar: 'bg-rose-500',
    icon: <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />,
    border: 'border-rose-200 dark:border-rose-800/50',
    bg: 'bg-white dark:bg-slate-900',
  },
  warning: {
    bar: 'bg-amber-500',
    icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    border: 'border-amber-200 dark:border-amber-800/50',
    bg: 'bg-white dark:bg-slate-900',
  },
  info: {
    bar: 'bg-indigo-500',
    icon: <Info className="w-4 h-4 text-indigo-500 shrink-0" />,
    border: 'border-indigo-200 dark:border-indigo-800/50',
    bg: 'bg-white dark:bg-slate-900',
  },
};

const ToastItem = ({ toast, onDismiss }) => {
  const s = TOAST_STYLES[toast.variant] || TOAST_STYLES.info;
  return (
    <div
      className={`relative flex items-start gap-3 w-full max-w-sm rounded-2xl border shadow-lg shadow-black/10 dark:shadow-black/30 px-4 py-3.5 ${s.bg} ${s.border} animate-slide-up overflow-hidden`}
      style={{ animationDuration: '0.3s' }}
    >
      {/* Color bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${s.bar}`} />
      <div className="pl-1 flex items-start gap-3 w-full">
        {s.icon}
        <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-snug flex-1">{toast.message}</p>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0 cursor-pointer mt-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ─── Dialog Modal ─────────────────────────────────────────────────────────────

const DIALOG_ICON = {
  danger:  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0"><Trash2 className="w-6 h-6 text-rose-500" /></div>,
  warning: <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0"><AlertTriangle className="w-6 h-6 text-amber-500" /></div>,
  info:    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0"><Info className="w-6 h-6 text-indigo-500" /></div>,
  success: <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>,
};

const CONFIRM_BTN = {
  danger:  'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20',
  info:    'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20',
};

const DialogModal = ({ dialog, onResolve }) => {
  const isConfirm = dialog.type === 'confirm';
  const variant = dialog.variant || (isConfirm ? 'danger' : 'info');

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.2s ease forwards' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={() => !isConfirm && onResolve(undefined)}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-black/20 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 p-6 animate-scale-in"
        style={{ animationDuration: '0.25s' }}
      >
        {/* Close button (alert only) */}
        {!isConfirm && (
          <button
            onClick={() => onResolve(undefined)}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Icon + Title */}
        <div className="flex items-start gap-4 mb-4">
          {DIALOG_ICON[variant]}
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base">
              {dialog.title || (isConfirm ? 'Confirm Action' : 'Notice')}
            </h3>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 pl-16 -mt-3">
          {dialog.message}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          {isConfirm ? (
            <>
              <button
                onClick={() => onResolve(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-95"
              >
                {dialog.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={() => onResolve(true)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95 ${CONFIRM_BTN[variant]}`}
              >
                {dialog.confirmLabel || 'Confirm'}
              </button>
            </>
          ) : (
            <button
              onClick={() => onResolve(undefined)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95 ${CONFIRM_BTN[variant]}`}
            >
              {dialog.confirmLabel || 'OK'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Toast Container ──────────────────────────────────────────────────────────

const ToastContainer = ({ toasts, dismissToast }) =>
  createPortal(
    <div className="fixed top-4 right-4 z-[9998] flex flex-col gap-2.5 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={dismissToast} />
        </div>
      ))}
    </div>,
    document.body
  );

// ─── Provider ─────────────────────────────────────────────────────────────────

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);
  const [toasts, setToasts] = useState([]);
  const resolverRef = useRef(null);

  // --- Toast API ---
  const toast = useCallback((message, variant = 'info') => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Dialog API ---
  const openDialog = useCallback((type, message, options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({ type, message, ...options });
    });
  }, []);

  const handleResolve = useCallback((value) => {
    setDialog(null);
    resolverRef.current?.(value);
    resolverRef.current = null;
  }, []);

  /**
   * alert(message, options?)
   * options: { title, variant: 'info'|'warning'|'success'|'danger', confirmLabel }
   * Returns a Promise that resolves when the user dismisses.
   */
  const alert = useCallback(
    (message, options) => openDialog('alert', message, options),
    [openDialog]
  );

  /**
   * confirm(message, options?)
   * options: { title, variant: 'danger'|'warning'|'info', confirmLabel, cancelLabel }
   * Returns a Promise<boolean> — true if confirmed, false if cancelled.
   */
  const confirm = useCallback(
    (message, options) => openDialog('confirm', message, options),
    [openDialog]
  );

  return (
    <DialogContext.Provider value={{ alert, confirm, toast }}>
      {children}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
      {dialog && <DialogModal dialog={dialog} onResolve={handleResolve} />}
    </DialogContext.Provider>
  );
};
