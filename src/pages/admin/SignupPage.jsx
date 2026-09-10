import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Mail, Lock, Phone, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../../config/env";

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Route consumed here: POST /api/admin/signup
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/admin/signup`, { ...form, role: "ADMIN" });
      navigate("/admin/login", { state: { justSignedUp: true } });
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(
        Array.isArray(msg)
          ? msg.map((m) => m.message).join(" ")
          : typeof msg === "string"
          ? msg
          : "Impossible de créer le compte."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-600 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="animate-fade-in-up text-center">
          <h1 className="font-poppins text-3xl font-extrabold text-white">Worketyamo</h1>
          <p className="mt-1 text-sm font-medium text-forest-100">Créer un accès administrateur</p>
        </div>

        <div className="animate-fade-in-up mt-8 rounded-2xl bg-white p-7 shadow-2xl" style={{ animationDelay: "100ms" }}>
          <h2 className="text-center text-xl font-bold text-ink-900">Sign Up</h2>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <LabeledInput
              icon={User}
              label="Nom complet"
              value={form.fullName}
              onChange={(v) => update("fullName", v)}
              placeholder="Administrateur Worketyamo"
              required
            />
            <LabeledInput
              icon={Mail}
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => update("email", v)}
              placeholder="admin@worketyamo.com"
              required
            />
            <LabeledInput
              icon={Phone}
              label="Téléphone"
              value={form.phone}
              onChange={(v) => update("phone", v)}
              placeholder="+237 6XX XXX XXX"
              required
            />
            <LabeledInput
              icon={Lock}
              label="Mot de passe"
              type="password"
              value={form.password}
              onChange={(v) => update("password", v)}
              placeholder="••••••••••••"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-forest-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-forest-900/20 transition-smooth hover:bg-forest-600 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Création...
                </>
              ) : (
                <>
                  Créer le compte <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="animate-fade-in-up mt-6 text-center text-sm text-forest-100" style={{ animationDelay: "160ms" }}>
          Déjà un compte ?{" "}
          <Link to="/admin/login" className="font-semibold text-white underline-offset-2 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

function LabeledInput({ icon: Icon, label, type = "text", value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-700">{label}</label>
      <div className="flex items-center gap-2.5 rounded-xl border border-ink-900/10 bg-cream-50 px-3.5 py-2.5 focus-within:border-forest-400 transition-smooth">
        <Icon className="h-4 w-4 shrink-0 text-ink-300" />
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none"
        />
      </div>
    </div>
  );
}
