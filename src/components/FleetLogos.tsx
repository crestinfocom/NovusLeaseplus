export default function FleetLogos() {
  const partners = [
    "Maruti Suzuki",
    "Hyundai",
    "Tata",
    "Mahindra",
    "Kia",
    "Toyota",
    "Renault",
  ];
  return (
    <div className="logos">
      <div className="wrap">
        <span className="lbl">Fleet partners</span>
        {partners.map((name) => (
          <span className="brand-name" key={name}>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}