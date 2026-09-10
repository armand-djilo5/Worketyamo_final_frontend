import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, ShieldCheck } from "lucide-react";
import Logo from "../shared/Logo";

const links = [{ to: "/", label: "Catalogue", end: true }];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/5 bg-cream-200/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo to="/" />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-medium transition-smooth ${
                  isActive
                    ? "text-amber-brand-500"
                    : "text-ink-700 hover:text-amber-brand-500"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* <div className="hidden items-center gap-3 md:flex">
          <NavLink
            to="/admin/login"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 hover:text-amber-brand-500 transition-smooth"
          >
            <ShieldCheck className="h-4 w-4" />
            Espace admin
          </NavLink>
        </div> */}

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-ink-700 hover:bg-ink-900/5 md:hidden transition-smooth"
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="animate-fade-in-up border-t border-ink-900/5 bg-cream-100 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2.5 text-sm font-medium transition-smooth ${
                    isActive
                      ? "bg-forest-50 text-forest-600"
                      : "text-ink-700 hover:bg-ink-900/5"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/admin/login"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-ink-500 hover:bg-ink-900/5 transition-smooth"
            >
              <ShieldCheck className="h-4 w-4" />
              Espace admin
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
