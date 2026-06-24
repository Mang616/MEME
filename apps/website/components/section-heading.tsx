type SectionHeadingProps = {
  kicker: string;
  title: string;
  note?: string;
};

export function SectionHeading({ kicker, title, note }: SectionHeadingProps) {
  return (
    <div className="section-head">
      <div>
        <p className="section-kicker">{kicker}</p>
        <h2 className="section-title">{title}</h2>
      </div>
      {note ? <p className="section-note">{note}</p> : null}
    </div>
  );
}
