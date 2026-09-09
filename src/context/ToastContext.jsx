import { createContext, useContext, useCallback, useState, useMemo } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (message, type = "success") => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 4200);
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      success: (msg) => pushToast(msg, "success"),
      error: (msg) => pushToast(msg, "error"),
      info: (msg) => pushToast(msg, "info"),
    }),
    [pushToast]
  );

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-forest-500 shrink-0" />,
    error: <XCircle className="h-5 w-5 text-red-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-amber-brand-500 shrink-0" />,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-100 flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-slide-in-right flex items-start gap-3 rounded-xl border border-ink-900/5 bg-white px-4 py-3 shadow-lg shadow-ink-900/5"
          >
            {icons[t.type]}
            <p className="text-sm text-ink-900 flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="text-ink-300 hover:text-ink-700 transition-smooth"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
