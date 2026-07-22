type Props = {
  eyebrow: string;
  title: string | string[];
  description?: string;
  light?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: Props) {
  const lines = Array.isArray(title) ? title : [title];

  return (
    <div className={`section-heading ${light ? "section-heading--light" : ""}`}>
      <div>
        <span className="eyebrow">{eyebrow.toUpperCase()}</span>

        <h2>
          {lines.map((line, index) => (
            <span key={index}>{line.toUpperCase()}</span>
          ))}
        </h2>
      </div>

      {description ? <p>{description}</p> : null}
    </div>
  );
}