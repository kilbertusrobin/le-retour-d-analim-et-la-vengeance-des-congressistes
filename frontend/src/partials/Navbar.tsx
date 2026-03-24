import { useEffect, useState } from "react";
import LayoutMaxed from "../components/LayoutMaxed";
import "./Navbar.css";
import analim from "../assets/images/analim.png";
import BtnVert from "../components/BtnVert";
import BtnBleu from "../components/BtnBleu";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY >= 20);
      setPastHero(window.scrollY >= window.innerHeight);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <LayoutMaxed className={`navbar-fixed ${scrolled ? "navbar-scrolled" : ""} ${pastHero ? "navbar-light" : ""}`}>
      <nav>
        <img src={analim} alt="Analim logo" className="logo" />
        <div className="nav-links">
          <p className="nav-link">Nos hôtels</p>
          <p className="nav-link">Nos activités</p>
          <p className="nav-link">Les conférences</p>
          <p className="nav-link">Réserver votre séjour</p>
        </div>
        <div className="btn-wrapper">
          <BtnVert text="+33 6 12 34 56 78" lien="tel:+33612345678" />
          <BtnBleu text="Se connecter" lien="#" />
        </div>
      </nav>
    </LayoutMaxed>
  );
};

export default Navbar;
