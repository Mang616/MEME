type MemeHeroPosterProps = {
  chip?: string;
  lines?: readonly string[];
  pill?: string;
  face?: string;
};

const DEFAULT_LINES = ["PLAY", "WITH", "MEME"] as const;

/** 首页 / 下单页共用的 meme 风格 hero 海报 */
export function MemeHeroPoster({
  chip = "READY?",
  lines = DEFAULT_LINES,
  pill = "NO SOLO TODAY",
  face = "M",
}: MemeHeroPosterProps) {
  return (
    <div className="hero-poster" aria-hidden="true">
      <span className="poster-chip">{chip}</span>
      <strong>
        {lines.map((line, index) => (
          <span key={line}>
            {index > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </strong>
      <span className="poster-pill">{pill}</span>
      <span className="poster-face">{face}</span>
    </div>
  );
}
