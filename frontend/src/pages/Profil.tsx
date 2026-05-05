import "./Profil.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { generateFacture } from "../utils/generateFacture";
import Navbar from "../partials/Navbar";
import Footer from "../partials/Footer";
import { useAuth } from "../context/AuthContext";
import type { ApiActivity, ApiHotelBooking } from "../context/AuthContext";
import { apiPatch } from "../utils/api";

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.2;
  window.scrollTo({ top, behavior: "smooth" });
};

const CONGRESS_DAYS = 5;

const Profil = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [confirmAnnul, setConfirmAnnul] = useState<{ type: "hotel" | "activite"; id: number } | null>(null);

  if (!user) {
    navigate("/connexion");
    return null;
  }

  const bookings: ApiHotelBooking[] = user.hotel_bookings ?? [];
  const activites: ApiActivity[] = user.activity_registration ?? [];

  const totalHotel = bookings.reduce((acc, b) =>
    acc + b.hotel.night_price * b.nights + (b.breakfast ? b.hotel.breakfast_price * b.nights : 0), 0);
  const totalActivites = activites.reduce((acc, a) => acc + (a.price ?? 0), 0);
  const total = totalHotel + totalActivites;

  // API Platform remplace toute la collection — on envoie la liste complète sans l'élément annulé
  const annulerHotel = async (bookingId: number) => {
    const remaining = bookings.filter(b => b.id !== bookingId);
    await apiPatch(`/api/attendees/${user.id}`, {
      hotel_bookings: remaining.map(b => ({ hotel: `/api/hotels/${b.hotel.id}`, nights: b.nights })),
    });
    await updateUser();
  };

  const annulerActivite = async (actId: number) => {
    const newIds = activites.filter(a => a.id !== actId).map(a => `/api/activities/${a.id}`);
    await apiPatch(`/api/attendees/${user.id}`, { activity_registration: newIds });
    await updateUser();
  };

  const handleConfirmAnnul = async () => {
    if (!confirmAnnul) return;
    if (confirmAnnul.type === "hotel") await annulerHotel(confirmAnnul.id);
    else await annulerActivite(confirmAnnul.id);
    setConfirmAnnul(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const factureUser = { prenom: user.first_name, nom: user.last_name, email: user.email, adresse: user.address };
  const factureHotels = bookings.map(b => {
    const arrive = new Date((b.check_in_date ?? "2026-06-08").substring(0, 10) + "T12:00:00");
    const depart = new Date(arrive);
    depart.setDate(depart.getDate() + b.nights);
    const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    return {
      hotel: b.hotel.name,
      chambre: "Chambre standard",
      dates: `${fmt(arrive)} – ${fmt(depart)} 2026`,
      nuits: b.nights,
      prixNuit: b.hotel.night_price,
      pdj: b.breakfast,
      prixPdj: b.hotel.breakfast_price,
    };
  });
  const factureActivites = activites.map(a => ({
    nom: a.label,
    date: new Date(a.date_time).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    prix: a.price,
  }));

  return (
    <>
      <Navbar />
      <div className="profil-spacer" />

      {confirmAnnul && (
        <div className="profil-modal-overlay" onClick={() => setConfirmAnnul(null)}>
          <div className="profil-modal" onClick={e => e.stopPropagation()}>
            <p className="profil-modal-titre">Annuler la réservation ?</p>
            <p className="profil-modal-sous">Cette action est irréversible.</p>
            <div className="profil-modal-actions">
              <button className="profil-modal-cancel" onClick={() => setConfirmAnnul(null)}>Garder</button>
              <button className="profil-modal-confirm" onClick={handleConfirmAnnul}>Confirmer l'annulation</button>
            </div>
          </div>
        </div>
      )}

      <div className="profil-page">

        <aside className="profil-aside">
          <div className="profil-avatar">{user.first_name[0]}{user.last_name[0]}</div>
          <div className="profil-aside-info">
            <p className="profil-nom">{user.first_name} {user.last_name}</p>
            <p className="profil-email">{user.email}</p>
          </div>
          <div className="profil-divider" />
          <nav className="profil-nav">
            <button className="profil-nav-link profil-nav-link--active" onClick={() => scrollTo("reservations")}>Hébergement</button>
            <button className="profil-nav-link" onClick={() => scrollTo("activites")}>Activités</button>
            <button className="profil-nav-link" onClick={() => scrollTo("facture")}>Facture</button>
          </nav>
          <div className="profil-divider" />
          <button className="profil-deconnexion" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Se déconnecter
          </button>
        </aside>

        <main className="profil-main">

          <section className="profil-section" id="reservations">
            <h2 className="profil-section-titre">Hébergement réservé</h2>
            {bookings.length === 0 ? (
              <div className="profil-empty">
                <p className="profil-empty-texte">Aucun hébergement réservé pour l'instant.</p>
                <Link to="/hotels" className="profil-empty-btn">Trouver un hébergement</Link>
              </div>
            ) : (
              <div className="profil-cards">
                {bookings.map(b => {
                  const prixB = b.hotel.night_price * b.nights + (b.breakfast ? b.hotel.breakfast_price * b.nights : 0);
                  return (
                    <div key={b.id} className="profil-card">
                      <div className="profil-card-left">
                        <div>
                          <p className="profil-card-titre">{b.hotel.name}</p>
                          <p className="profil-card-sous">Chambre standard · {(() => {
                            if (!b.check_in_date) return `${b.nights} nuit${b.nights > 1 ? "s" : ""}`;
                            const arrive = new Date(b.check_in_date.substring(0, 10) + "T12:00:00");
                            const depart = new Date(arrive);
                            depart.setDate(depart.getDate() + b.nights);
                            const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
                            return `${fmt(arrive)} – ${fmt(depart)} 2026`;
                          })()}</p>
                          <div className="profil-card-tags">
                            <span className="profil-tag">{b.nights} nuit{b.nights > 1 ? "s" : ""}</span>
                            {b.breakfast && <span className="profil-tag">Petit déjeuner inclus</span>}
                          </div>
                        </div>
                      </div>
                      <div className="profil-card-right">
                        <div className="profil-card-prix">{prixB} €</div>
                        <button className="profil-annuler" onClick={() => setConfirmAnnul({ type: "hotel", id: b.id })}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                          Annuler
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="profil-section" id="activites">
            <h2 className="profil-section-titre">Activités réservées</h2>
            {activites.length === 0 ? (
              <div className="profil-empty">
                <p className="profil-empty-texte">Aucune activité réservée pour l'instant.</p>
                <Link to="/activites" className="profil-empty-btn">Découvrir les activités</Link>
              </div>
            ) : (
              <div className="profil-cards">
                {activites.map(a => (
                  <div key={a.id} className="profil-card">
                    <div className="profil-card-left">
                      <div>
                        <p className="profil-card-titre">{a.label}</p>
                        <p className="profil-card-sous">
                          {new Date(a.date_time).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="profil-card-right">
                      <div className="profil-card-prix">{a.price} €</div>
                      <button className="profil-annuler" onClick={() => setConfirmAnnul({ type: "activite", id: a.id })}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Annuler
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="profil-section profil-section--total" id="facture">
            <div className="profil-total-row">
              <div>
                <h2 className="profil-section-titre" style={{ margin: 0 }}>Total du séjour</h2>
                <p className="profil-total-sous">Hébergement + activités</p>
              </div>
              <div className="profil-total-montant">{total} €</div>
            </div>
            <div className="profil-total-detail">
              <span>Hébergement ({CONGRESS_DAYS} nuits) <strong>{totalHotel} €</strong></span>
              <span>Activités <strong>{totalActivites} €</strong></span>
            </div>
            <button className="profil-facture-btn" onClick={() => generateFacture(factureUser, factureHotels, factureActivites)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Télécharger ma facture (PDF)
            </button>
          </section>

        </main>
      </div>

      <Footer />
    </>
  );
};

export default Profil;
