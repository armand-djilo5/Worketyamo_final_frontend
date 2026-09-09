import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen bg-cream-200">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40 animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative animate-slide-in-left">
            <AdminSidebar onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet context={{ openDrawer: () => setDrawerOpen(true) }} />
      </div>
    </div>
  );
}
