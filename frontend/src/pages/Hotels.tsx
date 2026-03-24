import "./Hotels.css";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import Navbar from "../partials/Navbar";
import Reassurances from "../components/Reassurances";
import Avis from "../components/Avis";
import Faq from "../components/Faq";
import Footer from "../partials/Footer";
import BtnBleu from "../components/BtnBleu";
import BtnVert from "../components/BtnVert";

const hotels = [
  {
    nom: "Hôtel Royal Limoges",
    etoiles: 5,
    lieu: "Centre-ville, Limoges",
    prix: 189,
    images: [
      "https://picsum.photos/seed/h1a/600/400",
      "https://picsum.photos/seed/h1b/600/400",
      "https://picsum.photos/seed/h1c/600/400",
    ],
  },
  {
    nom: "Mercure Limoges Centre",
    etoiles: 4,
    lieu: "Quartier des Bénédictins, Limoges",
    prix: 129,
    images: [
      "https://picsum.photos/seed/h2a/600/400",
      "https://picsum.photos/seed/h2b/600/400",
      "https://picsum.photos/seed/h2c/600/400",
    ],
  },
  {
    nom: "Novotel Limoges",
    etoiles: 4,
    lieu: "Près du Palais des Congrès",
    prix: 115,
    images: [
      "https://picsum.photos/seed/h3a/600/400",
      "https://picsum.photos/seed/h3b/600/400",
      "https://picsum.photos/seed/h3c/600/400",
    ],
  },
  {
    nom: "Ibis Limoges Centre",
    etoiles: 3,
    lieu: "Gare de Limoges",
    prix: 79,
    images: [
      "https://picsum.photos/seed/h4a/600/400",
      "https://picsum.photos/seed/h4b/600/400",
      "https://picsum.photos/seed/h4c/600/400",
    ],
  },
  {
    nom: "Best Western Le Richelieu",
    etoiles: 3,
    lieu: "Bords de Vienne, Limoges",
    prix: 95,
    images: [
      "https://picsum.photos/seed/h5a/600/400",
      "https://picsum.photos/seed/h5b/600/400",
      "https://picsum.photos/seed/h5c/600/400",
    ],
  },
  {
    nom: "Villa Margot",
    etoiles: 4,
    lieu: "Quartier Montjovis, Limoges",
    prix: 145,
    images: [
      "https://picsum.photos/seed/h6a/600/400",
      "https://picsum.photos/seed/h6b/600/400",
      "https://picsum.photos/seed/h6c/600/400",
    ],
  },
];

const Etoiles = ({ n }: { n: number }) => (
  <div className="hotel-etoiles">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={i < n ? "etoile-on" : "etoile-off"}>★</span>
    ))}
  </div>
);

const HotelCard = ({ h, index }: { h: typeof hotels[0]; index: number }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateState = (s: SwiperType) => {
    setIsBeginning(s.isBeginning);
    setIsEnd(s.isEnd);
  };

  return (
    <div className="conf-card">
      <div className="conf-card-img-wrapper hotel-swiper-wrapper">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          onSwiper={(s) => { swiperRef.current = s; updateState(s); }}
          onSlideChange={(s) => updateState(s)}
          className="hotel-swiper"
        >
          {h.images.map((src, j) => (
            <SwiperSlide key={j}>
              <img src={src} alt={h.nom} className="conf-card-img" />
            </SwiperSlide>
          ))}
        </Swiper>
        <button className={`hotel-nav-btn hotel-nav-btn--prev ${isBeginning ? "hotel-nav-btn--disabled" : ""}`} onClick={() => swiperRef.current?.slidePrev()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button className={`hotel-nav-btn hotel-nav-btn--next ${isEnd ? "hotel-nav-btn--disabled" : ""}`} onClick={() => swiperRef.current?.slideNext()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
      <div className="conf-card-body">
        <Etoiles n={h.etoiles} />
        <h3 className="conf-card-sujet">{h.nom}</h3>
        <p className="hotel-lieu">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {h.lieu}
        </p>
        <p className="hotel-prix">À partir de <strong>{h.prix} €</strong> / nuit</p>
        <BtnBleu text="Voir l'hôtel" lien={`/hotels/${index}`} />
      </div>
    </div>
  );
};

const Hotels = () => {
  return (
    <>
      <Navbar />

      <header className="hotels-header">
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Accueil</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Nos hôtels</span>
        </div>
        <h1 className="hotels-header-titre">Nos hôtels</h1>
        <p className="hotels-header-sous">Des établissements soigneusement sélectionnés à proximité du Palais des Congrès de Limoges, aux meilleurs tarifs négociés pour les congressistes.</p>
        <BtnVert text="+33 6 12 34 56 78" lien="tel:+33612345678" />
      </header>

      <Reassurances />

      <section className="hotels-grid">
        {hotels.map((h, i) => (
          <HotelCard key={i} h={h} index={i} />
        ))}
      </section>

      <Avis />
      <Faq />
      <Footer />
    </>
  );
};

export default Hotels;
