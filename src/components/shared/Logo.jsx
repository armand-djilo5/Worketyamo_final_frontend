import { Link } from "react-router-dom";

export default function Logo({ to = "/", subtitle, light = false }) {
  const content = (
    <div className="select-none">
      <span
        className={`font-poppins text-xl font-extrabold tracking-tight ${
          light ? "text-white" : "text-forest-600"
        }`}
      >
        <b className="text-blue-600">Worket</b> <b className="text-orange-600">Yamo</b>
      </span>
      {subtitle && (
        <p
          className={`-mt-0.5 text-[11px] font-medium tracking-wide ${
            light ? "text-forest-100" : "text-ink-500"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );

  if (!to) return content;
  return (
    <Link to={to} className="inline-block transition-smooth hover:opacity-90">
      {content}
    </Link>
  );
}
