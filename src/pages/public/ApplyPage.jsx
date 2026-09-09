import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { X, FileText, Trash2, Send, CheckCircle2, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../../config/env";
import Badge from "../../components/shared/Badge";
import { TYPE_LABELS, TYPE_BADGE_CLASSES } from "../../utils/labels";
import { useToast } from "../../context/ToastContext";

const CMR_PHONE_REGEX = /^6[0-9]{8}$/;
const ALLOWED_CV_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function ApplyPage() {
    const { id } = useParams();
    const location = useLocation();
    const toast = useToast();

    const preloaded = location.state?.offer;
    const [offer, setOffer] = useState(preloaded ?? null);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [cv, setCv] = useState(null);

    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [serverError, setServerError] = useState(null);

    // Fallback: if the offer wasn't handed over from the detail page (e.g. a
    // direct link), fetch it from the public GET /api/offers list.
    useEffect(() => {
        if (preloaded) return;
        let cancelled = false;
        axios
            .get(`${API_BASE_URL}/offers`)
            .then((res) => {
                if (cancelled) return;
                const found = res.data.find((o) => o.id === id);
                if (found) setOffer(found);
            })
            .catch(() => { });
        return () => {
            cancelled = true;
        };
    }, [id, preloaded]);

    function validate() {
        const errors = {};
        if (!fullName.trim() || fullName.trim().length < 3) {
            errors.fullName = "Le nom complet doit contenir au moins 3 caractères.";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Format d'e-mail invalide.";
        }
        if (!CMR_PHONE_REGEX.test(phone)) {
            errors.phone = "Numéro camerounais invalide, ex : 6XX XXX XXX.";
        }
        if (!message.trim()) {
            errors.message = "Ce champ est requis.";
        }
        if (cv && !ALLOWED_CV_TYPES.includes(cv.type)) {
            errors.cv = "Formats acceptés : PDF, DOC, DOCX.";
        }
        if (cv && cv.size > 5 * 1024 * 1024) {
            errors.cv = "Le fichier ne doit pas dépasser 5 Mo.";
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }

    // Route consumed here: POST /api/requests (multipart/form-data)
    async function handleSubmit(e) {
        e.preventDefault();
        setServerError(null);
        if (!validate()) return;

        const formData = new FormData();
        formData.append("offerId", id);
        formData.append("fullName", fullName.trim());
        formData.append("email", email.trim());
        formData.append("phone", phone.trim());
        formData.append("message", message.trim());
        if (cv) formData.append("cv", cv);

        setSubmitting(true);
        try {
            await axios.post(`${API_BASE_URL}/requests`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setSubmitted(true);
            toast.success("Votre candidature a bien été envoyée !");
        } catch (err) {
            const message =
                err?.response?.data?.message && typeof err.response.data.message === "string"
                    ? err.response.data.message
                    : "Une erreur est survenue lors de l'envoi. Veuillez réessayer.";
            setServerError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    if (submitted) {
        return (
            <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
                <div className="animate-scale-in flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-600">
                    <CheckCircle2 className="h-9 w-9" />
                </div>
                <h1 className="animate-fade-in-up mt-6 text-2xl font-bold text-ink-900">
                    Candidature envoyée !
                </h1>
                <p className="animate-fade-in-up mt-2 text-sm leading-relaxed text-ink-500">
                    Votre candidature a bien été envoyée. Nous reviendrons vers vous
                    rapidement.
                </p>
                <Link
                    to="/"
                    className="animate-fade-in-up mt-8 inline-flex items-center justify-center rounded-xl bg-forest-500 px-6 py-3 text-sm font-semibold text-white transition-smooth hover:bg-forest-600"
                >
                    Retour au catalogue
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <header className="border-b border-ink-900/5 bg-cream-100">
                <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
                    <span className="font-poppins text-lg font-extrabold text-forest-600">
                        Worketyamo
                    </span>
                    <Link
                        to={offer ? `/offres/${id}` : "/"}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-smooth hover:text-ink-900"
                    >
                        <X className="h-4 w-4" />
                        Annuler
                    </Link>
                </div>
            </header>

            <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-2xl px-4 py-8 sm:px-6"
            >
                <div className="animate-fade-in-up rounded-2xl border border-ink-900/5 bg-white p-6 shadow-sm shadow-ink-900/3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">
                        Candidature pour le poste de
                    </p>
                    <div className="mt-1.5 flex items-start justify-between gap-3">
                        <h1 className="text-xl font-bold leading-snug text-ink-900">
                            {offer?.title ?? "Chargement..."}
                        </h1>
                        {offer && (
                            <Badge className={TYPE_BADGE_CLASSES[offer.type]}>
                                {TYPE_LABELS[offer.type] ?? offer.type}
                            </Badge>
                        )}
                    </div>
                </div>

                <Section title="Vos coordonnées">
                    <Field label="Nom complet" required error={fieldErrors.fullName}>
                        <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Ex: Jean Dupont"
                            className={inputClass(fieldErrors.fullName)}
                        />
                    </Field>

                    <Field label="Adresse e-mail" required error={fieldErrors.email}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="jean.dupont@exemple.com"
                            className={inputClass(fieldErrors.email)}
                        />
                    </Field>

                    <Field label="Numéro de téléphone" required error={fieldErrors.phone}>
                        <div
                            className={`flex overflow-hidden rounded-xl border bg-cream-50 focus-within:border-forest-400 ${fieldErrors.phone ? "border-red-300" : "border-ink-900/10"
                                }`}
                        >
                            <span className="flex items-center bg-cream-200 px-3.5 text-sm font-medium text-ink-500">
                                +237
                            </span>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                                placeholder="6XX XXX XXX"
                                maxLength={9}
                                className="w-full bg-transparent px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none"
                            />
                        </div>
                        <p className="mt-1.5 text-xs text-ink-300">
                            Numéro camerounais, ex : 6XX XXX XXX
                        </p>
                    </Field>
                </Section>

                <Section title="Votre message">
                    <Field label="Lettre de motivation / Message" required error={fieldErrors.message}>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            placeholder="Parlez-nous de vous, de vos motivations pour ce poste..."
                            className={inputClass(fieldErrors.message)}
                        />
                    </Field>
                </Section>

                <Section title="Pièces jointes">
                    <Field label="CV (Curriculum Vitae)" hint="Optionnel — PDF, DOC ou DOCX, 5 Mo max" error={fieldErrors.cv}>
                        {!cv ? (
                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-900/10 bg-cream-50 px-4 py-8 text-center transition-smooth hover:border-forest-300">
                                <FileText className="h-6 w-6 text-ink-300" />
                                <span className="mt-2 text-sm font-medium text-ink-700">
                                    Cliquez pour choisir un fichier
                                </span>
                                <span className="mt-0.5 text-xs text-ink-300">PDF, DOC, DOCX — 5 Mo max</span>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={(e) => setCv(e.target.files?.[0] ?? null)}
                                />
                            </label>
                        ) : (
                            <div className="flex items-center justify-between rounded-xl border border-forest-200 bg-forest-50 px-4 py-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <FileText className="h-5 w-5 shrink-0 text-forest-600" />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-ink-900">{cv.name}</p>
                                        <p className="text-xs text-ink-500">
                                            {(cv.size / (1024 * 1024)).toFixed(1)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCv(null)}
                                    className="shrink-0 text-ink-300 hover:text-red-500 transition-smooth"
                                >
                                    <Trash2 className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        )}
                    </Field>
                </Section>

                {serverError && (
                    <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {serverError}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-500 px-5 py-3.5 text-sm font-semibold text-white shadow-sm shadow-forest-900/20 transition-smooth hover:bg-forest-600 disabled:opacity-70"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Envoi en cours...
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4" />
                            Envoyer ma candidature
                        </>
                    )}
                </button>
                <p className="mt-3 text-center text-xs text-ink-300">
                    En soumettant cette candidature, vous acceptez notre politique de
                    confidentialité.
                </p>
            </form>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="animate-fade-in-up mt-5 rounded-2xl border border-ink-900/5 bg-white p-6 shadow-sm shadow-ink-900/3">
            <h2 className="border-b border-ink-900/5 pb-3 text-base font-semibold text-ink-900">
                {title}
            </h2>
            <div className="mt-4 flex flex-col gap-4">{children}</div>
        </div>
    );
}

function Field({ label, required, hint, error, children }) {
    return (
        <div>
            <div className="mb-1.5 flex items-baseline justify-between">
                <label className="text-sm font-medium text-ink-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                {hint && !error && <span className="text-xs text-ink-300">{hint}</span>}
            </div>
            {children}
            {error && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}

function inputClass(hasError) {
    return `w-full rounded-xl border bg-cream-50 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-forest-400 transition-smooth ${hasError ? "border-red-300" : "border-ink-900/10"
        }`;
}
