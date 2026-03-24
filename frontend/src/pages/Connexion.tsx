import "./auth.css";
import { Link } from "react-router-dom";
import analim from "../assets/images/analim.png";

const Connexion = () => {
  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <Link to="/"><img src={analim} alt="Analim" className="auth-logo" /></Link>
          <div className="auth-header-text">
            <h1 className="auth-titre">Connexion</h1>
            <p className="auth-sous">Accédez à votre espace congressiste</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="auth-field">
            <label className="auth-label">Adresse e-mail</label>
            <input type="email" className="auth-input" placeholder="vous@exemple.fr" />
          </div>
          <div className="auth-field">
            <label className="auth-label">Mot de passe</label>
            <input type="password" className="auth-input" placeholder="••••••••" />
          </div>
          <button type="submit" className="auth-submit">Se connecter</button>
        </form>

        <div className="auth-divider" />

        <div className="auth-footer">
          <span>Pas encore de compte ? <Link to="/inscription" className="auth-link">Créer un compte</Link></span>
          <Link to="/" className="auth-back">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Retour à l'accueil
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Connexion;
