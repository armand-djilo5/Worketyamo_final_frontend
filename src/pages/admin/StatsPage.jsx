import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {Users,CheckCircle2,Briefcase,Star} from "lucide-react";
import {ResponsiveContainer,AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,PieChart,Pie,Cell,Legend,} from "recharts";
import { API_BASE_URL } from "../../config/env";
import { useAuthorizedRequest } from "../../hooks/useAuthorizedRequest";
import AdminTopbar from "../../components/admin/AdminTopbar";
import StatCard from "../../components/admin/StatCard";
import Spinner from "../../components/shared/Spinner";
import { STATUS_LABELS, TYPE_LABELS } from "../../utils/labels";
import { monthLabel } from "../../utils/formatDate";

const STATUS_COLORS = {
  EN_ATTENTE: "#f0b429",
  ACCEPTEE: "#1f7a45",
  REFUSEE: "#e0645a",
};

const TYPE_COLORS = {
  STAGE: "#f0b429",
  FORMATION: "#1f7a45",
};

export default function StatsPage() {
  const { openDrawer } = useOutletContext();
  const authorizedRequest = useAuthorizedRequest();

  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Routes consumed here: GET /api/stats and GET /api/history
  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);
      try {
        const [statsRes, historyRes] = await Promise.all([
          authorizedRequest({ method: "get", url: `${API_BASE_URL}/stats` }),
          authorizedRequest({ method: "get", url: `${API_BASE_URL}/history` }),
        ]);
        if (!cancelled) {
          setStats(statsRes.data);
          setHistory(historyRes.data);
        }
      } catch {
        // handled by auto-logout on 401 in the hook
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const historyData = useMemo(
    () =>
      history.map((h) => ({
        label: `${monthLabel(h.month)} ${h.year}`,
        count: h.count,
      })),
    [history]
  );

  const statusData = useMemo(
    () =>
      (stats?.byStatus ?? []).map((s) => ({
        name: STATUS_LABELS[s.status] ?? s.status,
        value: s._count._all,
        key: s.status,
      })),
    [stats]
  );

  const typeData = useMemo(
    () =>
      (stats?.byType ?? []).map((t) => ({
        name: TYPE_LABELS[t.type] ?? t.type,
        value: t._count._all,
        key: t.type,
      })),
    [stats]
  );

  return (
    <>
      <AdminTopbar
        title="Statistiques"
        subtitle="Aperçu général et évolution des performances"
        onMenuClick={openDrawer}
      />

      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <Spinner label="Chargement des statistiques..." full />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                index={0}
                icon={Users}
                label="Total candidatures"
                value={stats?.total ?? 0}
              />
              <StatCard
                index={1}
                icon={CheckCircle2}
                label="Taux d'acceptation"
                value={`${stats?.acceptanceRate ?? 0}%`}
              />
              <StatCard
                index={2}
                icon={Briefcase}
                label="Offres actives"
                value={stats?.activeOffers ?? 0}
              />
              <StatCard
                index={3}
                icon={Star}
                label="Top offre"
                value={stats?.topOffer?.title ?? "—"}
                hint={stats?.topOffer ? `${stats.topOffer.count} candidatures` : undefined}
                accent="amber"
              />
            </div>

            <div
              className="animate-fade-in-up mt-6 rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm shadow-ink-900/3 sm:p-6"
              style={{ animationDelay: "220ms" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink-900">Évolution des candidatures</h2>
                <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-medium text-ink-500">
                  Historique complet
                </span>
              </div>
              <div className="mt-4 h-72">
                {historyData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-ink-500">
                    Pas encore assez de données pour afficher un graphique.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData} margin={{ left: -20, right: 10, top: 10 }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1f7a45" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#1f7a45" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1a10" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b6a63" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#6b6a63" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #1c1c1a10",
                          fontSize: 13,
                          fontFamily: "Poppins",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        name="Candidatures"
                        stroke="#1f7a45"
                        strokeWidth={2.5}
                        fill="url(#colorCount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <ChartCard title="Répartition par statut" delay={280}>
                <PieBlock data={statusData} colors={STATUS_COLORS} />
              </ChartCard>
              <ChartCard title="Répartition par type" delay={340}>
                <PieBlock data={typeData} colors={TYPE_COLORS} />
              </ChartCard>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function ChartCard({ title, delay, children }) {
  return (
    <div
      className="animate-fade-in-up rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm shadow-ink-900/3 sm:p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h2 className="text-base font-semibold text-ink-900">{title}</h2>
      <div className="mt-4 h-64">{children}</div>
    </div>
  );
}

function PieBlock({ data, colors }) {
  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-ink-500">
        Aucune donnée disponible.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
        >
          {data.map((entry) => (
            <Cell key={entry.key} fill={colors[entry.key] ?? "#a6a49a"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #1c1c1a10",
            fontSize: 13,
            fontFamily: "Poppins",
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: 12, fontFamily: "Poppins" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
