import "./Reserver.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../partials/Navbar";
import Footer from "../partials/Footer";

// ── Data ──────────────────────────────────────────────────────────────────────

const hotels = [
  {
    nom: "Hôtel Royal Limoges",
    etoiles: 5,
    lieu: "Centre-ville, Limoges",
    image: "https://picsum.photos/seed/h1a/600/400",
    chambres: [
      { nom: "Chambre Standard", superficie: 22, lits: "1 lit double", prix: 189, prixPdj: 18, image: "https://picsum.photos/seed/ch1a/400/300" },
      { nom: "Chambre Supérieure", superficie: 30, lits: "1 lit king-size", prix: 249, prixPdj: 18, image: "https://picsum.photos/seed/ch2a/400/300" },
      { nom: "Suite Junior", superficie: 45, lits: "1 lit king-size", prix: 349, prixPdj: 22, image: "https://picsum.photos/seed/ch3a/400/300" },
      { nom: "Suite Prestige", superficie: 65, lits: "King-size + canapé-lit", prix: 499, prixPdj: 22, image: "https://picsum.photos/seed/ch4a/400/300" },
    ],
  },
  {
    nom: "Mercure Limoges Centre",
    etoiles: 4,
    lieu: "Quartier des Bénédictins",
    image: "https://picsum.photos/seed/h2a/600/400",
    chambres: [
      { nom: "Chambre Classique", superficie: 20, lits: "1 lit double", prix: 129, prixPdj: 15, image: "https://picsum.photos/seed/m1a/400/300" },
      { nom: "Chambre Supérieure", superficie: 28, lits: "1 lit king-size", prix: 169, prixPdj: 15, image: "https://picsum.photos/seed/m2a/400/300" },
    ],
  },
  {
    nom: "Novotel Limoges",
    etoiles: 4,
    lieu: "Près du Palais des Congrès",
    image: "https://picsum.photos/seed/h3a/600/400",
    chambres: [
      { nom: "Chambre Standard", superficie: 22, lits: "1 lit double", prix: 115, prixPdj: 14, image: "https://picsum.photos/seed/n1a/400/300" },
      { nom: "Chambre Famille", superficie: 35, lits: "1 double + 2 simples", prix: 155, prixPdj: 14, image: "https://picsum.photos/seed/n2a/400/300" },
    ],
  },
  {
    nom: "Ibis Limoges Centre",
    etoiles: 3,
    lieu: "Gare de Limoges",
    image: "https://picsum.photos/seed/h4a/600/400",
    chambres: [
      { nom: "Chambre Standard", superficie: 17, lits: "1 lit double", prix: 79, prixPdj: 12, image: "https://picsum.photos/seed/i1a/400/300" },
    ],
  },
];

const activites = [
  { nom: "Visite guidée de la Cité de la Céramique", categorie: "Culture", duree: "2h", prix: 18, image: "https://picsum.photos/seed/act1/400/300" },
  { nom: "Balade en bord de Vienne", categorie: "Nature", duree: "1h30", prix: 12, image: "https://picsum.photos/seed/act2/400/300" },
  { nom: "Atelier gastronomique limousin", categorie: "Gastronomie", duree: "3h", prix: 55, image: "https://picsum.photos/seed/act3/400/300" },
  { nom: "Visite de la cathédrale Saint-Étienne", categorie: "Culture", duree: "1h30", prix: 10, image: "https://picsum.photos/seed/act4/400/300" },
  { nom: "Soirée vin & fromages du terroir", categorie: "Gastronomie", duree: "2h", prix: 35, image: "https://picsum.photos/seed/act5/400/300" },
  { nom: "Escape Game — Le Secret du Congrès", categorie: "Divertissement", duree: "1h", prix: 22, image: "https://picsum.photos/seed/act6/400/300" },
];

const categorieColors: Record<string, string> = {
  Culture: "#7c3aed", Nature: "#01b285", Gastronomie: "#e05c00", Divertissement: "#02affe",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const Etoiles = ({ n }: { n: number }) => (
  <span className="res-etoiles">
    {[...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < n ? "#f5a623" : "#e0e0e0" }}>★</span>
    ))}
  </span>
);

