import { Menu, Bell } from "lucide-react";

export default function AdminTopbar({ title, subtitle, onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-900/5 bg-cream-200/90 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-ink-700 hover:bg-ink-900/5 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
        </div>
      </div>
      <button className="relative rounded-full p-2 text-ink-700 hover:bg-ink-900/5">
        <Bell className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-brand-400" />
      </button>
    </header>
  );
}
