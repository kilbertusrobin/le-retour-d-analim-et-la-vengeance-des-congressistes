import "./Reserver.css";
import { useEffect, useState } from "react";
import type React from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../partials/Navbar";
import Footer from "../partials/Footer";
import type { ApiHotel, ApiActivity } from "../context/AuthContext";
import { apiGet, apiPatch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

type HydraCollection<T> = { 'member': T[] };

const categorieColors: Record<string, string> = {
  Culture: "#7c3aed", Nature: "#01b285", Gastronomie: "#e05c00", Divertissement: "#02affe",
};

const Etoiles = ({ n }: { n: number }) => (
  <span className="res-etoiles">
    {[...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < n ? "#f5a623" : "#e0e0e0" }}>★</span>
    ))}
  </span>
);

const parseStars = (category: string) => parseInt(category) || 0;

const diffNuits = (a: string, b: string) => {
  const d = (new Date(b + "T12:00:00").getTime() - new Date(a + "T12:00:00").getTime()) / 86400000;
  return isNaN(d) || d < 0 ? 0 : Math.round(d);
};

const formatDate = (d: string) =>
  d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—";

const datesOverlap = (a1: string, d1: string, a2: string, d2: string) =>
  a1 < d2 && d1 > a2;

const STEPS = ["Hébergement", "Activités", "Récapitulatif"];

type HotelSel = { arrivee: string; depart: string; pdj: boolean };
type Selection = {
  hotels: Record<number, HotelSel>;
  activites: number[];
};

type ExistingBooking = { hotelId: number; arrivee: string; depart: string };

// ── Step 1 ────────────────────────────────────────────────────────────────────

