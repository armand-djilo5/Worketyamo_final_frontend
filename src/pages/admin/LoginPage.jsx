import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../../config/env";
import { getSession, setSession } from "../../utils/authStorage";
import { useToast } from "../../hooks/useToast";
import ToastStack from "../../components/shared/ToastStack";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Already signed in? Skip straight past the login form. Also surface a
  // toast if we just came back from a successful signup.
  useEffect(() => {
    if (getSession()?.token) {
      navigate(location.state?.from?.pathname || "/admin", { replace: true });
      return;
    }
    if (location.state?.justSignedUp) {
      toast.success("Compte administrateur créé. Vous pouvez vous connecter.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Route consumed here: POST /api/admin/login
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/admin/login`, { email, password });
      const { token, refreshToken, admin } = res.data;
      setSession({ token, refreshToken, admin });
      toast.success("Connexion réussie, bienvenue !");
      navigate(location.state?.from?.pathname || "/admin", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Identifiants invalides");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-600 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="animate-fade-in-up text-center">
          <h1 className="font-poppins text-3xl font-extrabold text-white">Worketyamo</h1>
          <p className="mt-1 text-sm font-medium text-forest-100">Administration Portal</p>
        </div>

        <div
          className="animate-fade-in-up mt-8 rounded-2xl bg-white p-7 shadow-2xl"
          style={{ animationDelay: "100ms" }}
        >
          <h2 className="text-center text-xl font-bold text-ink-900">Sign In</h2>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Email</label>
              <div className="flex items-center gap-2.5 rounded-xl border border-ink-900/10 bg-cream-50 px-3.5 py-2.5 focus-within:border-forest-400 transition-smooth">
                <Mail className="h-4 w-4 shrink-0 text-ink-300" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@worketyamo.com"
                  className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Password</label>
              <div className="flex items-center gap-2.5 rounded-xl border border-ink-900/10 bg-cream-50 px-3.5 py-2.5 focus-within:border-forest-400 transition-smooth">
                <Lock className="h-4 w-4 shrink-0 text-ink-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="shrink-0 text-ink-300 hover:text-ink-700 transition-smooth"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-forest-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-forest-900/20 transition-smooth hover:bg-forest-600 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="animate-fade-in-up mt-6 text-center text-sm text-forest-100" style={{ animationDelay: "160ms" }}>
          Premier accès ?{" "}
          <Link to="/admin/signup" className="font-semibold text-white underline-offset-2 hover:underline">
            Créer un compte administrateur
          </Link>
        </p>
        <p className="mt-2 text-center">
          <Link to="/" className="text-sm text-forest-200 hover:text-white transition-smooth">
            ← Retour au site
          </Link>
        </p>
      </div>

      <ToastStack toasts={toast.toasts} onDismiss={toast.dismiss} />
    </div>
  );
}
