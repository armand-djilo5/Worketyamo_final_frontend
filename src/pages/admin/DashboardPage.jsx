import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {Users,Clock,CheckCircle2,Briefcase,Plus,Eye,Settings,UserPlus,} from "lucide-react";
import { API_BASE_URL } from "../../config/env";
import { useAuthorizedRequest } from "../../hooks/useAuthorizedRequest";
import { useRequireAdminAuth } from "../../hooks/useRequireAdminAuth";
import AdminPageShell from "../../components/admin/AdminPageShell";
import StatCard from "../../components/admin/StatCard";
import Spinner from "../../components/shared/Spinner";
import Badge from "../../components/shared/Badge";
import { initialsFromName, STATUS_LABELS, STATUS_BADGE_CLASSES } from "../../utils/labels";
import { formatShortDate } from "../../utils/formatDate";

export default function DashboardPage() {
  const { admin, ready } = useRequireAdminAuth();
  const authorizedRequest = useAuthorizedRequest();

  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Routes consumed here: GET /api/stats and GET /api/requests
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      try {
        const [statsRes, requestsRes] = await Promise.all([
          authorizedRequest({ method: "get", url: `${API_BASE_URL}/stats` }),
          authorizedRequest({
            method: "get",
            url: `${API_BASE_URL}/requests`,
            params: { page: 1, limit: 5 },
          }),
        ]);
        if (!cancelled) {
          setStats(statsRes.data);
          setRecentRequests(requestsRes.data.data ?? []);
        }
      } catch {
        // 401s are handled by useAuthorizedRequest (auto-logout + redirect)
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const byStatus = (status) =>
    stats?.byStatus?.find((s) => s.status === status)?._count?._all ?? 0;

  if (!ready) return <Spinner label="Vérification de la session..." full />;

  return (
    <AdminPageShell title={`Bonjour, ${admin?.fullName || "Administrateur"}`} admin={admin}>
      {loading ? (
        <Spinner label="Chargement du tableau de bord..." full />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard index={0} icon={Users} label="Total candidatures" value={stats?.total ?? 0} />
            <StatCard
              index={1}
              icon={Clock}
              label="En attente"
              value={byStatus("EN_ATTENTE")}
              accent="amber"
            />
            <StatCard index={2} icon={CheckCircle2} label="Acceptées" value={byStatus("ACCEPTEE")} />
            <StatCard index={3} icon={Briefcase} label="Offres actives" value={stats?.activeOffers ?? 0} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div
              className="animate-fade-in-up rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm shadow-ink-900/3 lg:col-span-2"
              style={{ animationDelay: "220ms" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink-900">Candidatures récentes</h2>
                <Link
                  to="/admin/candidatures"
                  className="text-sm font-semibold text-forest-600 hover:text-forest-700 transition-smooth"
                >
                  Voir tout
                </Link>
              </div>

              {recentRequests.length === 0 ? (
                <p className="mt-8 text-center text-sm text-ink-500">
                  Aucune candidature pour le moment.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-140 text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wide text-ink-300">
                        <th className="pb-2 font-medium">Candidat</th>
                        <th className="pb-2 font-medium">Poste</th>
                        <th className="pb-2 font-medium">Statut</th>
                        <th className="pb-2 font-medium">Date</th>
                        <th className="pb-2 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRequests.map((r) => (
                        <tr key={r.id} className="border-t border-ink-900/5">
                          <td className="py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-600 text-xs font-semibold text-white">
                                {initialsFromName(r.fullName)}
                              </div>
                              <span className="font-medium text-ink-900">{r.fullName}</span>
                            </div>
                          </td>
                          <td className="py-3 text-ink-700">{r.offer?.title ?? "—"}</td>
                          <td className="py-3">
                            <Badge className={STATUS_BADGE_CLASSES[r.status]}>
                              {STATUS_LABELS[r.status]}
                            </Badge>
                          </td>
                          <td className="py-3 text-ink-500">{formatShortDate(r.createdAt)}</td>
                          <td className="py-3 text-right">
                            <Link
                              to="/admin/candidatures"
                              state={{ selectedId: r.id }}
                              className="inline-flex text-ink-500 hover:text-forest-600 transition-smooth"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div
                className="animate-fade-in-up rounded-2xl bg-forest-600 p-6 text-white shadow-sm"
                style={{ animationDelay: "280ms" }}
              >
                <h3 className="text-lg font-semibold">Nouvelle Offre</h3>
                <p className="mt-1.5 text-sm text-forest-100">
                  Publiez une nouvelle opportunité pour attirer des talents.
                </p>
                <Link
                  to="/admin/offres/nouvelle"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-forest-700 transition-smooth hover:bg-cream-100"
                >
                  <Plus className="h-4 w-4" />
                  Créer une offre
                </Link>
              </div>

              <div
                className="animate-fade-in-up rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm shadow-ink-900/3"
                style={{ animationDelay: "340ms" }}
              >
                <h3 className="text-sm font-semibold text-ink-900">Raccourcis</h3>
                <div className="mt-3 flex flex-col gap-3">
                  <Link
                    to="/admin/statistiques"
                    className="flex items-center gap-2.5 text-sm text-ink-700 hover:text-forest-600 transition-smooth"
                  >
                    <Settings className="h-4 w-4 text-ink-300" />
                    Voir les statistiques
                  </Link>
                  <Link
                    to="/admin/offres"
                    className="flex items-center gap-2.5 text-sm text-ink-700 hover:text-forest-600 transition-smooth"
                  >
                    <UserPlus className="h-4 w-4 text-ink-300" />
                    Gérer les offres
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminPageShell>
  );
}
