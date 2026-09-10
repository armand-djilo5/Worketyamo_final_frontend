import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react";
import { API_BASE_URL } from "../../config/env";
import { useAuthorizedRequest } from "../../hooks/useAuthorizedRequest";
import { useRequireAdminAuth } from "../../hooks/useRequireAdminAuth";
import { useToast } from "../../hooks/useToast";
import AdminPageShell from "../../components/admin/AdminPageShell";
import ToastStack from "../../components/shared/ToastStack";
import Spinner from "../../components/shared/Spinner";
import EmptyState from "../../components/shared/EmptyState";
import Badge from "../../components/shared/Badge";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import { TYPE_LABELS, TYPE_BADGE_CLASSES } from "../../utils/labels";
import { formatShortDate } from "../../utils/formatDate";

export default function OffersPage() {
  const { admin, ready } = useRequireAdminAuth();
  const authorizedRequest = useAuthorizedRequest();
  const toast = useToast();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Route consumed here: GET /api/admin/offers
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    async function fetchOffers() {
      setLoading(true);
      try {
        const res = await authorizedRequest({
          method: "get",
          url: `${API_BASE_URL}/admin/offers`,
        });
        if (!cancelled) setOffers(res.data);
      } catch (err) {
        if (!cancelled && err?.response?.status === 404) setOffers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOffers();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Route consumed here: PUT /api/offers/:id (toggling isActive)
  async function handleToggleActive(offer) {
    setTogglingId(offer.id);
    try {
      await authorizedRequest({
        method: "put",
        url: `${API_BASE_URL}/offers/${offer.id}`,
        data: { isActive: !offer.isActive },
      });
      setOffers((prev) =>
        prev.map((o) => (o.id === offer.id ? { ...o, isActive: !o.isActive } : o))
      );
      toast.success(`Offre ${!offer.isActive ? "activée" : "désactivée"}.`);
    } catch {
      toast.error("Impossible de modifier le statut de l'offre.");
    } finally {
      setTogglingId(null);
    }
  }

  // Route consumed here: DELETE /api/offers/:id
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await authorizedRequest({
        method: "delete",
        url: `${API_BASE_URL}/offers/${deleteTarget.id}`,
      });
      setOffers((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      toast.success("Offre supprimée avec succès.");
      setDeleteTarget(null);
    } catch {
      toast.error("Impossible de supprimer cette offre.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {!ready ? (
        <Spinner label="Vérification de la session..." full />
      ) : (
        <AdminPageShell title="Offres" subtitle="Gérez les offres de stage et de formation" admin={admin}>
        <div className="flex justify-end">
          <Link
            to="/admin/offres/nouvelle"
            className="inline-flex items-center gap-2 rounded-xl bg-forest-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-smooth hover:bg-forest-600"
          >
            <Plus className="h-4 w-4" />
            Nouvelle offre
          </Link>
        </div>

        <div className="mt-5">
          {loading ? (
            <Spinner label="Chargement des offres..." />
          ) : offers.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="Aucune offre pour le moment"
              description="Créez votre première offre de stage ou de formation."
              action={
                <Link
                  to="/admin/offres/nouvelle"
                  className="inline-flex items-center gap-2 rounded-xl bg-forest-500 px-4 py-2.5 text-sm font-semibold text-white transition-smooth hover:bg-forest-600"
                >
                  <Plus className="h-4 w-4" />
                  Créer une offre
                </Link>
              }
            />
          ) : (
            <div className="animate-fade-in-up overflow-hidden rounded-2xl border border-ink-900/5 bg-white shadow-sm shadow-ink-900/3">
              <div className="overflow-x-auto">
                <table className="w-full min-w-180 text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink-900/5 text-xs uppercase tracking-wide text-ink-300">
                      <th className="px-5 py-3.5 font-medium">Titre</th>
                      <th className="px-5 py-3.5 font-medium">Type</th>
                      <th className="px-5 py-3.5 font-medium">Domaine</th>
                      <th className="px-5 py-3.5 font-medium">Candidatures</th>
                      <th className="px-5 py-3.5 font-medium">Statut</th>
                      <th className="px-5 py-3.5 font-medium">Créée le</th>
                      <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((offer) => (
                      <tr key={offer.id} className="border-b border-ink-900/5 last:border-0 hover:bg-cream-50/60 transition-smooth">
                        <td className="px-5 py-4 font-medium text-ink-900">{offer.title}</td>
                        <td className="px-5 py-4">
                          <Badge className={TYPE_BADGE_CLASSES[offer.type]}>
                            {TYPE_LABELS[offer.type] ?? offer.type}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-ink-700">{offer.domaine}</td>
                        <td className="px-5 py-4 text-ink-700">{offer._count?.requests ?? 0}</td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleActive(offer)}
                            disabled={togglingId === offer.id}
                            className="inline-flex items-center gap-2"
                          >
                            <span
                              className={`relative h-5 w-9 rounded-full transition-smooth ${
                                offer.isActive ? "bg-forest-500" : "bg-ink-900/15"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-smooth ${
                                  offer.isActive ? "left-4" : "left-0.5"
                                }`}
                              />
                            </span>
                            <span className={offer.isActive ? "text-forest-600" : "text-ink-500"}>
                              {offer.isActive ? "Active" : "Inactive"}
                            </span>
                          </button>
                        </td>
                        <td className="px-5 py-4 text-ink-500">{formatShortDate(offer.createdAt)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/admin/offres/${offer.id}/modifier`}
                              className="rounded-lg p-2 text-ink-500 hover:bg-forest-50 hover:text-forest-600 transition-smooth"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteTarget(offer)}
                              className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600 transition-smooth"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="Supprimer cette offre ?"
          description={`"${deleteTarget?.title}" et toutes ses candidatures associées seront définitivement supprimées.`}
          confirmLabel="Supprimer"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />

        <ToastStack toasts={toast.toasts} onDismiss={toast.dismiss} />
        </AdminPageShell>
      )}
    </>
  );
}
