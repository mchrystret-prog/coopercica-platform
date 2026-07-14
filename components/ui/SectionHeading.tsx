type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: Props) {
  return (
    <div className={`section-heading ${light ? "section-heading--light" : ""}`}>
      <div>
        <span className="eyebrow">{eyebrow.toUpperCase()}</span>
        <h2>{title.toUpperCase()}</h2>
      </div>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
