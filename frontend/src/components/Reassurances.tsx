import "./Reassurances.css";

const items = [
  {
    titre: "Paiement sécurisé",
    texte: "Vos transactions sont protégées par un chiffrement SSL de bout en bout.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    titre: "Support 24/7",
    texte: "Une équipe dédiée disponible à toute heure pour répondre à vos besoins.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6.29 6.29l1.18-.97a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7a2 2 0 0 1 1.7 2.02z" />
      </svg>
    ),
  },
  {
    titre: "Annulation gratuite",
    texte: "Modifiez ou annulez votre réservation sans frais jusqu'à 48h avant.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    titre: "Meilleur prix garanti",
    texte: "Nous vous offrons les tarifs les plus compétitifs pour votre séjour de congrès.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

const Reassurances = () => {
  return (
    <section className="reassurances">
      {items.map((item, i) => (
        <div key={i} className="reassurance-card">
          <div className="reassurance-icon">{item.icon}</div>
          <h3 className="reassurance-titre">{item.titre}</h3>
          <p className="reassurance-texte">{item.texte}</p>
        </div>
      ))}
    </section>
  );
};

export default Reassurances;
