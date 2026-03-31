import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import CriteriaInput from "../components/CriteriaInput";
import { ArrowRight, ArrowLeft, Upload, X } from "lucide-react";

const CRITERIA = [
  { key: "lyrics", label: "Lyrics" },
  { key: "production", label: "Production" },
  { key: "vocals", label: "Vocals" },
  { key: "composition", label: "Composition" },
  { key: "emotion", label: "Emotion" },
];

const PHASES = ["foundation", "scope", "deep_dive", "final_verdict"];

export default function NewReview() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const existingAlbumId = urlParams.get("album");

  const [phase, setPhase] = useState("foundation");
  const [loading, setLoading] = useState(!!existingAlbumId);
  const [saving, setSaving] = useState(false);

  // Phase 1 state
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [tag, setTag] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // Phase 2 state
  const [tracklist, setTracklist] = useState([""]);

  // Album record
  const [album, setAlbum] = useState(null);

  // Phase 3 state
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [trackScores, setTrackScores] = useState({});
  const [existingReviews, setExistingReviews] = useState([]);

  // Phase 4 state
  const [cohesivenessScore, setCohesivenessScore] = useState(null);
  const [cohesivenessReview, setCohesivenessReview] = useState("");
  const [replayScore, setReplayScore] = useState(null);
  const [replayReview, setReplayReview] = useState("");

  // Load existing album if resuming
  useEffect(() => {
    if (!existingAlbumId) return;
    const loadAlbum = async () => {
      const albums = await base44.entities.Album.filter({ id: existingAlbumId });
      if (albums.length > 0) {
        const a = albums[0];
        setAlbum(a);
        setArtist(a.artist);
        setTitle(a.title);
        setCoverUrl(a.cover_url || "");
        setTag(a.tag || "");
        setTracklist(a.tracklist?.length > 0 ? a.tracklist : [""]);

        // Load existing track reviews
        const reviews = await base44.entities.TrackReview.filter({ album_id: a.id });
        setExistingReviews(reviews);

        // Determine phase
        if (!a.tracklist || a.tracklist.length === 0) {
          setPhase("scope");
        } else if (a.status === "in_progress") {
          setPhase("deep_dive");
          setCurrentTrackIndex(a.current_track_index || 0);
          // Reconstruct trackScores from existing reviews
          const scores = {};
          reviews.forEach((r) => {
            scores[r.track_index] = {
              lyrics_score: r.lyrics_score,
              lyrics_review: r.lyrics_review,
              production_score: r.production_score,
              production_review: r.production_review,
              vocals_score: r.vocals_score,
              vocals_review: r.vocals_review,
              composition_score: r.composition_score,
              composition_review: r.composition_review,
              emotion_score: r.emotion_score,
              emotion_review: r.emotion_review,
            };
          });
          setTrackScores(scores);

          // If all tracks reviewed, go to final
          if (reviews.length >= a.tracklist.length) {
            setPhase("final_verdict");
            setCurrentTrackIndex(a.tracklist.length - 1);
          }
        }
      }
      setLoading(false);
    };
    loadAlbum();
  }, [existingAlbumId]);

  const handleUploadCover = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setCoverUrl(file_url);
    setUploading(false);
  };

  const handleFoundationNext = async () => {
    if (!artist.trim() || !title.trim()) return;
    setSaving(true);
    if (album) {
      await base44.entities.Album.update(album.id, { artist, title, cover_url: coverUrl, tag });
      setAlbum({ ...album, artist, title, cover_url: coverUrl, tag });
    } else {
      const created = await base44.entities.Album.create({ artist, title, cover_url: coverUrl, tag, status: "drafting" });
      setAlbum(created);
    }
    setSaving(false);
    setPhase("scope");
  };

  const handleScopeNext = async () => {
    const validTracks = tracklist.filter((t) => t.trim());
    if (validTracks.length === 0) return;
    setSaving(true);
    await base44.entities.Album.update(album.id, { tracklist: validTracks, status: "in_progress", current_track_index: 0 });
    setAlbum({ ...album, tracklist: validTracks, status: "in_progress" });
    setTracklist(validTracks);
    setCurrentTrackIndex(0);
    setSaving(false);
    setPhase("deep_dive");
  };

  const getCurrentTrackScores = () => trackScores[currentTrackIndex] || {};

  const updateTrackScore = (criteriaKey, field, value) => {
    setTrackScores((prev) => ({
      ...prev,
      [currentTrackIndex]: {
        ...prev[currentTrackIndex],
        [`${criteriaKey}_${field}`]: value,
      },
    }));
  };

  const computeSongScore = (scores) => {
    const vals = CRITERIA.map((c) => scores[`${c.key}_score`]).filter((v) => v > 0);
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const synthesizeReview = (scores) => {
    const parts = CRITERIA.map((c) => {
      const text = scores[`${c.key}_review`];
      const label = CRITERIA.find((cr) => `${cr.key}_review` === `${c.key}_review`)?.label || c.key;
      return text ? `${label}: ${text}` : null;
    }).filter(Boolean);
    return parts.join("\n\n");
  };

  const handleSubmitTrack = async () => {
    const scores = getCurrentTrackScores();
    const songScore = computeSongScore(scores);
    const unifiedReview = synthesizeReview(scores);

    setSaving(true);

    // Check if review already exists for this track
    const existing = existingReviews.find((r) => r.track_index === currentTrackIndex);
    const reviewData = {
      album_id: album.id,
      track_index: currentTrackIndex,
      track_name: tracklist[currentTrackIndex],
      ...scores,
      song_score: songScore,
      unified_review: unifiedReview,
    };

    if (existing) {
      await base44.entities.TrackReview.update(existing.id, reviewData);
      setExistingReviews((prev) => prev.map((r) => (r.id === existing.id ? { ...r, ...reviewData } : r)));
    } else {
      const created = await base44.entities.TrackReview.create(reviewData);
      setExistingReviews((prev) => [...prev, created]);
    }

    // Move to next track or final verdict
    if (currentTrackIndex < tracklist.length - 1) {
      const next = currentTrackIndex + 1;
      setCurrentTrackIndex(next);
      await base44.entities.Album.update(album.id, { current_track_index: next });
    } else {
      // All tracks reviewed — calculate base score
      const allReviews = [...existingReviews.filter((r) => r.track_index !== currentTrackIndex), { ...reviewData, song_score: songScore }];
      const baseScore = allReviews.reduce((sum, r) => sum + (r.song_score || 0), 0) / allReviews.length;
      await base44.entities.Album.update(album.id, { base_score: baseScore });
      setAlbum((prev) => ({ ...prev, base_score: baseScore }));
      setPhase("final_verdict");
    }
    setSaving(false);
  };

  const handleFinalSubmit = async () => {
    if (!cohesivenessScore || !replayScore) return;
    setSaving(true);

    const baseScore = album.base_score || 0;
    // Weighted: 70% base, 15% cohesiveness, 15% replay
    const finalScore = baseScore * 0.7 + cohesivenessScore * 0.15 + replayScore * 0.15;

    await base44.entities.Album.update(album.id, {
      cohesiveness_score: cohesivenessScore,
      cohesiveness_review: cohesivenessReview,
      replay_value_score: replayScore,
      replay_value_review: replayReview,
      final_score: finalScore,
      status: "completed",
    });

    setSaving(false);
    navigate(`/review/${album.id}`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-foreground/10 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left - Album Cover (sticky on desktop) */}
      <div className="lg:w-1/2 lg:h-screen lg:sticky lg:top-0 bg-secondary flex items-center justify-center p-8">
        {coverUrl ? (
          <img src={coverUrl} alt={title} className="max-w-full max-h-[80vh] object-contain shadow-2xl" />
        ) : (
          <div className="w-full max-w-md aspect-square bg-foreground/5 flex items-center justify-center">
            <span className="font-display text-8xl font-bold text-foreground/5">
              {title?.[0] || "?"}
            </span>
          </div>
        )}
      </div>

      {/* Right - Content */}
      <div className="lg:w-1/2 px-8 lg:px-16 py-12 lg:py-20">
        {/* Phase indicator */}
        <div className="flex items-center gap-4 mb-12">
          {PHASES.map((p, i) => (
            <div key={p} className="flex items-center gap-4">
              <span className={`font-body text-[9px] tracking-mega uppercase transition-colors ${
                phase === p ? "text-foreground" : "text-foreground/15"
              }`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {i < PHASES.length - 1 && <div className="w-6 h-px bg-foreground/10" />}
            </div>
          ))}
        </div>

        {/* Phase 1: Foundation */}
        {phase === "foundation" && (
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-2 leading-none">Foundation</h2>
            <p className="font-body text-[10px] tracking-mega uppercase text-muted-foreground mb-12">
              Establish the visual anchor
            </p>

            <div className="space-y-8">
              {/* Cover Upload */}
              <div>
                <label className="font-body text-[10px] tracking-mega uppercase text-muted-foreground block mb-3">
                  Album Cover
                </label>
                <input type="file" ref={fileRef} accept="image/*" onChange={handleUploadCover} className="hidden" />
                {coverUrl ? (
                  <div className="relative inline-block">
                    <img src={coverUrl} alt="cover" className="w-32 h-32 object-cover" />
                    <button
                      onClick={() => setCoverUrl("")}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-3 py-3 px-5 border border-foreground/10 hover:border-foreground/30 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-body text-[10px] tracking-mega uppercase text-muted-foreground">
                      {uploading ? "Uploading..." : "Upload Cover"}
                    </span>
                  </button>
                )}
              </div>

              {/* Artist */}
              <div>
                <label className="font-body text-[10px] tracking-mega uppercase text-muted-foreground block mb-3">
                  Artist
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Artist name"
                  className="w-full bg-transparent border-0 border-b border-foreground/10 focus:border-foreground/40 text-2xl font-display font-medium placeholder:text-foreground/15 focus:outline-none transition-colors pb-2"
                />
              </div>

              {/* Album Title */}
              <div>
                <label className="font-body text-[10px] tracking-mega uppercase text-muted-foreground block mb-3">
                  Album Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Album title"
                  className="w-full bg-transparent border-0 border-b border-foreground/10 focus:border-foreground/40 text-2xl font-display font-medium placeholder:text-foreground/15 focus:outline-none transition-colors pb-2"
                />
              </div>

              {/* Tag */}
              <div>
                <label className="font-body text-[10px] tracking-mega uppercase text-muted-foreground block mb-3">
                  Review Tag <span className="text-foreground/30">(optional)</span>
                </label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="e.g. First Listen, Deep Cut, Anniversary"
                  className="w-full bg-transparent border-0 border-b border-foreground/10 focus:border-foreground/40 text-sm font-body placeholder:text-foreground/15 focus:outline-none transition-colors pb-2"
                />
              </div>
            </div>

            <button
              onClick={handleFoundationNext}
              disabled={!artist.trim() || !title.trim() || saving}
              className="mt-12 flex items-center gap-3 py-3 border-b border-foreground hover:opacity-60 transition-opacity disabled:opacity-20"
            >
              <span className="font-body text-[10px] tracking-mega uppercase">
                {saving ? "Saving..." : "Continue"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Phase 2: Scope */}
        {phase === "scope" && (
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-2 leading-none">Scope</h2>
            <p className="font-body text-[10px] tracking-mega uppercase text-muted-foreground mb-12">
              Define the tracklist
            </p>

            <div className="space-y-3">
              {tracklist.map((track, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="font-body text-[10px] tracking-mega text-muted-foreground w-6 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <input
                    type="text"
                    value={track}
                    onChange={(e) => {
                      const updated = [...tracklist];
                      updated[i] = e.target.value;
                      setTracklist(updated);
                    }}
                    placeholder="Track name"
                    className="flex-1 bg-transparent border-0 border-b border-foreground/10 focus:border-foreground/30 text-sm font-body placeholder:text-foreground/15 focus:outline-none transition-colors pb-2"
                  />
                  {tracklist.length > 1 && (
                    <button
                      onClick={() => setTracklist(tracklist.filter((_, j) => j !== i))}
                      className="text-foreground/20 hover:text-foreground transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setTracklist([...tracklist, ""])}
              className="mt-4 font-body text-[10px] tracking-mega uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              + Add Track
            </button>

            <div className="flex items-center gap-6 mt-12">
              <button
                onClick={() => setPhase("foundation")}
                className="flex items-center gap-3 py-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="font-body text-[10px] tracking-mega uppercase">Back</span>
              </button>
              <button
                onClick={handleScopeNext}
                disabled={tracklist.filter((t) => t.trim()).length === 0 || saving}
                className="flex items-center gap-3 py-3 border-b border-foreground hover:opacity-60 transition-opacity disabled:opacity-20"
              >
                <span className="font-body text-[10px] tracking-mega uppercase">
                  {saving ? "Saving..." : "Begin Critique"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Phase 3: Deep Dive */}
        {phase === "deep_dive" && tracklist.length > 0 && (
          <div>
            <div className="flex items-baseline gap-4 mb-2">
              <span className="font-body text-[10px] tracking-mega text-muted-foreground">
                Track {String(currentTrackIndex + 1).padStart(2, "0")} / {String(tracklist.length).padStart(2, "0")}
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-12 leading-none">
              {tracklist[currentTrackIndex]}
            </h2>

            <div>
              {CRITERIA.map((c) => (
                <CriteriaInput
                  key={c.key}
                  label={c.label}
                  score={getCurrentTrackScores()[`${c.key}_score`] || null}
                  review={getCurrentTrackScores()[`${c.key}_review`] || ""}
                  onScoreChange={(val) => updateTrackScore(c.key, "score", val)}
                  onReviewChange={(val) => updateTrackScore(c.key, "review", val)}
                />
              ))}
            </div>

            <div className="flex items-center gap-6 mt-12">
              {currentTrackIndex > 0 && (
                <button
                  onClick={() => setCurrentTrackIndex(currentTrackIndex - 1)}
                  className="flex items-center gap-3 py-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="font-body text-[10px] tracking-mega uppercase">Previous</span>
                </button>
              )}
              <button
                onClick={handleSubmitTrack}
                disabled={saving}
                className="flex items-center gap-3 py-3 border-b border-foreground hover:opacity-60 transition-opacity disabled:opacity-20"
              >
                <span className="font-body text-[10px] tracking-mega uppercase">
                  {saving ? "Saving..." : currentTrackIndex < tracklist.length - 1 ? "Next Track" : "Finalize"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Phase 4: Final Verdict */}
        {phase === "final_verdict" && (
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-2 leading-none">The Verdict</h2>
            <p className="font-body text-[10px] tracking-mega uppercase text-muted-foreground mb-4">
              Holistic assessment beyond the tracks
            </p>

            {album?.base_score > 0 && (
              <div className="mb-12 py-6 border-b border-foreground/5">
                <span className="font-body text-[10px] tracking-mega uppercase text-muted-foreground block mb-2">
                  Base Album Score
                </span>
                <span className="font-display text-5xl font-light tabular-nums">
                  {album.base_score.toFixed(1)}
                </span>
              </div>
            )}

            <CriteriaInput
              label="Cohesiveness"
              score={cohesivenessScore}
              review={cohesivenessReview}
              onScoreChange={setCohesivenessScore}
              onReviewChange={setCohesivenessReview}
            />
            <CriteriaInput
              label="Replay Value"
              score={replayScore}
              review={replayReview}
              onScoreChange={setReplayScore}
              onReviewChange={setReplayReview}
            />

            <button
              onClick={handleFinalSubmit}
              disabled={!cohesivenessScore || !replayScore || saving}
              className="mt-12 flex items-center gap-3 py-3 border-b border-foreground hover:opacity-60 transition-opacity disabled:opacity-20"
            >
              <span className="font-body text-[10px] tracking-mega uppercase">
                {saving ? "Calculating..." : "Publish Review"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}