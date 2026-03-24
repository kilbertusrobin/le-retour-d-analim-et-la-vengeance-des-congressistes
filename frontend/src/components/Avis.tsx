import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "./Avis.css";

const avis = [
  {
    nom: "Sophie Marchand",
    profession: "Cardiologue",
    texte: "Une expérience vraiment fluide. J'ai réservé mon hôtel et mes activités en quelques minutes. Idéal pour un congrès chargé.",
    avatar: "https://i.pravatar.cc/80?img=47",
  },
  {
    nom: "Thomas Renard",
    profession: "Chirurgien orthopédiste",
    texte: "La plateforme est très intuitive. Les hôtels proposés étaient parfaitement situés par rapport au lieu du congrès.",
    avatar: "https://i.pravatar.cc/80?img=12",
  },
  {
    nom: "Claire Dupont",
    profession: "Neurologue",
    texte: "J'ai particulièrement apprécié la sélection d'activités. Un vrai plus pour profiter du séjour entre les sessions.",
    avatar: "https://i.pravatar.cc/80?img=32",
  },
  {
    nom: "Marc Leblanc",
    profession: "Pneumologue",
    texte: "Service impeccable, réservation simple et rapide. Je recommande à tous les congressistes.",
    avatar: "https://i.pravatar.cc/80?img=15",
  },
  {
    nom: "Isabelle Fontaine",
    profession: "Dermatologue",
    texte: "Tout était parfaitement organisé. Les confirmations arrivent instantanément et le support est réactif.",
    avatar: "https://i.pravatar.cc/80?img=56",
  },
];

const Etoiles = () => (
  <div className="avis-etoiles">
    {[...Array(5)].map((_, i) => (
      <span key={i}>★</span>
    ))}
  </div>
);

const Avis = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section className="avis-section">
      <div style={{ textAlign: "center" }}>
        <span className="avis-badge">
          <span className="avis-badge-star">★</span>
          Plus de 200 avis
        </span>
      </div>
      <h2 className="avis-title">Ce que disent nos congressistes</h2>
      <div className="avis-swiper-wrapper">
        <button className="avis-nav-btn avis-nav-btn--prev" onClick={() => swiperRef.current?.slidePrev()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <Swiper
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          slidesPerView={3}
          spaceBetween={24}
          loop
          className="avis-swiper"
        >
          {avis.map((a, i) => (
            <SwiperSlide key={i}>
              <div className="avis-card">
                <Etoiles />
                <p className="avis-texte">{a.texte}</p>
                <div className="avis-profil">
                  <img src={a.avatar} alt={a.nom} className="avis-avatar" />
                  <div>
                    <p className="avis-nom">{a.nom}</p>
                    <p className="avis-profession">{a.profession}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <button className="avis-nav-btn avis-nav-btn--next" onClick={() => swiperRef.current?.slideNext()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default Avis;
