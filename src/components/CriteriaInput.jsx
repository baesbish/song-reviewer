import { useState } from "react";

const SCORE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function CriteriaInput({ label, score, review, onScoreChange, onReviewChange }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="py-6 border-b border-foreground/5 last:border-0">
      <div className="flex items-center justify-between mb-4">
        <span className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground">
          {label}
        </span>
        <span className="font-display text-2xl font-light tabular-nums">
          {score || "—"}
        </span>
      </div>

      {/* Score selector - minimalist dots */}
      <div className="flex items-center gap-1 mb-5">
        {SCORE_VALUES.map((val) => (
          <button
            key={val}
            onClick={() => onScoreChange(val)}
            className="group flex-1 flex flex-col items-center gap-1.5 py-1"
          >
            <div
              className={`h-px w-full transition-all duration-300 ${
                score >= val ? "bg-foreground" : "bg-foreground/10 group-hover:bg-foreground/30"
              }`}
            />
            <span className={`text-[9px] font-body tabular-nums transition-colors ${
              score === val ? "text-foreground" : "text-foreground/20 group-hover:text-foreground/50"
            }`}>
              {val}
            </span>
          </button>
        ))}
      </div>

      {/* Micro-review textarea */}
      <div className={`transition-all duration-300 ${isFocused ? "opacity-100" : "opacity-70"}`}>
        <textarea
          value={review || ""}
          onChange={(e) => onReviewChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={`Justify your ${label.toLowerCase()} score...`}
          rows={3}
          className="w-full bg-transparent border-0 border-b border-foreground/10 focus:border-foreground/30 resize-none text-sm font-body leading-relaxed placeholder:text-foreground/20 focus:outline-none transition-colors py-2"
        />
      </div>
    </div>
  );
}