import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({open,title,description,confirmLabel = "Confirmer",cancelLabel = "Annuler",danger = true,loading = false,onConfirm,onCancel,}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm animate-fade-in px-4">
      <div className="animate-scale-in w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full ${
              danger ? "bg-red-100 text-red-600" : "bg-forest-100 text-forest-600"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <button
            onClick={onCancel}
            className="text-ink-300 hover:text-ink-700 transition-smooth"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-ink-900">{title}</h3>
        {description && <p className="mt-1.5 text-sm text-ink-500">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-900/5 transition-smooth"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-smooth disabled:opacity-60 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-amber-brand-500 hover:bg-amber-brand-400"
            }`}
          >
            {loading ? "Veuillez patienter…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
