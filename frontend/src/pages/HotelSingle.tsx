import "./HotelSingle.css";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import Navbar from "../partials/Navbar";
import Faq from "../components/Faq";
import Footer from "../partials/Footer";
import BtnVert from "../components/BtnVert";

const hotel = {
  nom: "Hôtel Royal Limoges",
  etoiles: 5,
  lieu: "Centre-ville, Limoges",
  texte: "Situé en plein cœur de Limoges, à deux pas du Palais des Congrès, l'Hôtel Royal vous accueille dans un cadre élégant et raffiné. Profitez d'un service 5 étoiles, d'un spa, d'un restaurant gastronomique et d'une vue imprenable sur la vieille ville. Un établissement d'exception pour un séjour de congrès inoubliable.",
  images: [
    "https://picsum.photos/seed/hs1a/800/600",
    "https://picsum.photos/seed/hs1b/800/600",
    "https://picsum.photos/seed/hs1c/800/600",
    "https://picsum.photos/seed/hs1d/800/600",
  ],
  chambres: [
    {
      nom: "Chambre Standard",
      description: "Chambre confortable avec vue sur cour, lit double, salle de bain privative. Idéale pour un séjour court.",
      superficie: 22,
      capacite: 2,
      lits: "1 lit double",
      prix: 189,
      prixPdj: 18,
      images: [
        "https://picsum.photos/seed/ch1a/800/600",
        "https://picsum.photos/seed/ch1b/800/600",
        "https://picsum.photos/seed/ch1c/800/600",
      ],
    },
    {
      nom: "Chambre Supérieure",
      description: "Chambre spacieuse avec vue sur la ville, lit king-size, baignoire balnéo et espace de travail.",
      superficie: 30,
      capacite: 2,
      lits: "1 lit king-size",
      prix: 249,
      prixPdj: 18,
      images: [
        "https://picsum.photos/seed/ch2a/800/600",
        "https://picsum.photos/seed/ch2b/800/600",
        "https://picsum.photos/seed/ch2c/800/600",
      ],
    },
    {
      nom: "Suite Junior",
      description: "Suite avec salon séparé, vue panoramique, minibar, peignoirs et accès spa inclus.",
      superficie: 45,
      capacite: 2,
      lits: "1 lit king-size",
      prix: 349,
      prixPdj: 22,
      images: [
        "https://picsum.photos/seed/ch3a/800/600",
        "https://picsum.photos/seed/ch3b/800/600",
        "https://picsum.photos/seed/ch3c/800/600",
      ],
    },
    {
      nom: "Suite Prestige",
      description: "Notre plus belle suite, terrasse privée, jacuzzi, service de conciergerie dédié 24h/24.",
      superficie: 65,
      capacite: 3,
      lits: "1 lit king-size + canapé-lit",
      prix: 499,
      prixPdj: 22,
      images: [
        "https://picsum.photos/seed/ch4a/800/600",
        "https://picsum.photos/seed/ch4b/800/600",
        "https://picsum.photos/seed/ch4c/800/600",
      ],
    },
  ],
};

const Etoiles = ({ n }: { n: number }) => (
  <div className="single-etoiles">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={i < n ? "etoile-on" : "etoile-off"}>★</span>
    ))}
  </div>
);

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
      <button className="lightbox-close" onClick={onClose}>
        ✕
      </button>

      <button
        className="lightbox-nav lightbox-nav--prev"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
      >
        <svg width="22" height="22" viewBox="7 4 10 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="lightbox-img-wrapper" onClick={(e) => e.stopPropagation()}>
        <img src={images[index]} alt="" className="lightbox-img" />
        <span className="lightbox-counter">{index + 1} / {images.length}</span>
      </div>

      <button
        className="lightbox-nav lightbox-nav--next"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
      >
        <svg width="22" height="22" viewBox="7 4 10 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div className="lightbox-thumbs" onClick={(e) => e.stopPropagation()}>
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className={`lightbox-thumb ${i === index ? "lightbox-thumb--active" : ""}`}
            onClick={() => onGoTo(i)}
          />
        ))}
      </div>
    </div>
  );
};

