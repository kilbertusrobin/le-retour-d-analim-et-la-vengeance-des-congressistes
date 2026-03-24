import "./Partners.css";

const partnerLogos = Object.values(
  import.meta.glob("../assets/images/partners/*", { eager: true, as: "url" })
);

const Partners = () => {
  return (
    <div className="partners">
      {partnerLogos.map((src, i) => (
        <img
            key={i}
            src={src}
            alt={`Partenaire ${i + 1}`}
            height={i === 0 ? 70 : i === 2 ? 40 : 55}
            style={{ width: "auto", marginLeft: i === 2 ? "16px" : undefined }}
          />
      ))}
    </div>
  );
};

export default Partners;
