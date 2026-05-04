import "./auth.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import analim from "../assets/images/analim.png";
import { apiPost } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import type { AuthUser } from "../context/AuthContext";

const Inscription = () => {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", address: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      const newUser = await apiPost<AuthUser>('/api/attendees', {
        first_name: form.firstName,
        last_name: form.lastName,
        address: form.address,
        email: form.email,
        plainPassword: form.password,
        deposit: 0,
      });
      const authRes = await fetch('http://localhost:8000/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      if (!authRes.ok) throw new Error('Login failed');
      const { token } = await authRes.json();
      loginWithToken(token, newUser);
      navigate("/profil");
    } catch (err: unknown) {
      const e = err as { data?: { detail?: string; violations?: { message: string }[] } };
      const detail = e?.data?.violations?.[0]?.message ?? e?.data?.detail ?? "Une erreur est survenue.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

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

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-row">
            <div className="auth-field">
              <label className="auth-label">Prénom</label>
              <input type="text" className="auth-input" placeholder="Jean" value={form.firstName} onChange={set("firstName")} required />
            </div>
            <div className="auth-field">
              <label className="auth-label">Nom</label>
              <input type="text" className="auth-input" placeholder="Dupont" value={form.lastName} onChange={set("lastName")} required />
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label">Adresse postale</label>
            <input type="text" className="auth-input" placeholder="12 avenue du Palais, 87000 Limoges" value={form.address} onChange={set("address")} required />
          </div>
          <div className="auth-field">
            <label className="auth-label">Adresse e-mail</label>
            <input type="email" className="auth-input" placeholder="vous@exemple.fr" value={form.email} onChange={set("email")} required />
          </div>
          <div className="auth-row">
            <div className="auth-field">
              <label className="auth-label">Mot de passe</label>
              <input type="password" className="auth-input" placeholder="••••••••" value={form.password} onChange={set("password")} required />
            </div>
            <div className="auth-field">
              <label className="auth-label">Confirmer le mot de passe</label>
              <input type="password" className="auth-input" placeholder="••••••••" value={form.confirm} onChange={set("confirm")} required />
            </div>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Création en cours…" : "Créer mon compte"}
          </button>
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
