export const TYPE_LABELS = {
  STAGE: "Stage",
  FORMATION: "Formation",
};

export const TYPE_BADGE_CLASSES = {
  STAGE: "bg-amber-brand-200 text-amber-brand-500",
  FORMATION: "bg-forest-100 text-forest-700",
};

export const STATUS_LABELS = {
  EN_ATTENTE: "En attente",
  ACCEPTEE: "Acceptée",
  REFUSEE: "Refusée",
};

export const STATUS_BADGE_CLASSES = {
  EN_ATTENTE: "bg-amber-brand-100 text-amber-brand-500",
  ACCEPTEE: "bg-forest-100 text-forest-700",
  REFUSEE: "bg-red-100 text-red-600",
};

export function initialsFromName(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
