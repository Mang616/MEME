type SectionHeadingProps = {
  kicker?: string;
  title: string;
  note?: string;
  /** meme：居中大字标题；default：左对齐常规标题 */
  tone?: "default" | "meme";
};

export function SectionHeading({ kicker, title, note, tone = "default" }: SectionHeadingProps) {
  const isMeme = tone === "meme";

  return (
    <div className={isMeme ? "meme-section-head" : "section-head"}>
      <div>
        {kicker ? (
          <p className={isMeme ? "meme-section-kicker" : "section-kicker"}>{kicker}</p>
        ) : null}
        <h2 className={isMeme ? "meme-section-title" : "section-title"}>{title}</h2>
      </div>
      {note ? <p className={isMeme ? "meme-section-note" : "section-note"}>{note}</p> : null}
    </div>
  );
}
