import telIcon from "../assets/images/tel.svg";

interface BtnVertProps {
  text: string;
  lien: string;
}

const BtnVert = ({ text, lien }: BtnVertProps) => {
  return (
    <a href={lien} className="btn-vert">
      <img src={telIcon} alt="" width={16} height={16} style={{ marginRight: "4px", filter: "brightness(0) invert(1)" }} />
      {text}
    </a>
  );
};

export default BtnVert;