const diffNuits = (a: string, b: string) => {
  const d = (new Date(b).getTime() - new Date(a).getTime()) / 86400000;
  return isNaN(d) || d < 0 ? 0 : d;
};

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—";

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = ["Vos dates", "Hébergement", "Activités", "Récapitulatif"];

type Selection = {
  arrivee: string;
  depart: string;
  hotelIdx: number | null;
  chambreIdx: number | null;
  pdj: boolean;
  activites: Set<number>;
};

// ── Step 1 ────────────────────────────────────────────────────────────────────

const StepDates = ({ sel, setSel }: { sel: Selection; setSel: (s: Selection) => void }) => {
  const nuits = diffNuits(sel.arrivee, sel.depart);
  return (
    <div className="res-step">
      <h2 className="res-step-titre">Vos dates de séjour</h2>
      <p className="res-step-sous">Le congrès se tient du 12 au 15 juin 2025. Vous pouvez ajuster vos dates.</p>
      <div className="res-dates-row">
        <div className="res-field">
          <label className="res-label">Arrivée</label>
          <input type="date" className="res-input" value={sel.arrivee}
            onChange={e => setSel({ ...sel, arrivee: e.target.value })} />
        </div>
        <div className="res-dates-arrow">→</div>
        <div className="res-field">
          <label className="res-label">Départ</label>
          <input type="date" className="res-input" value={sel.depart}
            onChange={e => setSel({ ...sel, depart: e.target.value })} />
        </div>
      </div>
      {nuits > 0 && (
        <p className="res-nuits-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {nuits} nuit{nuits > 1 ? "s" : ""} · du {formatDate(sel.arrivee)} au {formatDate(sel.depart)}
        </p>
      )}
    </div>
  );
};

// ── Step 2 ────────────────────────────────────────────────────────────────────

