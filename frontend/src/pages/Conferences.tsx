import "./Conferences.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../partials/Navbar";
import Faq from "../components/Faq";
import Footer from "../partials/Footer";
import BtnVert from "../components/BtnVert";
import BtnBleu from "../components/BtnBleu";

const conferences = [
  {
    image: "https://picsum.photos/seed/conf1/600/400",
    heure: "09h00 – 10h30",
    sujet: "Innovations en cardiologie interventionnelle",
    participants: 120,
    placesRestantes: 14,
  },
  {
    image: "https://picsum.photos/seed/conf2/600/400",
    heure: "11h00 – 12h30",
    sujet: "Neurologie : avancées thérapeutiques 2025",
    participants: 80,
    placesRestantes: 32,
  },
  {
    image: "https://picsum.photos/seed/conf3/600/400",
    heure: "14h00 – 15h30",
    sujet: "Chirurgie robotique : retours d'expérience",
    participants: 60,
    placesRestantes: 5,
  },
  {
    image: "https://picsum.photos/seed/conf4/600/400",
    heure: "16h00 – 17h30",
    sujet: "Intelligence artificielle en imagerie médicale",
    participants: 150,
    placesRestantes: 48,
  },
  {
    image: "https://picsum.photos/seed/conf5/600/400",
    heure: "09h30 – 11h00",
    sujet: "Dermatologie pédiatrique : cas cliniques",
    participants: 90,
    placesRestantes: 21,
  },
  {
    image: "https://picsum.photos/seed/conf6/600/400",
    heure: "13h30 – 15h00",
    sujet: "Oncologie : nouvelles approches immunothérapeutiques",
    participants: 200,
    placesRestantes: 0,
  },
];

const Conferences = () => {
  const [reserved, setReserved] = useState<Set<number>>(new Set());

  const handleReserver = (i: number) => {
    setReserved(prev => new Set(prev).add(i));
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
        <p className="conf-header-sous">Retrouvez l'ensemble des sessions scientifiques du congrès de Limoges. Réservez votre place avant qu'il ne soit trop tard.</p>
        <BtnVert text="+33 6 12 34 56 78" lien="tel:+33612345678" />
      </header>

      <section className="conf-grid">
        {conferences.map((c, i) => (
          <div key={i} className="conf-card">
            <div className="conf-card-img-wrapper">
              <img src={c.image} alt={c.sujet} className="conf-card-img" />
            </div>
            <div className="conf-card-body">
              <span className="conf-card-heure">{c.heure}</span>
              <h3 className="conf-card-sujet">{c.sujet}</h3>
              <div className="conf-card-meta">
                <span>{c.participants} participants</span>
                <span className={c.placesRestantes === 0 ? "conf-card-complet" : c.placesRestantes <= 10 ? "conf-card-urgent" : ""}>
                  {c.placesRestantes === 0 ? "Complet" : `${c.placesRestantes} places restantes`}
                </span>
              </div>
              {reserved.has(i) ? (
                <div className="conf-card-reserved-row">
                  <button className="btn-reserved">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Réservé
                  </button>
                  <button className="btn-annuler" onClick={() => setReserved(prev => { const s = new Set(prev); s.delete(i); return s; })}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Annuler
                  </button>
                </div>
              ) : (
                <BtnBleu text="Réserver ma place" lien="#" onClick={() => handleReserver(i)} />
              )}
            </div>
          </div>
        ))}
      </section>

      <Faq />
      <Footer />
    </>
  );
};

export default Conferences;
