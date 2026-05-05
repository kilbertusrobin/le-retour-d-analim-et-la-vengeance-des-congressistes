import { useState } from "react";
import "./Faq.css";
import BtnBleu from "./BtnBleu";

const questions = [
  {
    question: "Comment réserver un hôtel sur la plateforme ?",
    reponse: "Il vous suffit de créer un compte, de sélectionner votre congrès, puis de choisir parmi les hôtels partenaires disponibles aux dates de votre séjour. La réservation est confirmée instantanément par email.",
  },
  {
    question: "Puis-je annuler ou modifier ma réservation ?",
    reponse: "Oui, toute réservation peut être annulée ou modifiée gratuitement jusqu'à 48h avant la date d'arrivée. Au-delà de ce délai, des frais peuvent s'appliquer selon la politique de l'établissement.",
  },
  {
    question: "Quelles activités sont proposées lors du congrès ?",
    reponse: "Nous proposons une sélection d'activités culturelles, sportives et gastronomiques à proximité du lieu du congrès. Visites guidées, dîners de gala, excursions — tout est pensé pour enrichir votre séjour.",
  },
  {
    question: "Les tarifs sont-ils négociés spécialement pour les congressistes ?",
    reponse: "Oui. Nous négocions des tarifs préférentiels auprès de nos partenaires hôteliers et prestataires d'activités, réservés exclusivement aux participants inscrits au congrès.",
  },
  {
    question: "Comment contacter le support en cas de problème ?",
    reponse: "Notre équipe est disponible 24h/24 et 7j/7 par téléphone, email ou chat en direct depuis votre espace personnel. Nous nous engageons à répondre dans un délai de 30 minutes.",
  },
  {
    question: "La plateforme est-elle accessible depuis mobile ?",
    reponse: "Absolument. La plateforme est entièrement responsive et optimisée pour mobile et tablette, vous permettant de gérer vos réservations où que vous soyez.",
  },
];

const Faq = () => {
  const [ouvert, setOuvert] = useState<number | null>(null);

  return (
    <section className="faq">
      <div className="faq-gauche">
        <h2 className="faq-titre">Une question ?</h2>
        <p className="faq-sous-titre">Notre équipe est disponible pour vous accompagner à chaque étape de votre séjour de congrès.</p>
        <BtnBleu text="+33 6 12 34 56 78" lien="tel:+33612345678" withTel />
      </div>
      <div className="faq-droite">
        {questions.map((q, i) => (
          <div key={i} className={`faq-item ${ouvert === i ? "faq-item--ouvert" : ""}`} onClick={() => setOuvert(ouvert === i ? null : i)}>
            <div className="faq-question">
              <span>{q.question}</span>
              <div className="faq-chevron-wrapper">
                <svg className="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
            <div className="faq-reponse">
              <p>{q.reponse}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Faq;
