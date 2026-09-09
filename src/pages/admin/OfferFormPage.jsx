import { useEffect, useState } from "react";
import { useNavigate, useParams, useOutletContext, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../../config/env";
import { useAuthorizedRequest } from "../../hooks/useAuthorizedRequest";
import { useToast } from "../../context/ToastContext";
import AdminTopbar from "../../components/admin/AdminTopbar";
import Spinner from "../../components/shared/Spinner";

const emptyForm = {
    type: "STAGE",
    title: "",
    domaine: "",
    description: "",
    duration: "",
    startDate: "",
    endDate: "",
    isActive: true,
};

export default function OfferFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const { openDrawer } = useOutletContext();
    const authorizedRequest = useAuthorizedRequest();
    const toast = useToast();

    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Route consumed here: GET /api/offers/:id (admin) — only when editing
    useEffect(() => {
        if (!isEdit) return;
        let cancelled = false;

        async function fetchOffer() {
            setLoading(true);
            try {
                const res = await authorizedRequest({
                    method: "get",
                    url: `${API_BASE_URL}/offers/${id}`,
                });
                if (!cancelled) {
                    const o = res.data;
                    setForm({
                        type: o.type,
                        title: o.title,
                        domaine: o.domaine,
                        description: o.description,
                        duration: o.duration ?? "",
                        startDate: o.startDate ? o.startDate.slice(0, 10) : "",
                        endDate: o.endDate ? o.endDate.slice(0, 10) : "",
                        isActive: o.isActive,
                    });
                }
            } catch {
                if (!cancelled) setError("Impossible de charger cette offre.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchOffer();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEdit]);

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    // Routes consumed here: POST /api/offers (create) or PUT /api/offers/:id (update)
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        if (form.title.trim().length < 3) {
            setError("Le titre doit contenir au moins 3 caractères.");
            return;
        }
        if (form.description.trim().length < 10) {
            setError("La description doit contenir au moins 10 caractères.");
            return;
        }

        const payload = {
            type: form.type,
            title: form.title.trim(),
            domaine: form.domaine.trim(),
            description: form.description.trim(),
            duration: form.duration.trim() || undefined,
            startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
            endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
            isActive: form.isActive,
        };

        setSaving(true);
        try {
            if (isEdit) {
                await authorizedRequest({
                    method: "put",
                    url: `${API_BASE_URL}/offers/${id}`,
                    data: payload,
                });
                toast.success("Offre mise à jour avec succès.");
            } else {
                await authorizedRequest({
                    method: "post",
                    url: `${API_BASE_URL}/offers`,
                    data: payload,
                });
                toast.success("Offre créée avec succès.");
            }
            navigate("/admin/offres");
        } catch (err) {
            const msg = err?.response?.data?.message;
            setError(
                Array.isArray(msg)
                    ? msg.map((m) => m.message).join(" ")
                    : typeof msg === "string"
                        ? msg
                        : "Une erreur est survenue."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <AdminTopbar
                title={isEdit ? "Modifier l'offre" : "Nouvelle offre"}
                subtitle={isEdit ? "Mettez à jour les informations de l'offre" : "Publiez une opportunité de stage ou formation"}
                onMenuClick={openDrawer}
            />

            <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                <Link
                    to="/admin/offres"
                    className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-forest-600 transition-smooth"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour aux offres
                </Link>

                {loading ? (
                    <Spinner label="Chargement de l'offre..." />
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="animate-fade-in-up mt-4 max-w-2xl rounded-2xl border border-ink-900/5 bg-white p-6 shadow-sm shadow-ink-900/3 sm:p-8"
                    >
                        {error && (
                            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-ink-700">Type</label>
                                <select
                                    value={form.type}
                                    onChange={(e) => update("type", e.target.value)}
                                    className="w-full rounded-xl border border-ink-900/10 bg-cream-50 px-3.5 py-2.5 text-sm text-ink-900 focus:border-forest-400 focus:outline-none"
                                >
                                    <option value="STAGE">Stage</option>
                                    <option value="FORMATION">Formation</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-ink-700">Domaine</label>
                                <input
                                    value={form.domaine}
                                    onChange={(e) => update("domaine", e.target.value)}
                                    placeholder="Ex: Tech & IT"
                                    required
                                    className="w-full rounded-xl border border-ink-900/10 bg-cream-50 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-forest-400 focus:outline-none"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-ink-700">Titre</label>
                                <input
                                    value={form.title}
                                    onChange={(e) => update("title", e.target.value)}
                                    placeholder="Ex: Développement Web Full-Stack Avancé"
                                    required
                                    className="w-full rounded-xl border border-ink-900/10 bg-cream-50 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-forest-400 focus:outline-none"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-ink-700">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => update("description", e.target.value)}
                                    rows={5}
                                    placeholder="Décrivez la mission, les responsabilités..."
                                    required
                                    className="w-full rounded-xl border border-ink-900/10 bg-cream-50 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-forest-400 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-ink-700">Durée</label>
                                <input
                                    value={form.duration}
                                    onChange={(e) => update("duration", e.target.value)}
                                    placeholder="Ex: 6 mois"
                                    className="w-full rounded-xl border border-ink-900/10 bg-cream-50 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-forest-400 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-3 sm:pt-7">
                                <button
                                    type="button"
                                    onClick={() => update("isActive", !form.isActive)}
                                    className="inline-flex items-center gap-2"
                                >
                                    <span
                                        className={`relative h-5 w-9 rounded-full transition-smooth ${form.isActive ? "bg-forest-500" : "bg-ink-900/15"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-smooth ${form.isActive ? "left-4" : "left-0.5"
                                                }`}
                                        />
                                    </span>
                                    <span className="text-sm text-ink-700">
                                        Offre {form.isActive ? "active" : "inactive"}
                                    </span>
                                </button>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-ink-700">Date de début</label>
                                <input
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) => update("startDate", e.target.value)}
                                    className="w-full rounded-xl border border-ink-900/10 bg-cream-50 px-3.5 py-2.5 text-sm text-ink-900 focus:border-forest-400 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-ink-700">Date de fin</label>
                                <input
                                    type="date"
                                    value={form.endDate}
                                    onChange={(e) => update("endDate", e.target.value)}
                                    className="w-full rounded-xl border border-ink-900/10 bg-cream-50 px-3.5 py-2.5 text-sm text-ink-900 focus:border-forest-400 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-7 flex justify-end gap-3">
                            <Link
                                to="/admin/offres"
                                className="rounded-xl px-5 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-900/5 transition-smooth"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl bg-forest-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-smooth hover:bg-forest-600 disabled:opacity-70"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" /> {isEdit ? "Enregistrer" : "Créer l'offre"}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
