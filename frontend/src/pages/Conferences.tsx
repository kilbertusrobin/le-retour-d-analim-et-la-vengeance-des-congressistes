import "./Conferences.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../partials/Navbar";
import Faq from "../components/Faq";
import Footer from "../partials/Footer";
import BtnVert from "../components/BtnVert";
import BtnBleu from "../components/BtnBleu";
import type { ApiSession } from "../context/AuthContext";
import { apiGet, apiPatch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

type HydraCollection<T> = { 'member': T[] };

const getConfImage = (id: number) => `https://picsum.photos/seed/conf${id}/600/400`;

const formatTime = (dt: string) => {
  const d = new Date(dt);
  const heure = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  return `${dateStr} · ${heure}`;
};

const Conferences = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Set<number>>(new Set());

  useEffect(() => {
    apiGet<HydraCollection<ApiSession>>('/api/sessions')
      .then(data => setSessions(data['member'] ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isReserved = (s: ApiSession) =>
    user?.session_registration?.some(sr => sr.id === s.id) ?? false;

  const handleToggle = async (s: ApiSession) => {
    if (!user) { navigate('/connexion'); return; }
    if (pending.has(s.id)) return;

    setPending(prev => new Set(prev).add(s.id));
    try {
      const currentIds = user.session_registration.map(sr => sr.id);
      const reserved = isReserved(s);
      const newIds = reserved
        ? currentIds.filter(id => id !== s.id)
        : [...currentIds, s.id];

      await apiPatch(`/api/attendees/${user.id}`, {
        session_registration: newIds.map(id => `/api/sessions/${id}`),
      });
      await updateUser();
    } catch {
      // ignore
    } finally {
      setPending(prev => { const s2 = new Set(prev); s2.delete(s.id); return s2; });
    }
  };

  return (
    <>
      <Navbar />

      <header className="conf-header">
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Accueil</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Les conférences</span>
        </div>
        <h1 className="conf-header-titre">Nos conférences</h1>
        <p className="conf-header-sous">Retrouvez l'ensemble des sessions scientifiques du congrès. Réservez votre place avant qu'il ne soit trop tard.</p>
        <BtnVert text="+33 6 12 34 56 78" lien="tel:+33612345678" />
      </header>

      <section className="conf-grid">
        {loading ? (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', padding: '40px' }}>Chargement des conférences…</p>
        ) : sessions.map(s => {
          const registered = s.attendees?.length ?? 0;
          const placesRestantes = s.max_attendees != null ? s.max_attendees - registered : null;
          const complet = placesRestantes !== null && placesRestantes <= 0;
          const reserved = isReserved(s);
          const inPending = pending.has(s.id);

          return (
            <div key={s.id} className="conf-card">
              <div className="conf-card-img-wrapper">
                <img src={getConfImage(s.id)} alt={s.label} className="conf-card-img" />
              </div>
              <div className="conf-card-body">
                <span className="conf-card-heure">{formatTime(s.start_date)}</span>
                <h3 className="conf-card-sujet">{s.label}</h3>
                <div className="conf-card-meta">
                  <span>{registered} participant{registered > 1 ? "s" : ""}</span>
                  {placesRestantes !== null && (
                    <span className={complet ? "conf-card-complet" : placesRestantes <= 10 ? "conf-card-urgent" : ""}>
                      {complet ? "Complet" : `${placesRestantes} place${placesRestantes > 1 ? "s" : ""} restante${placesRestantes > 1 ? "s" : ""}`}
                    </span>
                  )}
                </div>
                {reserved ? (
                  <div className="conf-card-reserved-row">
                    <button className="btn-reserved">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Réservé
                    </button>
                    <button className="btn-annuler" disabled={inPending} onClick={() => handleToggle(s)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      {inPending ? "…" : "Annuler"}
                    </button>
                  </div>
                ) : (
                  <BtnBleu
                    text={inPending ? "…" : (complet ? "Complet" : "Réserver ma place")}
                    lien="#"
                    onClick={() => !complet && handleToggle(s)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </section>

      <Faq />
      <Footer />
    </>
  );
};

export default Conferences;
