import ScoreLine from "./ScoreLine";

const CRITERIA = ["lyrics", "production", "vocals", "composition", "emotion"];

export default function TrackReviewCard({ trackReview, index }) {
  const scores = CRITERIA.map((c) => ({
    label: c,
    score: trackReview[`${c}_score`] || 0,
  })).filter((s) => s.score > 0);

  return (
    <div className="py-8 border-b border-foreground/5 last:border-0">
      <div className="flex items-baseline gap-4 mb-1">
        <span className="font-body text-[10px] tracking-mega uppercase text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="font-display text-lg font-medium">
          {trackReview.track_name}
        </h3>
      </div>

      {trackReview.song_score > 0 && (
        <div className="mb-5 mt-3">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl font-light tabular-nums">
              {trackReview.song_score.toFixed(1)}
            </span>
            <span className="font-body text-[10px] tracking-mega uppercase text-muted-foreground">
              / 10
            </span>
          </div>
        </div>
      )}

      {scores.length > 0 && (
        <div className="space-y-3 mb-5">
          {scores.map((s) => (
            <ScoreLine key={s.label} label={s.label} score={s.score} />
          ))}
        </div>
      )}

      {trackReview.unified_review && (
        <div className="space-y-3 max-w-xl">
          {trackReview.unified_review.split("\n\n").map((para, i) => (
            <p key={i} className="font-body text-sm leading-relaxed text-foreground/70">
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}