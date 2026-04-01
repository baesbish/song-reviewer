import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const STEPS = [
  { num: "01", title: "Foundation", desc: "Set the album metadata — artist, title, cover art, and a review tag like 'First Listen' or 'Anniversary'." },
  { num: "02", title: "Scope", desc: "Define the tracklist. Every track you add will become a dedicated critique canvas." },
  { num: "03", title: "Deep Dive", desc: "Score each track across five criteria: Lyrics, Production, Vocals, Composition, and Emotion." },
  { num: "04", title: "Final Verdict", desc: "Rate cohesiveness and replay value. The system calculates a weighted final score and publishes your review." },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    // Placeholder data for the UI.
    const loadPlaceholderData = () => {
      const dummyData = [
        { id: "1", title: "Midnight Marauders", artist: "A Tribe Called Quest", cover_url: "", tag: "Classic", final_score: 9.8 },
        { id: "2", title: "In Rainbows", artist: "Radiohead", cover_url: "", tag: "Retrospective", final_score: 9.5 },
        { id: "3", title: "To Pimp a Butterfly", artist: "Kendrick Lamar", cover_url: "", tag: "Deep Dive", final_score: 10.0 }
      ];
      setFeatured(dummyData);
    };
    
    loadPlaceholderData();
  }, []);

  return (
    <div className="px-8 max-w-5xl mx-auto">

      {/* Hero */}
      <section className="py-24 md:py-36 border-b border-foreground/5">
        <p className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground mb-6">
          Vinyl Critique
        </p>
        <h1 className="font-display text-6xl md:text-8xl font-bold leading-[0.9] tracking-tight mb-8 max-w-2xl">
          Music criticism, procedurally scored.
        </h1>
        <p className="font-body text-sm leading-relaxed text-foreground/60 max-w-lg mb-12">
          A structured review engine for albums. Score every track across five criteria, then layer in holistic metrics to produce a weighted, defensible final verdict — not just a gut feeling.
        </p>
        {/* UPDATED: Link now points to /start */}
        <Link
          to="/start"
          className="inline-flex items-center gap-3 py-3 border-b border-foreground hover:opacity-50 transition-opacity"
        >
          <span className="font-body text-[10px] tracking-mega uppercase">Begin a Review</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      {/* How It Works */}
      <section className="py-20 border-b border-foreground/5">
        <p className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground mb-12">
          How It Works
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {STEPS.map((step) => (
            <div key={step.num} className="flex gap-6">
              <span className="font-display text-[10px] tracking-mega text-muted-foreground shrink-0 mt-1">
                {step.num}
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
                <p className="font-body text-sm leading-relaxed text-foreground/60">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Reviews */}
      {featured.length > 0 && (
        <section className="py-20">
          <div className="flex items-center justify-between mb-12">
            <p className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground">
              Highest Rated
            </p>
            <Link
              to="/archive"
              className="font-body text-[10px] tracking-mega uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Full Archive →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
            {featured.map((album) => (
              <Link key={album.id} to={`/review/${album.id}`} className="group block">
                <div className="aspect-square bg-secondary mb-4 overflow-hidden">
                  {album.cover_url ? (
                    <img
                      src={album.cover_url}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-display text-6xl font-bold text-foreground/5">{album.title?.[0]}</span>
                    </div>
                  )}
                </div>
                {album.tag && (
                  <span className="inline-block font-body text-[9px] tracking-mega uppercase text-muted-foreground border border-foreground/10 px-2 py-0.5 mb-2">
                    {album.tag}
                  </span>
                )}
                <h2 className="font-display text-lg font-semibold leading-tight mb-1 group-hover:opacity-60 transition-opacity">
                  {album.title}
                </h2>
                <p className="font-body text-[10px] tracking-mega uppercase text-muted-foreground mb-2">
                  {album.artist}
                </p>
                {album.final_score > 0 && (
                  <span className="font-display text-2xl font-light tabular-nums">
                    {album.final_score.toFixed(1)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}