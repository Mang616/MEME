import type { RoadmapPhase } from "@/lib/types";

type RoadmapSectionProps = {
  kicker?: string;
  title: string;
  phases: RoadmapPhase[];
};

export function RoadmapSection({ kicker, title, phases }: RoadmapSectionProps) {
  return (
    <div className="roadmap-section" aria-labelledby="roadmap-title">
      <div className="roadmap-head">
        {kicker ? <p className="roadmap-kicker">{kicker}</p> : null}
        <h2 className="roadmap-title" id="roadmap-title">
          {title}
        </h2>
      </div>
      <div className="roadmap-grid">
        {phases.map((phase) => (
          <article className="roadmap-card" key={phase.phase}>
            <span className="roadmap-clip" aria-hidden="true" />
            <span className="roadmap-phase">{phase.phase}</span>
            <span className="roadmap-icon">{phase.icon ?? "M"}</span>
            <h3>{phase.title}</h3>
            <p>{phase.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
