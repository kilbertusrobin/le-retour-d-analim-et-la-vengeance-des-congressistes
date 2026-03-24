import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LayoutMaxed from "../components/LayoutMaxed";
import "./Navbar.css";
import analim from "../assets/images/analim.png";
import BtnVert from "../components/BtnVert";
import BtnBleu from "../components/BtnBleu";

const Navbar = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
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

  const isLight = !isHome || pastHero;

  return (
    <LayoutMaxed className={`navbar-fixed ${isHome && scrolled ? "navbar-scrolled" : ""} ${isLight ? "navbar-light" : ""} ${!isHome ? "navbar-not-home" : ""}`}>
      <nav>
        <Link to="/" className="logo-link"><img src={analim} alt="Analim logo" className="logo" /></Link>
        <div className="nav-links">
          <Link to="/hotels" className="nav-link">Nos hôtels</Link>
          <Link to="/activites" className="nav-link">Nos activités</Link>
          <Link to="/conferences" className="nav-link">Les conférences</Link>
          <Link to="/reserver" className="nav-link">Réserver votre séjour</Link>
        </div>
        <div className="btn-wrapper">
          <BtnVert text="+33 6 12 34 56 78" lien="tel:+33612345678" />
          <BtnBleu text="Se connecter" lien="/connexion" />
          <BtnBleu text="Mon profil" lien="/profil" />
        </div>
      </nav>
    </LayoutMaxed>
  );
};

export default Navbar;
