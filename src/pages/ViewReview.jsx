import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

const STORAGE_KEY = "vinyl_reviews";

export default function ViewReview() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [scores, setScores] = useState({});
  const [verdict, setVerdict] = useState({ cohesiveness: 5, replayValue: 5 });

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    // Case 1: Navigated here directly from the Search page
    if (location.state?.album && location.state?.tracks) {
      const { album: newAlbum, tracks: newTracks } = location.state;
      setAlbum(newAlbum);
      setTracks(newTracks);

      const existingDraft = storedData.find(d => d.id === String(newAlbum.collectionId));

      if (existingDraft) {
        setScores(existingDraft.scores || {});
        setVerdict(existingDraft.verdict || { cohesiveness: 5, replayValue: 5 });
      } else {
        const initialScores = {};
        newTracks.forEach((track) => {
          initialScores[track.trackId] = { lyrics: 5, production: 5, vocals: 5, composition: 5, emotion: 5 };
        });
        setScores(initialScores);

        // Save new draft immediately
        const newDraft = {
          id: String(newAlbum.collectionId),
          title: newAlbum.collectionName,
          artist: newAlbum.artistName,
          coverUrl: newAlbum.artworkUrl100.replace('100x100', '600x600'),
          albumData: newAlbum,
          tracksData: newTracks,
          scores: initialScores,
          verdict: { cohesiveness: 5, replayValue: 5 },
          status: "draft",
          lastUpdated: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...storedData, newDraft]));
      }
      return;
    }

    // Case 2: Resuming a draft from the StartReview page
    const draft = storedData.find(d => d.id === String(id));
    if (draft) {
      setAlbum(draft.albumData);
      setTracks(draft.tracksData);
      setScores(draft.scores || {});
      setVerdict(draft.verdict || { cohesiveness: 5, replayValue: 5 });
      return;
    }

    // Case 3: Invalid direct link
    navigate("/start");
  }, [id, location.state, navigate]);

  // Auto-save logic
  useEffect(() => {
    if (!album || Object.keys(scores).length === 0) return;

    const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const draftIndex = storedData.findIndex(d => d.id === String(album.collectionId));

    if (draftIndex >= 0) {
      storedData[draftIndex] = {
        ...storedData[draftIndex],
        scores,
        verdict,
        lastUpdated: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    }
  }, [scores, verdict, album]);

  if (!album || !tracks || Object.keys(scores).length === 0) return null;

  const updateScore = (trackId, criteria, value) => {
    setScores((prev) => ({
      ...prev,
      [trackId]: {
        ...prev[trackId],
        [criteria]: Number(value),
      },
    }));
  };

  const calculateTrackAverage = (trackId) => {
    const s = scores[trackId];
    if (!s) return 0;
    return (s.lyrics + s.production + s.vocals + s.composition + s.emotion) / 5;
  };

  const calculateFinalScore = () => {
    const trackAvgs = tracks.map((t) => calculateTrackAverage(t.trackId));
    const totalTrackAvg = trackAvgs.reduce((a, b) => a + b, 0) / tracks.length;
    const final = (totalTrackAvg * 0.7) + (verdict.cohesiveness * 0.15) + (verdict.replayValue * 0.15);
    return final.toFixed(1);
  };

  const handlePublish = () => {
    const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const draftIndex = storedData.findIndex(d => d.id === String(album.collectionId));
    
    if (draftIndex >= 0) {
      storedData[draftIndex].status = "completed";
      storedData[draftIndex].finalScore = calculateFinalScore();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    }
    
    navigate("/");
  };

  return (
    <div className="px-8 max-w-4xl mx-auto py-12 md:py-24">
      <button 
        onClick={() => navigate("/start")}
        className="flex items-center gap-2 font-body text-[10px] tracking-mega uppercase text-muted-foreground hover:text-foreground transition-colors mb-12"
      >
        <ArrowLeft className="w-4 h-4" /> Save & Exit
      </button>

      <div className="flex flex-col md:flex-row items-start md:items-end gap-8 mb-16 pb-12 border-b border-border">
        <img 
          src={album.artworkUrl100.replace('100x100', '600x600')} 
          alt={album.collectionName} 
          className="w-48 h-48 object-cover shadow-2xl"
        />
        <div className="flex-1">
          <p className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground mb-2">
            Active Review
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">{album.collectionName}</h1>
          <p className="font-body text-xl text-muted-foreground">{album.artistName}</p>
        </div>
        <div className="text-right">
          <p className="font-body text-[10px] tracking-mega uppercase text-muted-foreground mb-2">Current Score</p>
          <span className="font-display text-6xl font-light tabular-nums">{calculateFinalScore()}</span>
        </div>
      </div>

      <div className="mb-20">
        <h2 className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground mb-8">
          Step 03: Deep Dive
        </h2>
        <div className="grid gap-12">
          {tracks.map((track) => (
            <div key={track.trackId} className="bg-secondary/10 p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
                <h3 className="font-display text-xl font-semibold">
                  <span className="text-muted-foreground mr-3">{track.trackNumber}.</span> 
                  {track.trackName}
                </h3>
                <span className="font-display text-2xl font-light text-foreground/60 tabular-nums">
                  {calculateTrackAverage(track.trackId).toFixed(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {['lyrics', 'production', 'vocals', 'composition', 'emotion'].map((crit) => (
                  <div key={crit} className="flex items-center gap-4">
                    <label className="font-body text-[10px] uppercase tracking-mega w-24 text-muted-foreground">
                      {crit}
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      step="1"
                      value={scores[track.trackId]?.[crit] || 5}
                      onChange={(e) => updateScore(track.trackId, crit, e.target.value)}
                      className="flex-1 accent-foreground h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-display text-sm w-6 text-right tabular-nums">
                      {scores[track.trackId]?.[crit] || 5}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-20">
        <h2 className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground mb-8">
          Step 04: Final Verdict
        </h2>
        <div className="bg-secondary/10 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          {['cohesiveness', 'replayValue'].map((crit) => (
             <div key={crit} className="space-y-4">
               <div className="flex items-center justify-between">
                 <label className="font-body text-sm uppercase tracking-mega">
                   {crit === 'replayValue' ? 'Replay Value' : 'Cohesiveness'}
                 </label>
                 <span className="font-display text-xl font-light tabular-nums">{verdict[crit]}</span>
               </div>
               <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="1"
                  value={verdict[crit]}
                  onChange={(e) => setVerdict(prev => ({ ...prev, [crit]: Number(e.target.value) }))}
                  className="w-full accent-foreground h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                />
             </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end border-t border-border pt-8">
        <button 
          onClick={handlePublish}
          className="flex items-center gap-3 bg-foreground text-background font-body text-xs tracking-mega uppercase px-8 py-4 hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" /> Publish Review
        </button>
      </div>

    </div>
  );
}