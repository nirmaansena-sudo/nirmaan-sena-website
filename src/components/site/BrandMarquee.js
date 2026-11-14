export default function BrandMarquee({ brands }) {
  return (
    <div className="brand-marquee">
      <div className="brand-marquee-window">
        <div className="brand-marquee-track">
          {[0, 1].map((copy) => (
            <ul className="brand-marquee-group" key={copy} role="list" aria-label={copy === 0 ? 'Materials and brands' : undefined} aria-hidden={copy === 1 ? true : undefined}>
              {brands.map((brand) => (
                <li className="brand-marquee-item" key={brand.name}>
                  <img src={brand.logo} alt={copy === 0 ? brand.name : ''} width="180" height="64" loading="lazy" decoding="async" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
