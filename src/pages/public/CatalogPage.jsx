import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, SearchX, ServerCrash } from "lucide-react";
import { API_BASE_URL } from "../../config/env";
import OfferCard from "../../components/public/OfferCard";
import Spinner from "../../components/shared/Spinner";
import EmptyState from "../../components/shared/EmptyState";

const PAGE_SIZE = 6;

export default function CatalogPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Route consumed here: GET /api/offers
  useEffect(() => {
  let cancelled = false;

  async function fetchOffers() {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/offers`);
      const payload = Array.isArray(response.data)
        ? response.data
        : response.data?.offers ?? response.data?.data ?? [];

      if (!cancelled) setOffers(payload);
    } catch (err) {
      if (cancelled) return;
      if (err?.response?.status === 404) {
        setOffers([]);
      } else {
        setError("Impossible de charger les offres pour le moment.");
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  fetchOffers();
  return () => {
    cancelled = true;
  };
}, []);

  const domaines = useMemo(() => {
    const set = new Set(offers.map((o) => o.domaine).filter(Boolean));
    return ["Tous", ...Array.from(set)];
  }, [offers]);

  const [domaineFilter, setDomaineFilter] = useState("Tous");

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesSearch =
        !search ||
        offer.title.toLowerCase().includes(search.toLowerCase()) ||
        offer.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "Tous" || offer.type === typeFilter;
      const matchesDomaine = domaineFilter === "Tous" || offer.domaine === domaineFilter;
      return matchesSearch && matchesType && matchesDomaine;
    });
  }, [offers, search, typeFilter, domaineFilter]);

  const visibleOffers = filteredOffers.slice(0, visibleCount);
  const hasMore = visibleCount < filteredOffers.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="animate-fade-in-up max-w-2xl">
        <h1 className="text-3xl font-extrabold leading-tight text-ink-900 sm:text-4xl">
          Trouvez le stage ou la formation qui vous correspond
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">
          Découvrez des opportunités de croissance professionnelle adaptées à
          votre profil et à vos ambitions. Explorez notre catalogue.
        </p>
      </div>

      <div
        className="animate-fade-in-up mt-8 flex flex-col gap-3 rounded-2xl border border-ink-900/5 bg-white p-3 shadow-sm shadow-ink-900/3 sm:flex-row sm:items-center"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-cream-200 px-3.5 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-ink-300" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Rechercher une offre..."
            className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-sm font-medium text-ink-700 focus:border-forest-400 focus:outline-none"
          >
            <option value="Tous">Type (Tous)</option>
            <option value="STAGE">Stage</option>
            <option value="FORMATION">Formation</option>
          </select>
          <select
            value={domaineFilter}
            onChange={(e) => {
              setDomaineFilter(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-sm font-medium text-ink-700 focus:border-forest-400 focus:outline-none"
          >
            {domaines.map((d) => (
              <option key={d} value={d}>
                {d === "Tous" ? "Domaine (Tous)" : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8">
        {loading && <Spinner label="Chargement des offres..." />}

        {!loading && error && (
          <EmptyState
            icon={ServerCrash}
            title="Une erreur est survenue"
            description={error}
          />
        )}

        {!loading && !error && filteredOffers.length === 0 && (
          <EmptyState
            icon={SearchX}
            title="Aucune offre ne correspond"
            description="Essayez d'ajuster vos filtres ou votre recherche."
          />
        )}

        {!loading && !error && filteredOffers.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleOffers.map((offer, i) => (
                <OfferCard key={offer.id} offer={offer} index={i} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                  className="rounded-full border border-ink-900/10 bg-white px-6 py-2.5 text-sm font-semibold text-ink-700 shadow-sm transition-smooth hover:border-forest-300 hover:text-forest-600"
                >
                  Charger plus d'offres
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
