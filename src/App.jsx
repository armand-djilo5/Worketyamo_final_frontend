import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "./components/public/PublicLayout";
import CatalogPage from "./pages/public/CatalogPage";
import OfferDetailPage from "./pages/public/OfferDetailPage";
import ApplyPage from "./pages/public/ApplyPage";
import NotFoundPage from "./pages/public/NotFoundPage";

import LoginPage from "./pages/admin/LoginPage";
import SignupPage from "./pages/admin/SignupPage";
import DashboardPage from "./pages/admin/DashboardPage";
import OffersPage from "./pages/admin/OffersPage";
import OfferFormPage from "./pages/admin/OfferFormPage";
import RequestsPage from "./pages/admin/RequestsPage";
import StatsPage from "./pages/admin/StatsPage";

// No Context provider wraps the app anymore: the admin session lives in
// localStorage (src/utils/authStorage.js) and each admin page guards itself
// with the useRequireAdminAuth hook, so every route below is declared flat.
export default function App() {
  return (
    <BrowserRouter>
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

        {/* Admin area — each page checks its own session via useRequireAdminAuth */}
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/offres" element={<OffersPage />} />
        <Route path="/admin/offres/nouvelle" element={<OfferFormPage />} />
        <Route path="/admin/offres/:id/modifier" element={<OfferFormPage />} />
        <Route path="/admin/candidatures" element={<RequestsPage />} />
        <Route path="/admin/statistiques" element={<StatsPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
