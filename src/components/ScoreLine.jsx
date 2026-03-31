export default function ScoreLine({ score, max = 10, label, size = "default" }) {
  const percentage = (score / max) * 100;
  const isLarge = size === "large";

  return (
    <div className="flex items-center gap-4">
      {label && (
        <span className={`font-body uppercase tracking-mega text-muted-foreground shrink-0 ${isLarge ? 'text-[11px] w-32' : 'text-[10px] w-24'}`}>
          {label}
        </span>
      )}
      <div className="flex-1 relative h-px bg-foreground/10">
        <div
          className="absolute top-0 left-0 h-px bg-foreground transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`font-display font-light tabular-nums shrink-0 ${isLarge ? 'text-lg' : 'text-sm'}`}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}