const StepHebergement = ({ sel, setSel, hotels, existingBookings }: {
  sel: Selection;
  setSel: React.Dispatch<React.SetStateAction<Selection>>;
  hotels: ApiHotel[];
  existingBookings: ExistingBooking[];
}) => {
  const [expanded, setExpanded] = useState<number | null>(null);

  const isSelected = (id: number) => id in sel.hotels;
  const isAlreadyBooked = (id: number) => existingBookings.some(b => b.hotelId === id);

  const toggleHotel = (id: number) => {
    if (isAlreadyBooked(id)) return;
    setSel(prev => {
      if (id in prev.hotels) {
        const { [id]: _, ...rest } = prev.hotels;
        return { ...prev, hotels: rest as Record<number, HotelSel> };
      }
      return { ...prev, hotels: { ...prev.hotels, [id]: { arrivee: "2026-06-08", depart: "2026-06-13", pdj: false } } };
    });
  };

  const updateDate = (id: number, field: "arrivee" | "depart", value: string) =>
    setSel(prev => ({ ...prev, hotels: { ...prev.hotels, [id]: { ...prev.hotels[id], [field]: value } } }));

  const togglePdj = (id: number) =>
    setSel(prev => ({ ...prev, hotels: { ...prev.hotels, [id]: { ...prev.hotels[id], pdj: !prev.hotels[id].pdj } } }));

  return (
    <div className="res-step">
      <h2 className="res-step-titre">Choisissez votre hébergement</h2>
      <p className="res-step-sous">Sélectionnez un ou plusieurs hôtels et choisissez vos dates. Vous pouvez passer cette étape.</p>

      <div className="res-hotels-list">
        {hotels.map(h => {
          const isOpen = expanded === h.id;
          const selected = isSelected(h.id);
          const alreadyBooked = isAlreadyBooked(h.id);
          const hSel = sel.hotels[h.id];
          const nuits = hSel ? diffNuits(hSel.arrivee, hSel.depart) : 0;
          const prixTotal = hSel && nuits > 0 ? nuits * (h.night_price + (hSel.pdj ? h.breakfast_price : 0)) : null;

          const hasOverlap = hSel && (
            Object.entries(sel.hotels).some(([otherId, other]) =>
              Number(otherId) !== h.id && datesOverlap(hSel.arrivee, hSel.depart, other.arrivee, other.depart)
            ) ||
            existingBookings.some(b => b.hotelId !== h.id && datesOverlap(hSel.arrivee, hSel.depart, b.arrivee, b.depart))
          );

          return (
            <div key={h.id} className={`res-hotel-card ${isOpen ? "res-hotel-card--open" : ""}`}>
              <div className="res-hotel-header" onClick={() => setExpanded(isOpen ? null : h.id)}>
                <img src={`https://picsum.photos/seed/h${h.id}a/600/400`} alt={h.name} className="res-hotel-img" />
                <div className="res-hotel-info">
                  <div className="res-hotel-top">
                    <span className="res-hotel-nom">{h.name}</span>
                    <Etoiles n={parseStars(h.category)} />
                  </div>
                  <span className="res-hotel-lieu">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {h.address}
                  </span>
                  <span className="res-hotel-depuis">À partir de <strong>{h.night_price} €</strong> / nuit</span>
                </div>
                <svg className="res-hotel-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {isOpen && (
                <div className="res-chambres-list">
                  {alreadyBooked ? (
                    <div className="res-already-booked">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {(() => {
                        const b = existingBookings.find(b => b.hotelId === h.id)!;
                        return `Déjà réservé du ${formatDate(b.arrivee)} au ${formatDate(b.depart)}`;
                      })()}
                    </div>
                  ) : (
                    <div className={`res-chambre-row ${selected ? "res-chambre-row--selected" : ""}`}
                      onClick={() => toggleHotel(h.id)}>
                      <img src={`https://picsum.photos/seed/ch${h.id}a/400/300`} alt="Chambre" className="res-chambre-img" />
                      <div className="res-chambre-info">
                        <span className="res-chambre-nom">Chambre standard</span>
                        <span className="res-chambre-meta">1 lit double · Wi-Fi inclus</span>
                        {selected && (
                          <>
                            <div className="res-hotel-dates" onClick={e => e.stopPropagation()}>
                              <div className="res-field-inline">
                                <label className="res-label-sm">Arrivée</label>
                                <input type="date" className="res-input-sm" value={hSel.arrivee}
                                  min="2026-06-06" max="2026-06-14"
                                  onChange={e => { const v = e.target.value; updateDate(h.id, "arrivee", v); }} />
                              </div>
                              <span className="res-dates-sep">→</span>
                              <div className="res-field-inline">
                                <label className="res-label-sm">Départ</label>
                                <input type="date" className="res-input-sm" value={hSel.depart}
                                  min="2026-06-07" max="2026-06-15"
                                  onChange={e => { const v = e.target.value; updateDate(h.id, "depart", v); }} />
                              </div>
                              {nuits > 0 && <span className="res-nuits-badge">{nuits} nuit{nuits > 1 ? "s" : ""}</span>}
                            </div>
                            {hasOverlap && (
                              <p className="res-overlap-warning">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                Ces dates chevauchent une autre réservation
                              </p>
                            )}
                            <label className="res-pdj" onClick={e => e.stopPropagation()}>
                              <input type="checkbox" checked={hSel.pdj} onChange={() => togglePdj(h.id)} />
                              <span className="res-pdj-box">{hSel.pdj && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>}</span>
                              Petit déjeuner <span className="res-pdj-prix">+{h.breakfast_price} € / nuit</span>
                            </label>
                          </>
                        )}
                      </div>
                      <div className="res-chambre-right">
                        <span className="res-chambre-prix">
                          {prixTotal !== null && selected
                            ? <><strong>{prixTotal} €</strong><span className="res-prix-total-label"> total</span></>
                            : <><strong>{h.night_price} €</strong><span className="res-prix-nuit-label"> / nuit</span></>
                          }
                        </span>
                        <span className={`res-chambre-select ${selected ? "res-chambre-select--on" : ""}`}>
                          {selected ? "✓ Sélectionné" : "Choisir"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Step 2 ────────────────────────────────────────────────────────────────────

const StepActivites = ({ sel, setSel, activites }: {
  sel: Selection;
  setSel: React.Dispatch<React.SetStateAction<Selection>>;
  activites: ApiActivity[];
}) => {
  const toggle = (id: number) => setSel(prev => ({
    ...prev,
    activites: prev.activites.includes(id) ? prev.activites.filter(x => x !== id) : [...prev.activites, id],
  }));

  return (
    <div className="res-step">
      <h2 className="res-step-titre">Ajoutez des activités</h2>
      <p className="res-step-sous">Sélectionnez les activités qui vous intéressent. Vous pouvez en ajouter autant que vous voulez, ou passer cette étape.</p>
      <div className="res-activites-grid">
        {activites.map(a => {
          const checked = sel.activites.includes(a.id);
          return (
            <div key={a.id} className={`res-activite-card ${checked ? "res-activite-card--selected" : ""}`} onClick={() => toggle(a.id)}>
              <div className="res-activite-img-wrapper">
                <img src={`https://picsum.photos/seed/act${a.id}/400/300`} alt={a.label} className="res-activite-img" />
                <span className="res-activite-cat" style={{ backgroundColor: categorieColors[a.category ?? ""] ?? "#333" }}>{a.category ?? "—"}</span>
                <span className={`res-activite-check ${checked ? "res-activite-check--on" : ""}`}>
                  {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>}
                </span>
              </div>
              <div className="res-activite-body">
                <span className="res-activite-nom">{a.label}</span>
                <div className="res-activite-footer">
                  {a.duration && (
                    <span className="res-activite-duree">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {a.duration}
                    </span>
                  )}
                  <span className="res-activite-prix"><strong>{a.price} €</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Step 3 ────────────────────────────────────────────────────────────────────

const StepRecap = ({ sel, hotels, activites, onConfirm, confirming }: {
  sel: Selection;
  hotels: ApiHotel[];
  activites: ApiActivity[];
  onConfirm: () => void;
  confirming: boolean;
}) => {
  const selectedHotelEntries = Object.entries(sel.hotels)
    .map(([id, h]) => ({ hotel: hotels.find(x => x.id === Number(id)), ...h }))
    .filter(x => x.hotel) as ({ hotel: ApiHotel } & HotelSel)[];

  const selectedActs = activites.filter(a => sel.activites.includes(a.id));

  const totalHotel = selectedHotelEntries.reduce((acc, { hotel, arrivee, depart, pdj }) => {
    const n = diffNuits(arrivee, depart);
    return acc + n * (hotel.night_price + (pdj ? hotel.breakfast_price : 0));
  }, 0);
  const totalActivites = selectedActs.reduce((acc, a) => acc + a.price, 0);
  const total = totalHotel + totalActivites;

  return (
    <div className="res-step">
      <h2 className="res-step-titre">Récapitulatif de votre séjour</h2>
      <p className="res-step-sous">Vérifiez votre sélection avant de confirmer.</p>

      <div className="res-recap-sections">
        <div className="res-recap-bloc">
          <h3 className="res-recap-bloc-titre">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Hébergement
          </h3>
          {selectedHotelEntries.length > 0 ? selectedHotelEntries.map(({ hotel, arrivee, depart, pdj }) => {
            const nuits = diffNuits(arrivee, depart);
            return (
              <div key={hotel.id}>
                <p className="res-recap-val">{hotel.name}</p>
                <p className="res-recap-meta">{formatDate(arrivee)} → {formatDate(depart)} · {nuits} nuit{nuits > 1 ? "s" : ""}{pdj ? " · Petit déjeuner inclus" : ""}</p>
                <p className="res-recap-prix">{nuits * (hotel.night_price + (pdj ? hotel.breakfast_price : 0))} €</p>
              </div>
            );
          }) : (
            <p className="res-recap-vide">Aucun hébergement sélectionné</p>
          )}
        </div>

        {selectedActs.length > 0 && (
          <div className="res-recap-bloc">
            <h3 className="res-recap-bloc-titre">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Activités ({selectedActs.length})
            </h3>
            {selectedActs.map(a => (
              <div key={a.id} className="res-recap-activite-row">
                <span className="res-recap-val">{a.label}</span>
                <span className="res-recap-prix">{a.price} €</span>
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

      <button className="res-confirm-btn" onClick={onConfirm} disabled={confirming}>
        {confirming ? "Enregistrement…" : "Confirmer ma réservation"}
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
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [hotels, setHotels] = useState<ApiHotel[]>([]);
  const [activites, setActivites] = useState<ApiActivity[]>([]);
  const [sel, setSel] = useState<Selection>(() => ({
    hotels: {},
    activites: user?.activity_registration?.map(a => a.id) ?? [],
  }));

  useEffect(() => {
    apiGet<HydraCollection<ApiHotel>>('/api/hotels').then(d => setHotels(d['member'])).catch(() => {});
    apiGet<HydraCollection<ApiActivity>>('/api/activities').then(d => setActivites(d['member'])).catch(() => {});
  }, []);

  // Build existing bookings for overlap detection
  const existingBookings: ExistingBooking[] = (user?.hotel_bookings ?? [])
    .filter(b => b.check_in_date)
    .map(b => {
      const arrivee = b.check_in_date!.substring(0, 10);
      const d = new Date(arrivee + "T12:00:00");
      d.setDate(d.getDate() + b.nights);
      return { hotelId: b.hotel.id, arrivee, depart: d.toISOString().split("T")[0] };
    });

  const handleConfirm = async () => {
    if (!user) { navigate('/connexion'); return; }
    setConfirming(true);
    try {
      const keepExisting = (user.hotel_bookings ?? []).map(b => ({
        hotel: `/api/hotels/${b.hotel.id}`,
        nights: b.nights,
        breakfast: b.breakfast,
        check_in_date: b.check_in_date,
      }));
      const newBookings = Object.entries(sel.hotels).map(([id, h]) => ({
        hotel: `/api/hotels/${id}`,
        nights: diffNuits(h.arrivee, h.depart),
        breakfast: h.pdj,
        check_in_date: h.arrivee,
      }));
      await apiPatch(`/api/attendees/${user.id}`, {
        hotel_bookings: [...keepExisting, ...newBookings],
        activity_registration: sel.activites.map(id => `/api/activities/${id}`),
      });
      await updateUser();
      setConfirmed(true);
    } catch {
      // ignore
    } finally {
      setConfirming(false);
    }
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
            {step === 0 && <StepHebergement sel={sel} setSel={setSel} hotels={hotels} existingBookings={existingBookings} />}
            {step === 1 && <StepActivites sel={sel} setSel={setSel} activites={activites} />}
            {step === 2 && <StepRecap sel={sel} hotels={hotels} activites={activites} onConfirm={handleConfirm} confirming={confirming} />}

            <div className="res-nav">
              {step > 0 && (
                <button className="res-btn-back" onClick={() => setStep(s => s - 1)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Retour
                </button>
              )}
              <div style={{ flex: 1 }} />
              {step < 2 && (
                <>
                  <button className="res-btn-skip" onClick={() => setStep(s => s + 1)}>
                    Passer cette étape
                  </button>
                  <button className="res-btn-next" onClick={() => setStep(s => s + 1)}>
                    {step === 1 ? "Voir le récapitulatif" : "Continuer"}
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
