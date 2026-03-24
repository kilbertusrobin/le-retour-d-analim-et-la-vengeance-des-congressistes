import "./auth.css";
import { Link } from "react-router-dom";
import analim from "../assets/images/analim.png";

const Inscription = () => {
  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">

        <div className="auth-header">
          <Link to="/"><img src={analim} alt="Analim" className="auth-logo" /></Link>
          <div className="auth-header-text">
            <h1 className="auth-titre">Créer un compte</h1>
            <p className="auth-sous">Rejoignez l'espace congressiste Analim</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="auth-row">
            <div className="auth-field">
              <label className="auth-label">Prénom</label>
              <input type="text" className="auth-input" placeholder="Jean" />
            </div>
            <div className="auth-field">
              <label className="auth-label">Nom</label>
              <input type="text" className="auth-input" placeholder="Dupont" />
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label">Adresse postale</label>
            <input type="text" className="auth-input" placeholder="12 avenue du Palais, 87000 Limoges" />
          </div>
          <div className="auth-field">
            <label className="auth-label">Adresse e-mail</label>
            <input type="email" className="auth-input" placeholder="vous@exemple.fr" />
          </div>
          <div className="auth-row">
            <div className="auth-field">
              <label className="auth-label">Mot de passe</label>
              <input type="password" className="auth-input" placeholder="••••••••" />
            </div>
            <div className="auth-field">
              <label className="auth-label">Confirmer le mot de passe</label>
              <input type="password" className="auth-input" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" className="auth-submit">Créer mon compte</button>
        </form>

        <div className="auth-divider" />

        <div className="auth-footer">
          <span>Déjà inscrit ? <Link to="/connexion" className="auth-link">Se connecter</Link></span>
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

export default Inscription;
