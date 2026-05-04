import "./HotelSingle.css";
import { useRef, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import Navbar from "../partials/Navbar";
import Faq from "../components/Faq";
import Footer from "../partials/Footer";
import BtnVert from "../components/BtnVert";
import type { ApiHotel } from "../context/AuthContext";
import { apiGet, apiPatch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const parseStars = (category: string) => parseInt(category) || 0;

const getHotelImages = (id: number) => [
  `https://picsum.photos/seed/hs${id}a/800/600`,
  `https://picsum.photos/seed/hs${id}b/800/600`,
  `https://picsum.photos/seed/hs${id}c/800/600`,
  `https://picsum.photos/seed/hs${id}d/800/600`,
];

const Etoiles = ({ n }: { n: number }) => (
  <div className="single-etoiles">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={i < n ? "etoile-on" : "etoile-off"}>★</span>
    ))}
  </div>
);

const diffNuits = (a: string, b: string) => {
  const d = (new Date(b).getTime() - new Date(a).getTime()) / 86400000;
  return isNaN(d) || d < 0 ? 0 : Math.round(d);
};

type Lightbox = { images: string[]; index: number } | null;

const LightboxModal = ({ lightbox, onClose, onPrev, onNext, onGoTo }: {
  lightbox: Lightbox;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (i: number) => void;
}) => {
  if (!lightbox) return null;
  const { images, index } = lightbox;
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>
      <button className="lightbox-nav lightbox-nav--prev" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
        <svg width="22" height="22" viewBox="7 4 10 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div className="lightbox-img-wrapper" onClick={(e) => e.stopPropagation()}>
        <img src={images[index]} alt="" className="lightbox-img" />
        <span className="lightbox-counter">{index + 1} / {images.length}</span>
      </div>
      <button className="lightbox-nav lightbox-nav--next" onClick={(e) => { e.stopPropagation(); onNext(); }}>
        <svg width="22" height="22" viewBox="7 4 10 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
      <div className="lightbox-thumbs" onClick={(e) => e.stopPropagation()}>
        {images.map((src, i) => (
          <img key={i} src={src} alt="" className={`lightbox-thumb ${i === index ? "lightbox-thumb--active" : ""}`} onClick={() => onGoTo(i)} />
        ))}
      </div>
    </div>
  );
};

