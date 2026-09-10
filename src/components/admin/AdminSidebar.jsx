import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import {LayoutDashboard,Briefcase,FileText,BarChart3,LogOut,X,Loader2,} from "lucide-react";
import Logo from "../shared/Logo";
import { API_BASE_URL } from "../../config/env";
import { getSession, clearSession } from "../../utils/authStorage";

const links = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, end: true },
  { to: "/admin/offres", label: "Offres", icon: Briefcase },
  { to: "/admin/candidatures", label: "Candidatures", icon: FileText },
  { to: "/admin/statistiques", label: "Statistiques", icon: BarChart3 },
];

export default function AdminSidebar({ admin, onClose }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  // Route consumed here: POST /api/admin/logout
  async function handleLogout() {
    setLoggingOut(true);
    const session = getSession();
    try {
      if (session?.refreshToken) {
        await axios.post(`${API_BASE_URL}/admin/logout`, {
          refreshToken: session.refreshToken,
        });
      }
    } catch {
      // Session is cleared locally regardless of the server response.
    } finally {
      clearSession();
      setLoggingOut(false);
      navigate("/admin/login", { replace: true });
    }
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-ink-900/5 bg-cream-100 px-4 py-6">
      <div className="flex items-center justify-between px-2">
        <Logo to="/admin" subtitle="Admin Dashboard" />
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-900/5 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-smooth ${
                isActive
                  ? "bg-amber-brand-300 text-ink-900 shadow-sm"
                  : "text-ink-700 hover:bg-ink-900/5"
              }`
            }
          >
            <link.icon className="h-4.5 w-4.5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-ink-900/5 pt-4">
        {admin && (
          <div className="flex items-center gap-2.5 px-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-600 text-sm font-semibold text-white">
              {admin.email?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink-900">{admin.email}</p>
              <p className="text-xs text-ink-500">{admin.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-500 transition-smooth hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
        >
          {loggingOut ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <LogOut className="h-4.5 w-4.5" />
          )}
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
