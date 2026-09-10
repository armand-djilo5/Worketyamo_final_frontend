import Logo from "../shared/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-ink-900/5 bg-cream-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Logo to={null} />
        <p className="text-sm text-ink-500 order-last sm:order-0">
          © {new Date().getFullYear()} Worketyamo. Tous droits réservés.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
          <span className="cursor-default hover:text-amber-brand-500 transition-smooth">
            Politique de confidentialité
          </span>
          <span className="cursor-default hover:text-amber-brand-500 transition-smooth">
            Conditions d'utilisation
          </span>
          <span className="cursor-default hover:text-amber-brand-500 transition-smooth">
            Contact
          </span>
        </div>
      </div>
    </footer>
  );
}
