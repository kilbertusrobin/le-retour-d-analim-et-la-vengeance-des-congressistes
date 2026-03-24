import "./HeroBanner.css";
import congres from "../assets/images/congres.jpg";
import BtnVert from "./BtnVert";
import BtnBleu from "./BtnBleu";
import noteGoogle from "../assets/images/note-google.svg";
import Partners from "./Partners";

const HeroBanner = () => {
  return (
    <div className="hero-banner" style={{ backgroundImage: `url(${congres})` }}>
      <div className="hero-banner__overlay" />
      <h1 className="h1">Votre séjour de congrès, organisé en quelques clics</h1>
      <p className="p">Réservez votre hôtel, explorez les activités disponibles et planifiez chaque étape de votre séjour en toute simplicité. Une plateforme conçue exclusivement pour les participants au congrès.</p>
      <div className="hero-banner__actions">
        <div className="btn-wrapper">
          <BtnVert text="+33 6 12 34 56 78" lien="tel:+33612345678" />
          <BtnBleu text="Se connecter" lien="#" />
        </div>
        <img src={noteGoogle} alt="Note Google" height={40} style={{ width: "auto" }} />
      </div>
      <Partners />
    </div>
  );
};

export default HeroBanner;
