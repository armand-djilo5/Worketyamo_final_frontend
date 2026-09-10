import { Link } from "react-router-dom";
import { Briefcase, Clock, ArrowRight } from "lucide-react";
import Badge from "../shared/Badge";
import { TYPE_LABELS, TYPE_BADGE_CLASSES } from "../../utils/labels";
import { formatShortDate } from "../../utils/formatDate";

export default function OfferCard({ offer, index = 0 }) {
  return (
    <Link
      to={`/offres/${offer.id}`}
      state={{ offer }}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      className="animate-fade-in-up group flex flex-col rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm shadow-ink-900/3 transition-smooth hover:-translate-y-1 hover:shadow-lg hover:shadow-forest-900/10"
    >
      <div className="flex items-start justify-between gap-3">
        <Badge className={TYPE_BADGE_CLASSES[offer.type]}>
          {TYPE_LABELS[offer.type] ?? offer.type}
        </Badge>
      </div>

      <h3 className="mt-3.5 text-lg font-semibold leading-snug text-ink-900 group-hover:text-amber-brand-500 transition-smooth">
        {offer.title}
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5" />
          {offer.domaine}
        </span>
        {offer.duration && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {offer.duration}
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-500">
        {offer.description}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-ink-900/5 pt-4">
        <span className="text-xs text-ink-500">
          {offer.startDate ? `Débute le ${formatShortDate(offer.startDate)}` : "Dates flexibles"}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-brand-500">
          Voir l'offre
          <ArrowRight className="h-3.5 w-3.5 transition-smooth group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
