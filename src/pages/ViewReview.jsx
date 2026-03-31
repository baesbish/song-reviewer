import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import TrackReviewCard from "../components/TrackReviewCard";
import FinalVerdict from "../components/FinalVerdict";
import ScoreLine from "../components/ScoreLine";
import { ArrowLeft, RefreshCw } from "lucide-react";

const STORAGE_KEY = "vinyl_reviews";

const loadData = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
};

const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export default function ViewReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [trackReviews, setTrackReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = loadData();
    const found = data.find((a) => a.id === id);

    if (found) {
      setAlbum(found);
      setTrackReviews(
        (found.reviews || []).sort((a, b) => a.track_index - b.track_index)
      );
    }

    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-foreground/10 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-body text-sm text-muted-foreground">Review not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left - Album Cover (permanently anchored) */}
      <div className="lg:w-5/12 lg:h-screen lg:sticky lg:top-0 bg-secondary flex flex-col items-center justify-center p-8 lg:p-12">
        {album.coverUrl ? (
          <img
            src={album.cover_url}
            alt={album.title}
            className="max-w-full max-h-[65vh] object-contain shadow-2xl"
          />
        ) : (
          <div className="w-full max-w-sm aspect-square bg-foreground/5 flex items-center justify-center">
            <span className="font-display text-8xl font-bold text-foreground/5">
              {album.title?.[0]}
            </span>
          </div>
        )}

        {/* Minimal metadata under cover */}
        <div className="mt-8 text-center">
          <p className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground">
            {album.tracklist?.length || 0} Tracks
          </p>
        </div>
      </div>

      {/* Right - Editorial Content (scrollable) */}
      <div className="lg:w-7/12 px-8 lg:px-16 py-12 lg:py-20">
        {/* Back link + Review Again */}
        <div className="flex items-center justify-between mb-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="font-body text-[10px] tracking-mega uppercase">Archive</span>
          </Link>
          <button
            onClick={async () => {
              const data = loadData();

              const newAlbum = {
                id: Date.now().toString(),
                artist: album.artist,
                title: album.title,
                coverUrl: album.coverUrl,
                tracklist: album.tracklist,
                reviews: [],
                status: "draft",
              };

              data.push(newAlbum);
              saveData(data);

              navigate(`/new?album=${newAlbum.id}`);
            }}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="font-body text-[10px] tracking-mega uppercase">Review Again</span>
          </button>
        </div>

        {/* Album Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <p className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground">
              {album.artist}
            </p>
            {album.tag && (
              <span className="font-body text-[9px] tracking-mega uppercase text-muted-foreground border border-foreground/10 px-2 py-0.5">
                {album.tag}
              </span>
            )}
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight mb-6">
            {album.title}
          </h1>

          {/* Final Score - Hero */}
          {album.final_score > 0 && (
            <div className="flex items-baseline gap-3 mt-8">
              <span className="font-display text-8xl md:text-9xl font-light tabular-nums leading-none">
                {album.final_score.toFixed(1)}
              </span>
              <span className="font-body text-[10px] tracking-mega uppercase text-muted-foreground">
                / 10
              </span>
            </div>
          )}
        </div>

        {/* Score Breakdown - Minimalist Lines */}
        {album.final_score > 0 && (
          <div className="mb-16 py-8 border-t border-foreground/5">
            <span className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground block mb-6">
              Score Composition
            </span>
            <div className="space-y-4">
              {album.base_score > 0 && <ScoreLine label="Base Score" score={album.base_score} size="large" />}
              {album.cohesiveness_score > 0 && <ScoreLine label="Cohesiveness" score={album.cohesiveness_score} size="large" />}
              {album.replay_value_score > 0 && <ScoreLine label="Replay Value" score={album.replay_value_score} size="large" />}
            </div>
          </div>
        )}

        {/* Holistic Reviews */}
        {(album.cohesiveness_review || album.replay_value_review) && (
          <div className="mb-16 py-8 border-t border-foreground/5">
            <span className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground block mb-6">
              Holistic Assessment
            </span>
            {album.cohesiveness_review && (
              <div className="mb-8">
                <span className="font-body text-[10px] tracking-mega uppercase text-muted-foreground block mb-2">
                  Cohesiveness
                </span>
                <p className="font-body text-sm leading-relaxed text-foreground/70 max-w-xl">
                  {album.cohesiveness_review}
                </p>
              </div>
            )}
            {album.replay_value_review && (
              <div>
                <span className="font-body text-[10px] tracking-mega uppercase text-muted-foreground block mb-2">
                  Replay Value
                </span>
                <p className="font-body text-sm leading-relaxed text-foreground/70 max-w-xl">
                  {album.replay_value_review}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Track-by-Track Reviews */}
        <div className="border-t border-foreground/5 pt-8">
          <span className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground block mb-8">
            Track-by-Track
          </span>
          {trackReviews.map((review, i) => (
            <TrackReviewCard key={i} trackReview={review} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}