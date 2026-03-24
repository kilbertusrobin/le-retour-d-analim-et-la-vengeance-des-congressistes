import telIcon from "../assets/images/tel.svg";

interface BtnBleuProps {
  text: string;
  lien: string;
  withTel?: boolean;
}

const BtnBleu = ({ text, lien, withTel = false }: BtnBleuProps) => {
  return (
    <a href={lien} className="btn-bleu">
      {withTel && (
        <img src={telIcon} alt="" width={16} height={16} style={{ marginRight: "8px", filter: "brightness(0) invert(1)" }} />
      )}
      {text}
    </a>
  );
};

export default BtnBleu;
