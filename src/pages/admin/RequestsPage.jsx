import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {Eye,Mail,Phone,FileText,Trash2,Check,X as XIcon, ChevronLeft,ChevronRight,MessageCircle, FileWarning,} from "lucide-react";
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
import {
  STATUS_LABELS,
  STATUS_BADGE_CLASSES,
  TYPE_LABELS,
  initialsFromName,
} from "../../utils/labels";
import { formatLongDate } from "../../utils/formatDate";

const PAGE_LIMIT = 8;

export default function RequestsPage() {
  const { admin, ready } = useRequireAdminAuth();
  const location = useLocation();
  const authorizedRequest = useAuthorizedRequest();
  const toast = useToast();

  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState(location.state?.selectedId ?? null);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Route consumed here: GET /api/requests
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    async function fetchRequests() {
      setLoading(true);
      try {
        const res = await authorizedRequest({
          method: "get",
          url: `${API_BASE_URL}/requests`,
          params: {
            page,
            limit: PAGE_LIMIT,
            ...(statusFilter && { status: statusFilter }),
            ...(typeFilter && { type: typeFilter }),
          },
        });
        if (!cancelled) {
          setRequests(res.data.data ?? []);
          setPagination(res.data.pagination ?? { total: 0, page: 1, totalPages: 1 });
          if (!selectedId && res.data.data?.length > 0) {
            setSelectedId(res.data.data[0].id);
          }
        }
      } catch {
        if (!cancelled) {
          setRequests([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRequests();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, page, statusFilter, typeFilter]);

  // Route consumed here: GET /api/requests/:id
  useEffect(() => {
    if (!ready || !selectedId) return;
    let cancelled = false;

    async function fetchDetail() {
      setDetailLoading(true);
      try {
        const res = await authorizedRequest({
          method: "get",
          url: `${API_BASE_URL}/requests/${selectedId}`,
        });
        if (!cancelled) setSelected(res.data);
      } catch {
        if (!cancelled) setSelected(null);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    }

    fetchDetail();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, selectedId]);

  // Route consumed here: PUT /api/requests/:id
  async function handleStatusChange(status) {
    if (!selected) return;
    setUpdatingStatus(true);
    try {
      const res = await authorizedRequest({
        method: "put",
        url: `${API_BASE_URL}/requests/${selected.id}`,
        data: { status },
      });
      setSelected(res.data);
      setRequests((prev) =>
        prev.map((r) => (r.id === selected.id ? { ...r, status } : r))
      );
      toast.success(
        status === "ACCEPTEE"
          ? "Candidature acceptée."
          : status === "REFUSEE"
          ? "Candidature refusée."
          : "Statut mis à jour."
      );
    } catch {
      toast.error("Impossible de mettre à jour le statut.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  // Route consumed here: DELETE /api/requests/:id
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await authorizedRequest({
        method: "delete",
        url: `${API_BASE_URL}/requests/${deleteTarget.id}`,
      });
      setRequests((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      if (selectedId === deleteTarget.id) {
        setSelectedId(null);
        setSelected(null);
      }
      toast.success("Candidature supprimée.");
      setDeleteTarget(null);
    } catch {
      toast.error("Impossible de supprimer cette candidature.");
    } finally {
      setDeleting(false);
    }
  }

  if (!ready) return <Spinner label="Vérification de la session..." full />;

  return (
    <AdminPageShell title="Candidatures" admin={admin}>
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-ink-900/10 bg-white px-3.5 py-2.5 text-sm font-medium text-ink-700 focus:border-forest-400 focus:outline-none"
          >
            <option value="">Statut (Tous)</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="ACCEPTEE">Acceptée</option>
            <option value="REFUSEE">Refusée</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-ink-900/10 bg-white px-3.5 py-2.5 text-sm font-medium text-ink-700 focus:border-forest-400 focus:outline-none"
          >
            <option value="">Type (Tous)</option>
            <option value="STAGE">Stage</option>
            <option value="FORMATION">Formation</option>
          </select>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {loading ? (
              <Spinner label="Chargement des candidatures..." />
            ) : requests.length === 0 ? (
              <EmptyState
                icon={FileWarning}
                title="Aucune candidature"
                description="Aucune candidature ne correspond à ces filtres."
              />
            ) : (
              <div className="animate-fade-in-up overflow-hidden rounded-2xl border border-ink-900/5 bg-white shadow-sm shadow-ink-900/3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-ink-900/5 text-xs uppercase tracking-wide text-ink-300">
                        <th className="px-4 py-3 font-medium">Candidat</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Statut</th>
                        <th className="px-4 py-3 font-medium text-right">Voir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((r) => (
                        <tr
                          key={r.id}
                          onClick={() => setSelectedId(r.id)}
                          className={`cursor-pointer border-b border-ink-900/5 last:border-0 transition-smooth ${
                            selectedId === r.id ? "bg-forest-50/70" : "hover:bg-cream-50/60"
                          }`}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                                {initialsFromName(r.fullName)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-ink-900">{r.fullName}</p>
                                <p className="truncate text-xs text-ink-500">{r.offer?.title}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-ink-700">{TYPE_LABELS[r.type] ?? r.type}</td>
                          <td className="px-4 py-3.5">
                            <Badge className={STATUS_BADGE_CLASSES[r.status]}>
                              {STATUS_LABELS[r.status]}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Eye className="ml-auto h-4 w-4 text-ink-300" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-ink-900/5 px-4 py-3.5">
                  <p className="text-xs text-ink-500">
                    Affichage {(page - 1) * PAGE_LIMIT + 1} à{" "}
                    {Math.min(page * PAGE_LIMIT, pagination.total)} sur {pagination.total}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="rounded-lg border border-ink-900/10 p-1.5 text-ink-500 disabled:opacity-40 hover:bg-ink-900/5 transition-smooth"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-2 text-sm font-medium text-ink-900">
                      {page} / {pagination.totalPages || 1}
                    </span>
                    <button
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-lg border border-ink-900/10 p-1.5 text-ink-500 disabled:opacity-40 hover:bg-ink-900/5 transition-smooth"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {detailLoading ? (
              <div className="rounded-2xl border border-ink-900/5 bg-white shadow-sm shadow-ink-900/3">
                <Spinner label="Chargement..." />
              </div>
            ) : !selected ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-ink-900/10 bg-white/60 p-8 text-center text-sm text-ink-500">
                Sélectionnez une candidature pour voir les détails.
              </div>
            ) : (
              <div className="animate-fade-in-up sticky top-24 rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm shadow-ink-900/3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    {initialsFromName(selected.fullName)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-900">{selected.fullName}</p>
                    <Badge className={STATUS_BADGE_CLASSES[selected.status]}>
                      {STATUS_LABELS[selected.status]}
                    </Badge>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-cream-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">
                    Détails de l'offre
                  </p>
                  <p className="mt-1.5 text-sm text-ink-900">
                    Poste : <span className="font-medium">{selected.offer?.title}</span>
                  </p>
                  <p className="text-sm text-ink-900">
                    Type : <span className="font-medium">{TYPE_LABELS[selected.type] ?? selected.type}</span>
                  </p>
                  <p className="text-sm text-ink-900">
                    Candidature : <span className="font-medium">{formatLongDate(selected.createdAt)}</span>
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">Contact</p>
                  <div className="mt-2 flex flex-col gap-1.5">
                    <a
                      href={`mailto:${selected.email}`}
                      className="inline-flex items-center gap-2 text-sm text-amber-brand-500 hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {selected.email}
                    </a>
                    <a
                      href={`tel:${selected.phone}`}
                      className="inline-flex items-center gap-2 text-sm text-amber-brand-500 hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {selected.phone}
                    </a>
                    {selected.whatsappLink && (
                      <a
                        href={selected.whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-amber-brand-500 hover:underline"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Contacter sur WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">Message</p>
                  <p className="mt-1.5 whitespace-pre-line rounded-xl bg-cream-50 p-3 text-sm leading-relaxed text-ink-700">
                    {selected.message}
                  </p>
                </div>

                {selected.cvUrl && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">Document</p>
                    <a
                      href={selected.cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 flex items-center gap-2.5 rounded-xl border border-ink-900/10 px-3.5 py-2.5 text-sm text-ink-700 hover:border-amber-brand-300 hover:text-amber-brand-500 transition-smooth"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      Voir le CV
                    </a>
                  </div>
                )}

                <div className="mt-6 flex items-center gap-2 border-t border-ink-900/5 pt-4">
                  <button
                    onClick={() => handleStatusChange("REFUSEE")}
                    disabled={updatingStatus || selected.status === "REFUSEE"}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition-smooth hover:bg-red-50 disabled:opacity-40"
                  >
                    <XIcon className="h-4 w-4" />
                    Refuser
                  </button>
                  <button
                    onClick={() => handleStatusChange("ACCEPTEE")}
                    disabled={updatingStatus || selected.status === "ACCEPTEE"}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-brand-500 px-3 py-2.5 text-sm font-semibold text-white transition-smooth hover:bg-amber-brand-400 disabled:opacity-40"
                  >
                    <Check className="h-4 w-4" />
                    Accepter
                  </button>
                  <button
                    onClick={() => setDeleteTarget(selected)}
                    className="rounded-xl p-2.5 text-ink-400 hover:bg-red-50 hover:text-red-600 transition-smooth"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer cette candidature ?"
        description={`La candidature de "${deleteTarget?.fullName}" sera définitivement supprimée.`}
        confirmLabel="Supprimer"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastStack toasts={toast.toasts} onDismiss={toast.dismiss} />
    </AdminPageShell>
  );
}
