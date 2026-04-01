import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, ArrowLeft, Save, Loader2, Edit3, ChevronLeft, Award, RotateCcw } from "lucide-react";
import CriteriaInput from "../components/CriteriaInput";

const STORAGE_KEY = "vinyl_reviews";
const CRITERIA = [
  { key: "lyrics", label: "Lyrics" },
  { key: "production", label: "Production" },
  { key: "vocals", label: "Vocals" },
  { key: "composition", label: "Composition" },
  { key: "emotion", label: "Emotion" },
];

export default function ViewReview() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [phase, setPhase] = useState("deep_dive"); 
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [trackScores, setTrackScores] = useState({});
  const [verdict, setVerdict] = useState({ 
    cohesiveness_score: 0, cohesiveness_review: "", 
    replay_score: 0, replay_review: "" 
  });

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const existing = storedData.find(d => d.id === String(id));

    if (existing) {
      setAlbum(existing.albumData);
      setTracks(existing.tracksData);
      setTrackScores(existing.trackScores || {});
      setVerdict(existing.verdict || verdict);
      
      if (existing.status === "completed") {
        setPhase("published");
      } else {
        setPhase(existing.phase || "deep_dive");
        setCurrentTrackIndex(existing.currentTrackIndex || 0);
      }
      setLoading(false);
    } else if (location.state?.album) {
      const { album: newAlbum, tracks: newTracks } = location.state;
      setAlbum(newAlbum);
      setTracks(newTracks);
      
      const initialScores = {};
      newTracks.forEach((_, index) => { 
        initialScores[index] = {}; 
        CRITERIA.forEach(c => {
          initialScores[index][`${c.key}_score`] = 0;
          initialScores[index][`${c.key}_review`] = "";
        });
      });
      setTrackScores(initialScores);
      setLoading(false);
    } else {
      navigate("/start");
    }
  }, [id]);

  useEffect(() => {
    if (loading || !album || phase === "published") return;
    const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const existingIndex = storedData.findIndex(d => d.id === String(id));
    
    const reviewData = {
      id: String(id),
      albumData: album,
      tracksData: tracks,
      phase,
      currentTrackIndex,
      trackScores,
      verdict,
      status: "draft",
      lastUpdated: Date.now()
    };

    if (existingIndex >= 0) {
      storedData[existingIndex] = reviewData;
    } else {
      storedData.push(reviewData);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
  }, [phase, currentTrackIndex, trackScores, verdict, loading]);

  const updateTrackScore = (criteriaKey, field, value) => {
    setTrackScores(prev => ({
      ...prev,
      [currentTrackIndex]: { ...prev[currentTrackIndex], [`${criteriaKey}_${field}`]: value }
    }));
  };

  const calculateTrackAvg = (index) => {
    const scores = trackScores[index] || {};
    const vals = CRITERIA.map(c => scores[`${c.key}_score`]).filter(v => v > 0);
    return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "0.0";
  };

  const calculateBaseScore = () => {
    const trackAvgs = Object.keys(trackScores).map(idx => parseFloat(calculateTrackAvg(idx))).filter(v => v > 0);
    return trackAvgs.length > 0 ? trackAvgs.reduce((a, b) => a + b, 0) / trackAvgs.length : 0;
  };

  const handlePublish = () => {
    const finalScore = calculateBaseScore();
    const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const updatedData = storedData.map(d => d.id === String(id) ? 
      { ...d, status: "completed", finalScore, lastUpdated: Date.now() } : d
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    setPhase("published");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  // --- VIEW 01: THE PUBLISHED REVIEW (READ ONLY) ---
  if (phase === "published") {
    const rankedTracks = tracks
      .map((track, idx) => ({
        name: track.trackName,
        score: parseFloat(calculateTrackAvg(idx)),
        originalIndex: idx
      }))
      .sort((a, b) => b.score - a.score);

    return (
      <div className="max-w-6xl mx-auto px-8 py-24 animate-in fade-in duration-700">
        <button onClick={() => navigate("/archive")} className="flex items-center gap-2 text-[10px] uppercase tracking-mega text-muted-foreground mb-12 hover:text-foreground">
          <ChevronLeft size={14}/> Back to Archive
        </button>

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1">
            <header className="flex flex-col md:flex-row gap-12 mb-24 border-b border-foreground/5 pb-16">
              <img src={album.artworkUrl100} className="w-64 h-64 object-cover shadow-2xl" />
              <div className="flex flex-col justify-end">
                <h1 className="font-display text-5xl font-bold leading-tight">{album.collectionName}</h1>
                <p className="font-body text-xl text-muted-foreground mb-6">{album.artistName}</p>
                <div className="flex items-center gap-8">
                  <div>
                    <span className="block text-[10px] uppercase tracking-ultra text-muted-foreground">Final Score</span>
                    <span className="text-5xl font-display font-light">{(calculateBaseScore()).toFixed(1)}</span>
                  </div>
                  <button onClick={() => setPhase("deep_dive")} className="flex items-center gap-2 text-[10px] uppercase tracking-mega border border-foreground/10 px-4 py-2 hover:bg-foreground hover:text-background transition-colors">
                    <Edit3 size={12}/> Edit Review
                  </button>
                </div>
              </div>
            </header>

            <section className="space-y-24">
              {tracks.map((track, idx) => (
                <div key={track.trackId} className="border-l border-foreground/10 pl-8">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <span className="font-display text-sm text-muted-foreground mb-2 block">Track {idx + 1}</span>
                      <h3 className="font-display text-3xl font-bold">{track.trackName}</h3>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase tracking-ultra text-muted-foreground mb-1">Track Score</span>
                      <span className="font-display text-3xl font-light tabular-nums bg-foreground/5 px-4 py-1">
                        {calculateTrackAvg(idx)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid gap-8">
                    {CRITERIA.map(c => {
                      const score = trackScores[idx]?.[`${c.key}_score`];
                      const review = trackScores[idx]?.[`${c.key}_review`];
                      if (!score && !review) return null;
                      return (
                        <div key={c.key} className="max-w-2xl">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="font-body text-[10px] uppercase tracking-mega text-muted-foreground">{c.label}</span>
                            <span className="font-display text-sm font-bold">{score}/10</span>
                          </div>
                          {review && <p className="font-body text-sm leading-relaxed text-foreground/80 italic">"{review}"</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>

            <section className="mt-32 pt-16 border-t border-foreground/10">
              <h2 className="font-display text-4xl font-bold mb-12">The Verdict</h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h4 className="font-body text-[10px] uppercase tracking-mega text-muted-foreground mb-4">Cohesiveness: {verdict.cohesiveness_score}/10</h4>
                  <p className="font-body text-sm leading-relaxed text-foreground/70">{verdict.cohesiveness_review}</p>
                </div>
                <div>
                  <h4 className="font-body text-[10px] uppercase tracking-mega text-muted-foreground mb-4">Replay Value: {verdict.replay_score}/10</h4>
                  <p className="font-body text-sm leading-relaxed text-foreground/70">{verdict.replay_review}</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-24 bg-secondary/30 border border-foreground/5 p-8">
              <div className="flex items-center gap-2 mb-8 border-b border-foreground/5 pb-4">
                <Award className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-body text-[10px] uppercase tracking-mega text-muted-foreground">Song Ranking</h3>
              </div>
              <div className="space-y-6">
                {rankedTracks.map((t, rank) => (
                  <div key={t.originalIndex} className="flex items-start gap-4">
                    <span className="font-display text-xs text-muted-foreground italic w-4 pt-1">{rank + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-medium leading-tight mb-1 truncate">{t.name}</p>
                    </div>
                    <span className="font-display text-lg font-light tabular-nums">{t.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-12 pt-6 border-t border-foreground/5 text-center">
                <p className="font-body text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Album Average</p>
                <p className="font-display text-4xl font-bold">{(calculateBaseScore()).toFixed(1)}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // --- VIEW 02: THE EDITOR (DEEP DIVE & VERDICT) ---
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-1/2 lg:h-screen lg:sticky lg:top-0 bg-secondary flex flex-col items-center justify-center p-8">
        <img src={album.artworkUrl100} className="max-w-full max-h-[60vh] shadow-2xl mb-8 object-cover aspect-square" />
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-1">{album.collectionName}</h1>
          <p className="font-body text-muted-foreground uppercase tracking-widest text-xs">{album.artistName}</p>
        </div>
      </div>

      <div className="lg:w-1/2 px-8 lg:px-16 py-12 lg:py-24">
        {phase === "deep_dive" ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-[10px] uppercase tracking-mega text-muted-foreground">Track {currentTrackIndex + 1} / {tracks.length}</span>
              <div className="flex items-center gap-4">
                 <span className="font-display text-xs font-bold bg-foreground/5 px-2 py-1">Track Avg: {calculateTrackAvg(currentTrackIndex)}</span>
              </div>
            </div>
            <h2 className="font-display text-4xl font-bold mb-12">{tracks[currentTrackIndex]?.trackName}</h2>
            
            <div className="space-y-16">
              {CRITERIA.map(c => {
                const currentScore = trackScores[currentTrackIndex]?.[`${c.key}_score`] || 0;
                return (
                  <div key={c.key} className="relative">
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-body text-[10px] uppercase tracking-mega text-muted-foreground">{c.label}</label>
                      {currentScore > 0 && (
                        <button 
                          onClick={() => updateTrackScore(c.key, "score", 0)}
                          className="flex items-center gap-1 font-body text-[9px] uppercase tracking-tight text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <RotateCcw size={10} /> Reset to N/A
                        </button>
                      )}
                    </div>
                    <CriteriaInput 
                      label="" // Label handled above for custom layout
                      score={currentScore} 
                      review={trackScores[currentTrackIndex]?.[`${c.key}_review`] || ""}
                      onScoreChange={(v) => updateTrackScore(c.key, "score", v)}
                      onReviewChange={(v) => updateTrackScore(c.key, "review", v)}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between mt-16 pt-8 border-t border-foreground/5">
              <button disabled={currentTrackIndex === 0} onClick={() => {setCurrentTrackIndex(i => i - 1); window.scrollTo(0,0);}} className="flex items-center gap-2 uppercase text-[10px] tracking-mega hover:opacity-50 transition-opacity"><ArrowLeft size={14}/> Previous</button>
              <button onClick={() => { if (currentTrackIndex < tracks.length - 1) { setCurrentTrackIndex(i => i + 1); window.scrollTo(0,0); } else { setPhase("final_verdict"); }}} className="flex items-center gap-2 uppercase text-[10px] tracking-mega font-bold hover:opacity-50 transition-opacity">{currentTrackIndex < tracks.length - 1 ? "Next Track" : "Final Verdict"} <ArrowRight size={14}/></button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="font-display text-4xl font-bold mb-4">The Verdict</h2>
            <div className="mb-12 border-b border-foreground/5 pb-8">
              <span className="font-body text-[10px] uppercase tracking-mega text-muted-foreground">Base Score</span>
              <div className="text-7xl font-display font-light">{(calculateBaseScore()).toFixed(1)}</div>
            </div>
            <div className="space-y-12">
              <CriteriaInput label="Cohesiveness" score={verdict.cohesiveness_score} review={verdict.cohesiveness_review} onScoreChange={(v) => setVerdict({...verdict, cohesiveness_score: v})} onReviewChange={(v) => setVerdict({...verdict, cohesiveness_review: v})} />
              <CriteriaInput label="Replay Value" score={verdict.replay_score} review={verdict.replay_review} onScoreChange={(v) => setVerdict({...verdict, replay_score: v})} onReviewChange={(v) => setVerdict({...verdict, replay_review: v})} />
            </div>
            <button onClick={handlePublish} className="w-full bg-foreground text-background py-5 uppercase text-[10px] tracking-widest mt-16 flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"><Save size={14}/> Complete & Publish</button>
          </div>
        )}
      </div>
    </div>
  );
}