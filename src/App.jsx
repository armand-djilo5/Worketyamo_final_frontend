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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        // Public site 
        <Route element={<PublicLayout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/offres/:id" element={<OfferDetailPage />} />
        </Route>

        //apply
        <Route path="/offres/:id/postuler" element={<ApplyPage />} />

        //auth
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/signup" element={<SignupPage />} />

        // admin dashboard
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