const HotelSingle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const [reserving, setReserving] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [hotel, setHotel] = useState<ApiHotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdjActif, setPdjActif] = useState(false);
  const [lightbox, setLightbox] = useState<Lightbox>(null);
  const [showModal, setShowModal] = useState(false);
  const [arrivee, setArrivee] = useState("2026-06-08");
  const [depart, setDepart] = useState("2026-06-13");

  const updateState = (s: SwiperType) => {
    setIsBeginning(s.isBeginning);
    setIsEnd(s.isEnd);
  };

  useEffect(() => {
    if (!id) return;
    apiGet<ApiHotel>(`/api/hotels/${id}`)
      .then(data => setHotel(data))
      .catch(() => navigate('/hotels'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft") setLightbox(lb => lb ? { ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length } : lb);
      if (e.key === "ArrowRight") setLightbox(lb => lb ? { ...lb, index: (lb.index + 1) % lb.images.length } : lb);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  if (loading) return <><Navbar /><div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Chargement…</div><Footer /></>;
  if (!hotel) return null;

  const alreadyBooked = user?.hotel_bookings?.some(b => b.hotel.id === hotel.id) ?? false;
  const images = getHotelImages(hotel.id);
  const nuits = diffNuits(arrivee, depart);
  const prixNuit = hotel.night_price + (pdjActif ? hotel.breakfast_price : 0);
  const total = nuits * prixNuit;

  const addNuit = () => { const d = new Date(depart); d.setDate(d.getDate() + 1); setDepart(d.toISOString().split("T")[0]); };
  const removeNuit = () => { if (nuits <= 1) return; const d = new Date(depart); d.setDate(d.getDate() - 1); setDepart(d.toISOString().split("T")[0]); };

  const chambreImages = [
    `https://picsum.photos/seed/ch${hotel.id}a/800/600`,
    `https://picsum.photos/seed/ch${hotel.id}b/800/600`,
    `https://picsum.photos/seed/ch${hotel.id}c/800/600`,
  ];

  return (
    <>
      <Navbar />
      <LightboxModal
        lightbox={lightbox}
        onClose={() => setLightbox(null)}
        onPrev={() => setLightbox(lb => lb ? { ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length } : lb)}
        onNext={() => setLightbox(lb => lb ? { ...lb, index: (lb.index + 1) % lb.images.length } : lb)}
        onGoTo={(i) => setLightbox(lb => lb ? { ...lb, index: i } : lb)}
      />

      {showModal && (
        <div className="reserv-overlay" onClick={() => setShowModal(false)}>
          <div className="reserv-modal" onClick={e => e.stopPropagation()}>
            <div className="reserv-modal-header">
              <div>
                <p className="reserv-modal-chambre">Chambre standard</p>
                <p className="reserv-modal-hotel">{hotel.name}</p>
              </div>
              <button className="reserv-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="reserv-modal-body">
              {alreadyBooked && (
                <div className="reserv-dates-bloquees reserv-dates-bloquees--same">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Vous avez déjà réservé cet hôtel du 8 au 13 juin 2026.
                </div>
              )}
              <div className="reserv-dates-row">
                <div className="reserv-field">
                  <label className="reserv-label">Arrivée</label>
                  <input type="date" className="reserv-input" value={arrivee} min="2026-06-08" max="2026-06-12"
                    onChange={e => setArrivee(e.target.value)} disabled={alreadyBooked} />
                </div>
                <span className="reserv-arrow">→</span>
                <div className="reserv-field">
                  <label className="reserv-label">Départ</label>
                  <input type="date" className="reserv-input" value={depart} min={arrivee} max="2026-06-13"
                    onChange={e => setDepart(e.target.value)} disabled={alreadyBooked} />
                </div>
              </div>
              <div className="reserv-nuits-row">
                <span className="reserv-nuits-label">Durée du séjour</span>
                <div className="reserv-nuits-counter">
                  <button className="reserv-nuits-btn" onClick={removeNuit} disabled={nuits <= 1 || alreadyBooked}>−</button>
                  <span className="reserv-nuits-val">{nuits} nuit{nuits > 1 ? "s" : ""}</span>
                  <button className="reserv-nuits-btn" onClick={addNuit} disabled={alreadyBooked}>+</button>
                </div>
              </div>
              {pdjActif && !alreadyBooked && (
                <p className="reserv-pdj-info">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#01b285" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>
                  Petit déjeuner inclus (+{hotel.breakfast_price} € / nuit)
                </p>
              )}
            </div>
            <div className="reserv-modal-footer">
              <div className="reserv-total">
                <span className="reserv-total-label">Total</span>
                <span className="reserv-total-montant">{nuits > 0 ? total : "—"} {nuits > 0 ? "€" : ""}</span>
                {nuits > 0 && <span className="reserv-total-detail">({nuits} nuit{nuits > 1 ? "s" : ""} × {prixNuit} €)</span>}
              </div>
              {alreadyBooked ? (
                <button className="reserv-confirm-btn reserv-confirm-btn--already" disabled>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Déjà réservé
                </button>
              ) : (
                <button className="reserv-confirm-btn" disabled={nuits <= 0 || reserving} onClick={async () => {
                  if (!user) { navigate('/connexion'); return; }
                  setReserving(true);
                  try {
                    const existing = (user.hotel_bookings ?? []).map(b => ({ hotel: `/api/hotels/${b.hotel.id}`, nights: b.nights, breakfast: b.breakfast, check_in_date: b.check_in_date }));
                    await apiPatch(`/api/attendees/${user.id}`, {
                      hotel_bookings: [...existing, { hotel: `/api/hotels/${hotel.id}`, nights: nuits, breakfast: pdjActif, check_in_date: arrivee }],
                    });
                    await updateUser();
                    toast(`Chambre réservée avec succès à ${hotel.name} !`);
                    setShowModal(false);
                  } catch {
                    toast("Une erreur est survenue, veuillez réessayer.");
                  } finally {
                    setReserving(false);
                  }
                }}>
                  {reserving ? "Réservation en cours…" : "Confirmer la réservation"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="single-header-spacer" />

      <div className="single-breadcrumb">
        <Link to="/" className="breadcrumb-link">Accueil</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to="/hotels" className="breadcrumb-link">Nos hôtels</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{hotel.name}</span>
      </div>

      <section className="single-hero">
        <div className="single-swiper-wrapper">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            loop={true}
            onSwiper={(s) => { swiperRef.current = s; updateState(s); }}
            onSlideChange={(s) => updateState(s)}
            className="single-swiper"
          >
            {images.map((src, i) => (
              <SwiperSlide key={i}>
                <img src={src} alt={hotel.name} className="single-swiper-img" />
              </SwiperSlide>
            ))}
          </Swiper>
          <button className="hotel-nav-btn hotel-nav-btn--prev" onClick={() => swiperRef.current?.slidePrev()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="hotel-nav-btn hotel-nav-btn--next" onClick={() => swiperRef.current?.slideNext()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="single-info">
          <Etoiles n={parseStars(hotel.category)} />
          <h1 className="single-titre">{hotel.name}</h1>
          <p className="single-lieu">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {hotel.address}
          </p>
          {hotel.description && <p className="single-texte">{hotel.description}</p>}
          <BtnVert text="+33 6 12 34 56 78" lien="tel:+33612345678" />
        </div>
      </section>

      <section className="single-chambres">
        <h2 className="single-chambres-titre">Nos chambres</h2>
        <div className="single-chambres-grid">
          <div className="chambre-card">
            <div className="chambre-card-img-wrapper" onClick={() => setLightbox({ images: chambreImages, index: 0 })}>
              <img src={chambreImages[0]} alt="Chambre" className="chambre-card-img" />
              <div className="chambre-card-img-overlay">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Voir les photos</span>
              </div>
            </div>
            <div className="chambre-card-body">
              <div className="chambre-card-content">
                <h3 className="chambre-card-nom">Chambre standard</h3>
                <p className="chambre-card-desc">
                  Chambre confortable équipée d'un lit double, salle de bain privative, Wi-Fi gratuit et climatisation. Idéale pour les congressistes souhaitant allier confort et praticité.
                </p>
                <div className="chambre-card-meta">
                  <span className="chambre-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5"/><path d="M4 11h16"/></svg>
                    1 lit double
                  </span>
                  <span className="chambre-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    2 pers.
                  </span>
                </div>
              </div>
              <div className="chambre-card-footer">
                <label className="chambre-pdj">
                  <input type="checkbox" checked={pdjActif} onChange={() => setPdjActif(p => !p)} className="chambre-pdj-input" />
                  <span className="chambre-pdj-box">
                    {pdjActif && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 6 5 9 10 3" />
                      </svg>
                    )}
                  </span>
                  <span className="chambre-pdj-label">Petit déjeuner inclus <span className="chambre-pdj-prix">+{hotel.breakfast_price} €</span></span>
                </label>
                <div className="chambre-card-right">
                  <div className="chambre-card-prix">
                    <span className="chambre-prix-label">À partir de</span>
                    <strong>{hotel.night_price + (pdjActif ? hotel.breakfast_price : 0)} €</strong>
                    <span className="chambre-prix-nuit">/ nuit</span>
                  </div>
                  <BtnVert text={alreadyBooked ? "Déjà réservé" : "Réserver"} lien="#" withTel={false} onClick={() => setShowModal(true)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Faq />
      <Footer />
    </>
  );
};

export default HotelSingle;
