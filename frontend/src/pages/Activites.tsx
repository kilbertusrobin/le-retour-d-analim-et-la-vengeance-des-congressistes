import "./Activites.css";
import { Link } from "react-router-dom";
import Navbar from "../partials/Navbar";
import Avis from "../components/Avis";
import Faq from "../components/Faq";
import Footer from "../partials/Footer";
import BtnVert from "../components/BtnVert";

const activites = [
  {
    nom: "Visite guidée de la Cité de la Céramique",
    categorie: "Culture",
    description: "Découvrez l'histoire de la porcelaine de Limoges à travers une visite commentée du musée national Adrien Dubouché. Un patrimoine unique reconnu dans le monde entier.",
    duree: "2h",
    participants: "Jusqu'à 25 pers.",
    prix: 18,
    image: "https://picsum.photos/seed/act1/600/400",
  },
  {
    nom: "Balade en bord de Vienne",
    categorie: "Nature",
    description: "Profitez d'une promenade guidée le long des berges de la Vienne, entre jardins botaniques et quartiers historiques. Une pause ressourçante au cœur de la ville.",
    duree: "1h30",
    participants: "Jusqu'à 30 pers.",
    prix: 12,
    image: "https://picsum.photos/seed/act2/600/400",
  },
  {
    nom: "Atelier gastronomique limousin",
    categorie: "Gastronomie",
    description: "Initiez-vous aux spécialités culinaires du Limousin avec un chef local. Au programme : clafoutis, pâté Pantin et autres trésors de la cuisine régionale.",
    duree: "3h",
    participants: "Jusqu'à 15 pers.",
    prix: 55,
    image: "https://picsum.photos/seed/act3/600/400",
  },
  {
    nom: "Visite de la cathédrale Saint-Étienne",
    categorie: "Culture",
    description: "Explorez ce chef-d'œuvre gothique du XIIIe siècle, ses vitraux exceptionnels et son jubé Renaissance, accompagné d'un guide conférencier passionné.",
    duree: "1h30",
    participants: "Jusqu'à 30 pers.",
    prix: 10,
    image: "https://picsum.photos/seed/act4/600/400",
  },
  {
    nom: "Soirée vin & fromages du terroir",
    categorie: "Gastronomie",
    description: "Une dégustation conviviale des meilleurs produits du terroir limousin : vins de Corrèze, fromages artisanaux et charcuteries locales dans un cadre chaleureux.",
    duree: "2h",
    participants: "Jusqu'à 40 pers.",
    prix: 35,
    image: "https://picsum.photos/seed/act5/600/400",
  },
  {
    nom: "Escape Game — Le Secret du Congrès",
    categorie: "Divertissement",
    description: "Une expérience immersive en équipe conçue spécialement pour les congressistes. Résolvez les énigmes et découvrez le secret caché dans les archives du palais.",
    duree: "1h",
    participants: "4 à 8 pers.",
    prix: 22,
    image: "https://picsum.photos/seed/act6/600/400",
  },
];

const categorieColors: Record<string, string> = {
  Culture: "#7c3aed",
  Nature: "#01b285",
  Gastronomie: "#e05c00",
  Divertissement: "#02affe",
};

const ActiviteCard = ({ a }: { a: typeof activites[0] }) => (
  <div className="activite-card">
    <div className="activite-card-img-wrapper">
      <img src={a.image} alt={a.nom} className="activite-card-img" />
      <span className="activite-card-categorie" style={{ backgroundColor: categorieColors[a.categorie] ?? "#333" }}>
        {a.categorie}
      </span>
    </div>
    <div className="activite-card-body">
      <h3 className="activite-card-nom">{a.nom}</h3>
      <p className="activite-card-desc">{a.description}</p>
      <div className="activite-card-meta">
        <span className="activite-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {a.duree}
        </span>
        <span className="activite-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {a.participants}
        </span>
      </div>
      <div className="activite-card-footer">
        <p className="activite-card-prix">À partir de <strong>{a.prix} €</strong></p>
        <BtnVert text="Réserver" lien="#" withTel={false} />
      </div>
    </div>
  </div>
);

const Activites = () => {
  return (
    <>
      <Navbar />

      <header className="activites-header">
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Accueil</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Nos activités</span>
        </div>
        <h1 className="activites-header-titre">Nos activités</h1>
        <p className="activites-header-sous">Profitez de votre séjour à Limoges pour découvrir la richesse culturelle et gastronomique de la région. Des expériences soigneusement sélectionnées pour les congressistes.</p>
        <BtnVert text="+33 6 12 34 56 78" lien="tel:+33612345678" />
      </header>

      <section className="activites-grid">
        {activites.map((a, i) => (
          <ActiviteCard key={i} a={a} />
        ))}
      </section>

      <Avis />
      <Faq />
      <Footer />
    </>
  );
};

export default Activites;
