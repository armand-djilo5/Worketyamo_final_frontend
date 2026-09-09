export default function StatCard({ icon: Icon, label, value, hint, accent = "forest", index = 0 }) {
  const accentClasses = {
    forest: "bg-forest-50 text-forest-600",
    amber: "bg-amber-brand-100 text-amber-brand-500",
  };

  return (
    <div
      style={{ animationDelay: `${index * 60}ms` }}
      className="animate-fade-in-up rounded-2xl border border-ink-900/5 bg-white p-5 shadow-sm shadow-ink-900/3 transition-smooth hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          {label}
        </p>
        {Icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accentClasses[accent]}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
      </div>
      <p className="mt-3 text-3xl font-extrabold text-ink-900">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}
