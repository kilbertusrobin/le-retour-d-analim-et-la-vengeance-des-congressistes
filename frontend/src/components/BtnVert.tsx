import telIcon from "../assets/images/tel.svg";

interface BtnVertProps {
  text: string;
  lien: string;
  withTel?: boolean;
}

const BtnVert = ({ text, lien, withTel = true }: BtnVertProps) => {
  return (
    <a href={lien} className="btn-vert">
      {withTel && (
        <img src={telIcon} alt="" width={16} height={16} style={{ marginRight: "4px", filter: "brightness(0) invert(1)" }} />
      )}
      {text}
    </a>
  );
};

export default BtnVert;