const HotelSingle = () => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [pdj, setPdj] = useState<Record<number, boolean>>({});
  const [lightbox, setLightbox] = useState<Lightbox>(null);

  const updateState = (s: SwiperType) => {
    setIsBeginning(s.isBeginning);
    setIsEnd(s.isEnd);
  };

  const openLightbox = (images: string[], index = 0) => setLightbox({ images, index });
  const closeLightbox = () => setLightbox(null);
  const prevLightbox = () => setLightbox(lb => lb ? { ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length } : lb);
  const nextLightbox = () => setLightbox(lb => lb ? { ...lb, index: (lb.index + 1) % lb.images.length } : lb);
  const goToLightbox = (i: number) => setLightbox(lb => lb ? { ...lb, index: i } : lb);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
      if (e.key === "ArrowRight") nextLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <>
      <Navbar />
      <LightboxModal lightbox={lightbox} onClose={closeLightbox} onPrev={prevLightbox} onNext={nextLightbox} onGoTo={goToLightbox} />

      <div className="single-header-spacer" />

      <div className="single-breadcrumb">
        <Link to="/" className="breadcrumb-link">Accueil</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to="/hotels" className="breadcrumb-link">Nos hôtels</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{hotel.nom}</span>
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
            {hotel.images.map((src, i) => (
              <SwiperSlide key={i}>
                <img src={src} alt={hotel.nom} className="single-swiper-img" />
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
          <Etoiles n={hotel.etoiles} />
          <h1 className="single-titre">{hotel.nom}</h1>
          <p className="single-lieu">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {hotel.lieu}
          </p>
          <p className="single-texte">{hotel.texte}</p>
          <BtnVert text="+33 6 12 34 56 78" lien="tel:+33612345678" />
        </div>
      </section>

      <section className="single-chambres">
        <h2 className="single-chambres-titre">Nos chambres</h2>
        <div className="single-chambres-grid">
          {hotel.chambres.map((c, i) => {
            const pdjActif = !!pdj[i];
            const total = c.prix + (pdjActif ? c.prixPdj : 0);
            return (
              <div key={i} className="chambre-card">
                <div className="chambre-card-img-wrapper" onClick={() => openLightbox(c.images, 0)}>
                  <img src={c.images[0]} alt={c.nom} className="chambre-card-img" />
                  <div className="chambre-card-img-overlay">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>Voir les {c.images.length} photos</span>
                  </div>
                </div>
                <div className="chambre-card-body">
                  <div className="chambre-card-content">
                    <h3 className="chambre-card-nom">{c.nom}</h3>
                    <p className="chambre-card-desc">{c.description}</p>
                    <div className="chambre-card-meta">
                      <span className="chambre-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                        {c.superficie} m²
                      </span>
                      <span className="chambre-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        {c.capacite} pers.
                      </span>
                      <span className="chambre-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5"/><path d="M4 11h16"/></svg>
                        {c.lits}
                      </span>
                    </div>
                  </div>
                  <div className="chambre-card-footer">
                    <label className="chambre-pdj">
                      <input
                        type="checkbox"
                        checked={pdjActif}
                        onChange={() => setPdj(prev => ({ ...prev, [i]: !prev[i] }))}
                        className="chambre-pdj-input"
                      />
                      <span className="chambre-pdj-box">
                        {pdjActif && (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="2 6 5 9 10 3" />
                          </svg>
                        )}
                      </span>
                      <span className="chambre-pdj-label">Petit déjeuner inclus <span className="chambre-pdj-prix">+{c.prixPdj} €</span></span>
                    </label>
                    <div className="chambre-card-right">
                      <div className="chambre-card-prix">
                        <span className="chambre-prix-label">À partir de</span>
                        <strong>{total} €</strong>
                        <span className="chambre-prix-nuit">/ nuit</span>
                      </div>
                      <BtnVert text="Réserver" lien="#" withTel={false} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Faq />
      <Footer />
    </>
  );
};

export default HotelSingle;
