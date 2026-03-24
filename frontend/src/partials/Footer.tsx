import "./Footer.css";
import { Link } from "react-router-dom";
import LayoutMaxed from "../components/LayoutMaxed";
import analim from "../assets/images/analim.png";

const Footer = () => {
  return (
    <footer className="footer">
      <LayoutMaxed>
        <div className="footer-inner">
          <div className="footer-brand">
            <img src={analim} alt="Analim" className="footer-logo" />
            <p className="footer-desc">La plateforme de réservation dédiée aux congressistes. Hôtels, activités et conférences à Limoges.</p>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Navigation</h4>
            <ul>
              <li><Link to="/hotels">Nos hôtels</Link></li>
              <li><Link to="/activites">Nos activités</Link></li>
              <li><Link to="/conferences">Les conférences</Link></li>
              <li><a href="#">Réserver votre séjour</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Informations</h4>
            <ul>
              <li><a href="#">Mentions légales</a></li>
              <li><a href="#">Politique de confidentialité</a></li>
              <li><a href="#">CGU</a></li>
              <li><a href="#">Accessibilité</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Contact</h4>
            <ul>
              <li><a href="tel:+33612345678">+33 6 12 34 56 78</a></li>
              <li><a href="mailto:contact@analim.fr">contact@analim.fr</a></li>
              <li>Palais des Congrès de Limoges</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Analim. Tous droits réservés.</p>
        </div>
      </LayoutMaxed>
    </footer>
  );
};

export default Footer;
