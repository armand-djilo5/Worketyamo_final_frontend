import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import PublicLayout from "./components/public/PublicLayout";
import CatalogPage from "./pages/public/CatalogPage";
import OfferDetailPage from "./pages/public/OfferDetailPage";
import ApplyPage from "./pages/public/ApplyPage";
import NotFoundPage from "./pages/public/NotFoundPage";

import AdminLayout from "./components/admin/AdminLayout";
import LoginPage from "./pages/admin/LoginPage";
import SignupPage from "./pages/admin/SignupPage";
import DashboardPage from "./pages/admin/DashboardPage";
import OffersPage from "./pages/admin/OffersPage";
import OfferFormPage from "./pages/admin/OfferFormPage";
import RequestsPage from "./pages/admin/RequestsPage";
import StatsPage from "./pages/admin/StatsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public site */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/offres/:id" element={<OfferDetailPage />} />
            </Route>

            {/* Full-screen application flow (no site navbar/footer) */}
            <Route path="/offres/:id/postuler" element={<ApplyPage />} />

            {/* Admin auth */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin/signup" element={<SignupPage />} />

            {/* Admin protected area */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="offres" element={<OffersPage />} />
              <Route path="offres/nouvelle" element={<OfferFormPage />} />
              <Route path="offres/:id/modifier" element={<OfferFormPage />} />
              <Route path="candidatures" element={<RequestsPage />} />
              <Route path="statistiques" element={<StatsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
