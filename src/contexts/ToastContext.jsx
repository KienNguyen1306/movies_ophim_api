"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { Info, CheckCircle2, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "info") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove]
  );

  const api = {
    info: (m) => push(m, "info"),
    success: (m) => push(m, "success"),
    warning: (m) => push(m, "warning"),
    notImplemented: () => push("Chức năng này chưa được phát triển", "warning"),
  };

  const iconFor = (type) => {
    if (type === "success") return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    if (type === "warning") return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    return <Info className="w-4 h-4 text-primary" />;
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-2 bg-card border border-border rounded-xl shadow-xl px-4 py-3 animate-fade-in"
          >
            {iconFor(t.type)}
            <p className="text-sm text-foreground flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="cursor-pointer text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
