import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";
import {ArrowLeft,Briefcase,Clock,CalendarDays,Info,ServerCrash,} from "lucide-react";
import { API_BASE_URL } from "../../config/env";
import Badge from "../../components/shared/Badge";
import Spinner from "../../components/shared/Spinner";
import EmptyState from "../../components/shared/EmptyState";
import { TYPE_LABELS, TYPE_BADGE_CLASSES } from "../../utils/labels";
import { formatLongDate } from "../../utils/formatDate";

export default function OfferDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const preloaded = location.state?.offer;

  const [offer, setOffer] = useState(preloaded ?? null);
  const [loading, setLoading] = useState(!preloaded);
  const [error, setError] = useState(null);

  // The backend's GET /api/offers/:id route requires an admin token, so a
  // public visitor can't call it directly. We stay within the public part
  // of the API by reusing GET /api/offers (which already returns full offer
  // objects) and picking out the matching one — this only runs when the
  // offer wasn't already passed along from the catalog page.
  useEffect(() => {
    if (preloaded) return;
    let cancelled = false;

    async function fetchOffer() {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/offers`);
        const found = response.data.find((o) => o.id === id);
        if (!cancelled) {
          if (found) setOffer(found);
          else setError("not-found");
        }
      } catch {
        if (!cancelled) setError("server");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOffer();
    return () => {
      cancelled = true;
    };
  }, [id, preloaded]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Spinner label="Chargement de l'offre..." full />
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={error === "server" ? ServerCrash : Info}
          title={error === "server" ? "Une erreur est survenue" : "Offre introuvable"}
          description={
            error === "server"
              ? "Impossible de charger cette offre pour le moment."
              : "Cette offre n'existe plus ou a été retirée."
          }
          action={
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg bg-forest-500 px-4 py-2 text-sm font-semibold text-white transition-smooth hover:bg-forest-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au catalogue
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="animate-fade-in flex items-center justify-between text-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-ink-500 transition-smooth hover:text-forest-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au catalogue
        </Link>
      </div>

      <div className="animate-fade-in-up mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold leading-tight text-ink-900 sm:text-3xl">
            {offer.title}
          </h1>
          <div className="mt-3">
            <Badge className={TYPE_BADGE_CLASSES[offer.type]}>
              {TYPE_LABELS[offer.type] ?? offer.type}
            </Badge>
          </div>
        </div>
        <Link
          to={`/offres/${offer.id}/postuler`}
          state={{ offer }}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-forest-500 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-forest-900/20 transition-smooth hover:bg-forest-600 hover:shadow-md"
        >
          Postuler à cette offre
          <ArrowLeft className="h-4 w-4 rotate-180" />
        </Link>
      </div>

      <div
        className="animate-fade-in-up mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
        style={{ animationDelay: "80ms" }}
      >
        <InfoTile icon={Briefcase} label="Domaine" value={offer.domaine} />
        <InfoTile icon={Clock} label="Durée" value={offer.duration || "Non précisée"} />
        <InfoTile
          icon={CalendarDays}
          label="Début"
          value={offer.startDate ? formatLongDate(offer.startDate) : "Flexible"}
        />
      </div>

      <div
        className="animate-fade-in-up mt-6 rounded-2xl border border-ink-900/5 bg-white p-6 shadow-sm shadow-ink-900/3 sm:p-8"
        style={{ animationDelay: "140ms" }}
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-900">
          <Info className="h-5 w-5 text-forest-500" />
          À propos de l'offre
        </h2>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-700">
          {offer.description}
        </p>
      </div>

      <div
        className="animate-fade-in-up mt-8 flex flex-col items-center gap-3 rounded-2xl bg-forest-600 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left"
        style={{ animationDelay: "200ms" }}
      >
        <div>
          <h3 className="text-lg font-semibold text-white">Intéressé(e) par cette offre ?</h3>
          <p className="mt-1 text-sm text-forest-100">
            Envoyez votre candidature en quelques minutes.
          </p>
        </div>
        <Link
          to={`/offres/${offer.id}/postuler`}
          state={{ offer }}
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-forest-700 transition-smooth hover:bg-cream-100"
        >
          Postuler maintenant
        </Link>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-900/5 bg-white p-4 shadow-sm shadow-ink-900/3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-forest-500">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-500">{label}</p>
        <p className="truncate text-sm font-semibold text-ink-900">{value}</p>
      </div>
    </div>
  );
}
