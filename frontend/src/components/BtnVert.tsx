import telIcon from "../assets/images/tel.svg";

interface BtnVertProps {
  text: string;
  lien: string;
  withTel?: boolean;
  onClick?: () => void;
}

const BtnVert = ({ text, lien, withTel = true, onClick }: BtnVertProps) => {
  return (
    <a href={lien} className="btn-vert" onClick={onClick && ((e) => { e.preventDefault(); onClick(); })}>
      {withTel && (
        <img src={telIcon} alt="" width={16} height={16} style={{ marginRight: "4px", filter: "brightness(0) invert(1)" }} />
      )}
      {text}
    </a>
  );
};

export default BtnVert;
