import "./Activites.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../partials/Navbar";
import Avis from "../components/Avis";
import Faq from "../components/Faq";
import Footer from "../partials/Footer";
import BtnBleu from "../components/BtnBleu";
import type { ApiActivity } from "../context/AuthContext";
import { apiGet, apiPatch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

type HydraCollection<T> = { 'member': T[] };

const categorieColors: Record<string, string> = {
  Culture: "#7c3aed",
  Nature: "#01b285",
  Gastronomie: "#e05c00",
  Divertissement: "#02affe",
};

const getActImage = (id: number) => `https://picsum.photos/seed/act${id}/600/400`;

const formatDateTime = (dt: string) =>
  new Date(dt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

const Activites = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activites, setActivites] = useState<ApiActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Set<number>>(new Set());

  useEffect(() => {
    apiGet<HydraCollection<ApiActivity>>('/api/activities')
      .then(data => setActivites(data['member'] ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isReserved = (a: ApiActivity) =>
    user?.activity_registration?.some(ar => ar.id === a.id) ?? false;

  const handleToggle = async (a: ApiActivity) => {
    if (!user) { navigate('/connexion'); return; }
    if (pending.has(a.id)) return;

    setPending(prev => new Set(prev).add(a.id));
    try {
      const currentIds = user.activity_registration.map(ar => ar.id);
      const reserved = isReserved(a);
      const newIds = reserved
        ? currentIds.filter(id => id !== a.id)
        : [...currentIds, a.id];

      await apiPatch(`/api/attendees/${user.id}`, {
        activity_registration: newIds.map(id => `/api/activities/${id}`),
      });
      await updateUser();
    } catch {
      // ignore
    } finally {
      setPending(prev => { const s = new Set(prev); s.delete(a.id); return s; });
    }
  };

  return (
    <>
      <Navbar />

      <header className="activites-header">
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Accueil</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Nos activités</span>
        </div>
        <h1 className="activites-header-titre">Nos activités</h1>
        <p className="activites-header-sous">Profitez de votre séjour à Limoges pour découvrir la richesse culturelle et gastronomique de la région. Des expériences soigneusement sélectionnées pour les congressistes.</p>
      </header>

      <section className="activites-grid">
        {loading ? (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', padding: '40px' }}>Chargement des activités…</p>
        ) : activites.map(a => {
          const reserved = isReserved(a);
          const inPending = pending.has(a.id);

          return (
            <div key={a.id} className="activite-card">
              <div className="activite-card-img-wrapper">
                <img src={getActImage(a.id)} alt={a.label} className="activite-card-img" />
                <span className="activite-card-categorie" style={{ backgroundColor: categorieColors[a.category ?? ""] ?? "#333" }}>
                  {a.category ?? "—"}
                </span>
              </div>
              <div className="activite-card-body">
                <h3 className="activite-card-nom">{a.label}</h3>
                {a.description && <p className="activite-card-desc">{a.description}</p>}
                <div className="activite-card-meta">
                  {a.duration && (
                    <span className="activite-meta-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {a.duration}
                    </span>
                  )}
                  <span className="activite-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {formatDateTime(a.date_time)}
                  </span>
                </div>
                <div className="activite-card-footer">
                  <p className="activite-card-prix">À partir de <strong>{a.price} €</strong></p>
                  {reserved ? (
                    <div className="act-reserved-row">
                      <button className="btn-reserved">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Réservé
                      </button>
                      <button className="btn-annuler" disabled={inPending} onClick={() => handleToggle(a)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        {inPending ? "…" : "Annuler"}
                      </button>
                    </div>
                  ) : (
                    <BtnBleu
                      text={inPending ? "…" : "Réserver"}
                      lien="#"
                      onClick={() => handleToggle(a)}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <Avis />
      <Faq />
      <Footer />
    </>
  );
};

export default Activites;