const StepHebergement = ({ sel, setSel }: { sel: Selection; setSel: (s: Selection) => void }) => {
  const [expanded, setExpanded] = useState<number | null>(sel.hotelIdx ?? 0);
  const nuits = diffNuits(sel.arrivee, sel.depart);

  const addNuit = () => {
    const d = new Date(sel.depart);
    d.setDate(d.getDate() + 1);
    setSel({ ...sel, depart: d.toISOString().split("T")[0] });
  };

  const removeNuit = () => {
    if (nuits <= 1) return;
    const d = new Date(sel.depart);
    d.setDate(d.getDate() - 1);
    setSel({ ...sel, depart: d.toISOString().split("T")[0] });
  };

  return (
    <div className="res-step">
      <h2 className="res-step-titre">Choisissez votre hébergement</h2>
      <p className="res-step-sous">Sélectionnez un hôtel et une chambre. Vous pouvez passer cette étape.</p>

      <div className="res-nuits-bar">
        <div className="res-nuits-dates">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {formatDate(sel.arrivee)} → {formatDate(sel.depart)}
        </div>
        <div className="res-nuits-counter">
          <button className="res-nuits-btn" onClick={removeNuit} disabled={nuits <= 1}>−</button>
          <span className="res-nuits-val">{nuits} nuit{nuits > 1 ? "s" : ""}</span>
          <button className="res-nuits-btn" onClick={addNuit}>+</button>
        </div>
      </div>

      <div className="res-hotels-list">
        {hotels.map((h, hi) => (
          <div key={hi} className={`res-hotel-card ${expanded === hi ? "res-hotel-card--open" : ""}`}>
            <div className="res-hotel-header" onClick={() => setExpanded(expanded === hi ? null : hi)}>
              <img src={h.image} alt={h.nom} className="res-hotel-img" />
              <div className="res-hotel-info">
                <div className="res-hotel-top">
                  <span className="res-hotel-nom">{h.nom}</span>
                  <Etoiles n={h.etoiles} />
                </div>
                <span className="res-hotel-lieu">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {h.lieu}
                </span>
                <span className="res-hotel-depuis">À partir de <strong>{Math.min(...h.chambres.map(c => c.prix))} €</strong> / nuit</span>
              </div>
              <svg className="res-hotel-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {expanded === hi && (
              <div className="res-chambres-list">
                {h.chambres.map((c, ci) => {
                  const selected = sel.hotelIdx === hi && sel.chambreIdx === ci;
                  const prixTotal = nuits > 0 ? nuits * (c.prix + (selected && sel.pdj ? c.prixPdj : 0)) : null;
                  return (
                    <div key={ci} className={`res-chambre-row ${selected ? "res-chambre-row--selected" : ""}`}
                      onClick={() => setSel({ ...sel, hotelIdx: hi, chambreIdx: ci, pdj: selected ? sel.pdj : false })}>
                      <img src={c.image} alt={c.nom} className="res-chambre-img" />
                      <div className="res-chambre-info">
                        <span className="res-chambre-nom">{c.nom}</span>
                        <span className="res-chambre-meta">{c.superficie} m² · {c.lits}</span>
                        {selected && (
                          <label className="res-pdj" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={sel.pdj}
                              onChange={() => setSel({ ...sel, pdj: !sel.pdj })} />
                            <span className="res-pdj-box">{sel.pdj && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>}</span>
                            Petit déjeuner <span className="res-pdj-prix">+{c.prixPdj} € / nuit</span>
                          </label>
                        )}
                      </div>
                      <div className="res-chambre-right">
                        <span className="res-chambre-prix">
                          {prixTotal !== null && selected
                            ? <><strong>{prixTotal} €</strong><span className="res-prix-total-label"> total</span></>
                            : <><strong>{c.prix} €</strong><span className="res-prix-nuit-label"> / nuit</span></>
                          }
                        </span>
                        <span className={`res-chambre-select ${selected ? "res-chambre-select--on" : ""}`}>
                          {selected ? "✓ Sélectionné" : "Choisir"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Step 3 ────────────────────────────────────────────────────────────────────

const StepActivites = ({ sel, setSel }: { sel: Selection; setSel: (s: Selection) => void }) => {
  const toggle = (i: number) => {
    const next = new Set(sel.activites);
    next.has(i) ? next.delete(i) : next.add(i);
    setSel({ ...sel, activites: next });
  };

  return (
    <div className="res-step">
      <h2 className="res-step-titre">Ajoutez des activités</h2>
      <p className="res-step-sous">Sélectionnez les activités qui vous intéressent. Vous pouvez en ajouter autant que vous voulez, ou passer cette étape.</p>
      <div className="res-activites-grid">
        {activites.map((a, i) => {
          const checked = sel.activites.has(i);
          return (
            <div key={i} className={`res-activite-card ${checked ? "res-activite-card--selected" : ""}`} onClick={() => toggle(i)}>
              <div className="res-activite-img-wrapper">
                <img src={a.image} alt={a.nom} className="res-activite-img" />
                <span className="res-activite-cat" style={{ backgroundColor: categorieColors[a.categorie] }}>{a.categorie}</span>
                <span className={`res-activite-check ${checked ? "res-activite-check--on" : ""}`}>
                  {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>}
                </span>
              </div>
              <div className="res-activite-body">
                <span className="res-activite-nom">{a.nom}</span>
                <div className="res-activite-footer">
                  <span className="res-activite-duree">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {a.duree}
                  </span>
                  <span className="res-activite-prix"><strong>{a.prix} €</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Step 4 ────────────────────────────────────────────────────────────────────

const StepRecap = ({ sel, onConfirm }: { sel: Selection; onConfirm: () => void }) => {
  const nuits = diffNuits(sel.arrivee, sel.depart);
  const hotel = sel.hotelIdx !== null ? hotels[sel.hotelIdx] : null;
  const chambre = hotel && sel.chambreIdx !== null ? hotel.chambres[sel.chambreIdx] : null;

  const totalHotel = chambre ? nuits * (chambre.prix + (sel.pdj ? chambre.prixPdj : 0)) : 0;
  const totalActivites = [...sel.activites].reduce((acc, i) => acc + activites[i].prix, 0);
  const total = totalHotel + totalActivites;

  return (
    <div className="res-step">
      <h2 className="res-step-titre">Récapitulatif de votre séjour</h2>
      <p className="res-step-sous">Vérifiez votre sélection avant de confirmer.</p>

      <div className="res-recap-sections">

        <div className="res-recap-bloc">
          <h3 className="res-recap-bloc-titre">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Dates
          </h3>
          <p className="res-recap-val">{formatDate(sel.arrivee)} → {formatDate(sel.depart)}</p>
          <p className="res-recap-meta">{nuits} nuit{nuits > 1 ? "s" : ""}</p>
        </div>

        <div className="res-recap-bloc">
          <h3 className="res-recap-bloc-titre">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Hébergement
          </h3>
          {chambre ? (
            <>
              <p className="res-recap-val">{hotel!.nom} · {chambre.nom}</p>
              <p className="res-recap-meta">{nuits} nuit{nuits > 1 ? "s" : ""}{sel.pdj ? " · Petit déjeuner inclus" : ""}</p>
              <p className="res-recap-prix">{totalHotel} €</p>
            </>
          ) : (
            <p className="res-recap-vide">Aucun hébergement sélectionné</p>
          )}
        </div>

        {sel.activites.size > 0 && (
          <div className="res-recap-bloc">
            <h3 className="res-recap-bloc-titre">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Activités ({sel.activites.size})
            </h3>
            {[...sel.activites].map(i => (
              <div key={i} className="res-recap-activite-row">
                <span className="res-recap-val">{activites[i].nom}</span>
                <span className="res-recap-prix">{activites[i].prix} €</span>
              </div>
            ))}
            <p className="res-recap-prix res-recap-sous-total">Sous-total : {totalActivites} €</p>
          </div>
        )}

        <div className="res-recap-total">
          <span>Total du séjour</span>
          <span className="res-recap-total-montant">{total} €</span>
        </div>
      </div>

      <button className="res-confirm-btn" onClick={onConfirm}>
        Confirmer ma réservation
      </button>
    </div>
  );
};

// ── Confirmation ──────────────────────────────────────────────────────────────

const Confirmation = () => (
  <div className="res-confirm-screen">
    <div className="res-confirm-icon">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
    <h2 className="res-confirm-titre">Réservation confirmée !</h2>
    <p className="res-confirm-sous">Votre séjour a bien été enregistré. Un récapitulatif vous a été envoyé par email.</p>
    <div className="res-confirm-actions">
      <Link to="/profil" className="res-confirm-btn-profil">Voir mon profil</Link>
      <Link to="/" className="res-confirm-btn-home">Retour à l'accueil</Link>
    </div>
  </div>
);

// ── Page principale ───────────────────────────────────────────────────────────

const Reserver = () => {
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [sel, setSel] = useState<Selection>({
    arrivee: "2025-06-12",
    depart: "2025-06-15",
    hotelIdx: null,
    chambreIdx: null,
    pdj: false,
    activites: new Set(),
  });

  const canNext = () => {
    if (step === 0) return diffNuits(sel.arrivee, sel.depart) > 0;
    return true;
  };

  return (
    <>
      <Navbar />
      <div className="res-spacer" />

      {confirmed ? (
        <div className="res-page"><Confirmation /></div>
      ) : (
        <div className="res-page">
          <div className="res-stepper">
            {STEPS.map((s, i) => (
              <div key={i} className={`res-step-item ${i === step ? "res-step-item--active" : ""} ${i < step ? "res-step-item--done" : ""}`}>
                <div className="res-step-bubble">
                  {i < step
                    ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>
                    : i + 1
                  }
                </div>
                <span className="res-step-label">{s}</span>
                {i < STEPS.length - 1 && <div className="res-step-line" />}
              </div>
            ))}
          </div>

          <div className="res-content">
            {step === 0 && <StepDates sel={sel} setSel={setSel} />}
            {step === 1 && <StepHebergement sel={sel} setSel={setSel} />}
            {step === 2 && <StepActivites sel={sel} setSel={setSel} />}
            {step === 3 && <StepRecap sel={sel} onConfirm={() => setConfirmed(true)} />}

            <div className="res-nav">
              {step > 0 && (
                <button className="res-btn-back" onClick={() => setStep(s => s - 1)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Retour
                </button>
              )}
              <div style={{ flex: 1 }} />
              {step < 3 && (
                <>
                  {step > 0 && (
                    <button className="res-btn-skip" onClick={() => setStep(s => s + 1)}>
                      Passer cette étape
                    </button>
                  )}
                  <button className="res-btn-next" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
                    {step === 2 ? "Voir le récapitulatif" : "Continuer"}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Reserver;
