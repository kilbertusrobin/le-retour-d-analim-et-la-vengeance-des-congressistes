import "./Profil.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { generateFacture } from "../utils/generateFacture";

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.2;
  window.scrollTo({ top, behavior: "smooth" });
};
import Navbar from "../partials/Navbar";
import Footer from "../partials/Footer";

const user = {
  prenom: "Jean",
  nom: "Dupont",
  email: "jean.dupont@chu-limoges.fr",
  adresse: "12 avenue du Palais, 87000 Limoges",
};

const initHotels = [
  {
    id: 0,
    hotel: "Hôtel Royal Limoges",
    chambre: "Chambre Supérieure",
    dates: "12 – 15 juin 2025",
    nuits: 3,
    prixNuit: 249,
    pdj: true,
    prixPdj: 18,
  },
];

const initActivites = [
  { id: 0, nom: "Visite guidée de la Cité de la Céramique", date: "13 juin 2025", prix: 18 },
  { id: 1, nom: "Atelier gastronomique limousin", date: "14 juin 2025", prix: 55 },
];

const Profil = () => {
  const [hotels, setHotels] = useState(initHotels);
  const [activites, setActivites] = useState(initActivites);
  const [confirmAnnul, setConfirmAnnul] = useState<{ type: "hotel" | "activite"; id: number } | null>(null);

  const annulerHotel = (id: number) => setHotels(prev => prev.filter(r => r.id !== id));
  const annulerActivite = (id: number) => setActivites(prev => prev.filter(a => a.id !== id));

  const totalHotels = hotels.reduce((acc, r) => acc + r.nuits * (r.prixNuit + (r.pdj ? r.prixPdj : 0)), 0);
  const totalActivites = activites.reduce((acc, a) => acc + a.prix, 0);
  const total = totalHotels + totalActivites;

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
              <button className="profil-modal-confirm" onClick={() => {
                if (confirmAnnul.type === "hotel") annulerHotel(confirmAnnul.id);
                else annulerActivite(confirmAnnul.id);
                setConfirmAnnul(null);
              }}>Confirmer l'annulation</button>
            </div>
          </div>
        </div>
      )}

      <div className="profil-page">

        <aside className="profil-aside">
          <div className="profil-avatar">{user.prenom[0]}{user.nom[0]}</div>
          <div className="profil-aside-info">
            <p className="profil-nom">{user.prenom} {user.nom}</p>
            <p className="profil-email">{user.email}</p>
          </div>
          <div className="profil-divider" />
          <nav className="profil-nav">
            <button className="profil-nav-link profil-nav-link--active" onClick={() => scrollTo("reservations")}>Hébergement</button>
            <button className="profil-nav-link" onClick={() => scrollTo("activites")}>Activités</button>
            <button className="profil-nav-link" onClick={() => scrollTo("facture")}>Facture</button>
          </nav>
          <div className="profil-divider" />
          <Link to="/connexion" className="profil-deconnexion">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Se déconnecter
          </Link>
        </aside>

        <main className="profil-main">

          <section className="profil-section" id="reservations">
            <h2 className="profil-section-titre">Hébergement réservé</h2>
            {hotels.length === 0 ? (
              <div className="profil-empty">
                <p className="profil-empty-texte">Aucun hébergement réservé pour l'instant.</p>
                <Link to="/hotels" className="profil-empty-btn">Trouver un hébergement</Link>
              </div>
            ) : (
              <div className="profil-cards">
                {hotels.map(r => (
                  <div key={r.id} className="profil-card">
                    <div className="profil-card-left">
                      <div>
                        <p className="profil-card-titre">{r.hotel}</p>
                        <p className="profil-card-sous">{r.chambre} · {r.dates}</p>
                        <div className="profil-card-tags">
                          <span className="profil-tag">{r.nuits} nuit{r.nuits > 1 ? "s" : ""}</span>
                          {r.pdj && <span className="profil-tag">Petit déjeuner inclus</span>}
                        </div>
                      </div>
                    </div>
                    <div className="profil-card-right">
                      <div className="profil-card-prix">{r.nuits * (r.prixNuit + (r.pdj ? r.prixPdj : 0))} €</div>
                      <button className="profil-annuler" onClick={() => setConfirmAnnul({ type: "hotel", id: r.id })}>
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
                        <p className="profil-card-titre">{a.nom}</p>
                        <p className="profil-card-sous">{a.date}</p>
                      </div>
                    </div>
                    <div className="profil-card-right">
                      <div className="profil-card-prix">{a.prix} €</div>
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
              <span>Hébergement <strong>{totalHotels} €</strong></span>
              <span>Activités <strong>{totalActivites} €</strong></span>
            </div>
            <button className="profil-facture-btn" onClick={() => generateFacture(user, hotels, activites)}>
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
