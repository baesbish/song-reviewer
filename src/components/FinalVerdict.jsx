import ScoreLine from "./ScoreLine";

export default function FinalVerdict({ album }) {
  return (
    <div className="py-12">
      <div className="mb-12">
        <span className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground block mb-3">
          Final Verdict
        </span>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-7xl font-light tabular-nums leading-none">
            {album.final_score?.toFixed(1) || "—"}
          </span>
          <span className="font-body text-[10px] tracking-mega uppercase text-muted-foreground">
            / 10
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {album.base_score > 0 && (
          <ScoreLine label="Base Score" score={album.base_score} size="large" />
        )}
        {album.cohesiveness_score > 0 && (
          <div>
            <ScoreLine label="Cohesiveness" score={album.cohesiveness_score} size="large" />
            {album.cohesiveness_review && (
              <p className="font-body text-sm leading-relaxed text-foreground/70 mt-3 ml-36 max-w-lg">
                {album.cohesiveness_review}
              </p>
            )}
          </div>
        )}
        {album.replay_value_score > 0 && (
          <div>
            <ScoreLine label="Replay Value" score={album.replay_value_score} size="large" />
            {album.replay_value_review && (
              <p className="font-body text-sm leading-relaxed text-foreground/70 mt-3 ml-36 max-w-lg">
                {album.replay_value_review}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}