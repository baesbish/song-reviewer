import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const STEPS = [
  { num: "01", title: "Foundation", desc: "Set the album metadata — artist, title, and cover art via Spotify." },
  { num: "02", title: "Scope", desc: "Define the tracklist. Every track becomes a dedicated critique canvas." },
  { num: "03", title: "Deep Dive", desc: "Score each track across five criteria: Lyrics, Production, Vocals, Composition, and Emotion." },
  { num: "04", title: "Final Verdict", desc: "The system calculates a weighted final score and publishes your review." },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("vinyl_reviews") || "[]");
    const completed = data
      .filter((rev) => rev.status === "completed")
      .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
      .slice(0, 3);

    setFeatured(completed);
  }, []);

  return (
    <div className="px-8 max-w-5xl mx-auto">
      <section className="py-24 md:py-36 border-b border-foreground/5">
        <p className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground mb-6">Vinyl Critique</p>
        <h1 className="font-display text-6xl md:text-8xl font-bold leading-[0.9] tracking-tight mb-8 max-w-2xl">Music criticism, procedurally scored.</h1>
        <p className="font-body text-sm leading-relaxed text-foreground/60 max-w-lg mb-12">A structured review engine. Score every track to produce a weighted, defensible final verdict.</p>
        <Link to="/start" className="inline-flex items-center gap-3 py-3 border-b border-foreground hover:opacity-50 transition-opacity">
          <span className="font-body text-[10px] tracking-mega uppercase">Begin a Review</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      <section className="py-20 border-b border-foreground/5">
        <p className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground mb-12">How It Works</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {STEPS.map((step) => (
            <div key={step.num} className="flex gap-6">
              <span className="font-display text-[10px] tracking-mega text-muted-foreground shrink-0 mt-1">{step.num}</span>
              <div>
                <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
                <p className="font-body text-sm leading-relaxed text-foreground/60">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="py-20">
          <div className="flex items-center justify-between mb-12">
            <p className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground">Highest Rated</p>
            <Link to="/archive" className="font-body text-[10px] tracking-mega uppercase text-muted-foreground hover:text-foreground transition-colors">Full Archive →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
            {featured.map((rev) => (
              <Link key={rev.id} to={`/review/${rev.id}`} className="group block">
                <div className="aspect-square bg-secondary mb-4 overflow-hidden">
                  <img src={rev.albumData.artworkUrl100} alt={rev.albumData.collectionName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                </div>
                <h2 className="font-display text-lg font-semibold leading-tight mb-1">{rev.albumData.collectionName}</h2>
                <p className="font-body text-[10px] tracking-mega uppercase text-muted-foreground mb-2">{rev.albumData.artistName}</p>
                <span className="font-display text-2xl font-light tabular-nums">{(rev.finalScore || 0).toFixed(1)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}