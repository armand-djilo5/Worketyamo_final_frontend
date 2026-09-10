import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

// Plain composition component (props + local useState only — no Context,
// no useOutletContext). Each admin page renders its content as children and
// gets the sidebar/topbar/mobile-drawer chrome around it for free.
export default function AdminPageShell({ title, subtitle, admin, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-cream-200">
      <div className="hidden lg:block">
        <AdminSidebar admin={admin} />
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40 animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative animate-slide-in-left">
            <AdminSidebar admin={admin} onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar title={title} subtitle={subtitle} onMenuClick={() => setDrawerOpen(true)} />
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
