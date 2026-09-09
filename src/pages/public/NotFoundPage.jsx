import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="animate-scale-in flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-600">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="animate-fade-in-up mt-6 text-2xl font-bold text-ink-900">
        Page introuvable
      </h1>
      <p className="animate-fade-in-up mt-2 text-sm text-ink-500">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        className="animate-fade-in-up mt-8 inline-flex items-center justify-center rounded-xl bg-forest-500 px-6 py-3 text-sm font-semibold text-white transition-smooth hover:bg-forest-600"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
