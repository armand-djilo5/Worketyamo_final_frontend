import { Loader2 } from "lucide-react";

export default function Spinner({ label = "Chargement...", full = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-ink-500 ${
        full ? "min-h-[50vh]" : "py-16"
      }`}
    >
      <Loader2 className="h-7 w-7 animate-spin text-forest-500" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
