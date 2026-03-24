import "./SectionsEdito.css";
import LayoutMaxed from "./LayoutMaxed";
import BtnBleu from "./BtnBleu";
import hotelImg from "../assets/images/hotel.jpg";
import conferenceImg from "../assets/images/conference.jpg";
import activitesImg from "../assets/images/activites.jpg";

interface SectionEditoProps {
  reverse?: boolean;
  soustitre: string;
  titre: string;
  texte: string;
  btn: string;
  lien: string;
  image: string;
}

export const SectionEdito = ({ reverse = false, soustitre, titre, texte, btn, lien, image }: SectionEditoProps) => {
  return (
    <LayoutMaxed>
      <section className={`edito ${reverse ? "edito--reverse" : ""}`}>
        <div className="edito-texte">
          <h5 className="edito-soustitre">{soustitre}</h5>
          <h2 className="edito-titre">{titre}</h2>
          <p className="edito-corps">{texte}</p>
          <BtnBleu text={btn} lien={lien} />
        </div>
        <div className="edito-image-wrapper">
          <img src={image} alt={titre} className="edito-image" />
        </div>
      </section>
    </LayoutMaxed>
  );
};

export const SectionHotels = () => (
  <SectionEdito
    soustitre="Hébergement"
    titre="Des hôtels sélectionnés pour votre confort"
    texte="Profitez d'une sélection d'établissements partenaires à proximité immédiate du Palais des Congrès de Limoges. Des hôtels 3, 4 et 5 étoiles soigneusement choisis pour leur confort et leur situation géographique, négociés aux meilleurs tarifs et réservés exclusivement aux participants du congrès."
    btn="Voir nos hôtels"
    lien="#"
    image={hotelImg}
  />
);

export const SectionActivites = () => (
  <SectionEdito
    reverse
    soustitre="Loisirs & Culture"
    titre="Découvrez Limoges autrement"
    texte="Entre deux sessions, prenez le temps de découvrir la richesse culturelle et naturelle de Limoges. Visites guidées de la Cité de la Céramique, balades en bord de Vienne, ateliers gastronomiques et sorties en groupe — des expériences variées pensées pour vous ressourcer et profiter pleinement de votre séjour."
    btn="Explorer les activités"
    lien="/activites"
    image={activitesImg}
  />
);

export const SectionConferences = () => (
  <SectionEdito
    soustitre="Programme scientifique"
    titre="Un programme à la hauteur de vos ambitions"
    texte="Retrouvez l'intégralité du programme scientifique du congrès, les intervenants de renom, les ateliers pratiques et les sessions plénières. Accédez aux résumés, planifiez votre agenda personnalisé et ne manquez aucune des conférences qui rythmeront votre séjour à Limoges."
    btn="Voir le programme"
    lien="#"
    image={conferenceImg}
  />
);
