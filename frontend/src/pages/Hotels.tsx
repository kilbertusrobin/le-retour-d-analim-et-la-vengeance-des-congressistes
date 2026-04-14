import "./Hotels.css";
import { useEffect, useRef, useState } from "react";
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
import type { ApiHotel } from "../context/AuthContext";
import { apiGet } from "../utils/api";

type HydraCollection<T> = { 'member': T[] };

const HOTEL_IMAGES: Record<number, string[]> = {};
const getImages = (id: number) => HOTEL_IMAGES[id] ?? [
  `https://picsum.photos/seed/h${id}a/600/400`,
  `https://picsum.photos/seed/h${id}b/600/400`,
  `https://picsum.photos/seed/h${id}c/600/400`,
];

const parseStars = (category: string) => parseInt(category) || 0;

const Etoiles = ({ n }: { n: number }) => (
  <div className="hotel-etoiles">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={i < n ? "etoile-on" : "etoile-off"}>★</span>
    ))}
  </div>
);

const HotelCard = ({ h }: { h: ApiHotel }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const images = getImages(h.id);

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
          {images.map((src, j) => (
            <SwiperSlide key={j}>
              <img src={src} alt={h.name} className="conf-card-img" />
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
        <Etoiles n={parseStars(h.category)} />
        <h3 className="conf-card-sujet">{h.name}</h3>
        <p className="hotel-lieu">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {h.address}
        </p>
        <p className="hotel-prix">À partir de <strong>{h.night_price} €</strong> / nuit</p>
        <BtnBleu text="Voir l'hôtel" lien={`/hotels/${h.id}`} />
      </div>
    </div>
  );
};

const Hotels = () => {
  const [hotels, setHotels] = useState<ApiHotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<HydraCollection<ApiHotel>>('/api/hotels')
      .then(data => setHotels(data['member'] ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        {loading ? (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', padding: '40px' }}>Chargement des hôtels…</p>
        ) : (
          hotels.map(h => <HotelCard key={h.id} h={h} />)
        )}
      </section>

      <Avis />
      <Faq />
      <Footer />
    </>
  );
};

export default Hotels;
