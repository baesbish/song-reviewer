import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, Disc3, ArrowRight } from "lucide-react";

const STORAGE_KEY = "vinyl_reviews";

export default function StartReview() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const activeDrafts = data.filter((a) => a.status !== "completed");
    
    // Sort by most recently updated
    activeDrafts.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
    setDrafts(activeDrafts);
  }, []);

  const handleStartFresh = () => {
    // UPDATED: Points to your new iTunes search page
    navigate("/search");
  };

  const handleResume = (id) => {
    // UPDATED: Points directly to the review editor
    navigate(`/review/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 lg:p-16">
      <div className="w-full max-w-4xl">
        
        <div className="text-center mb-16">
          <Disc3 className="w-12 h-12 mx-auto mb-6 text-foreground/20 animate-[spin_10s_linear_infinite]" />
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            Drop the Needle
          </h1>
          <p className="font-body text-muted-foreground max-w-md mx-auto">
            Ready to document your next sonic journey? Start a fresh critique or pick up exactly where you left off.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div className="md:col-span-5 flex flex-col">
            <button
              onClick={handleStartFresh}
              className="flex-1 group relative overflow-hidden bg-secondary border border-foreground/5 hover:border-foreground/20 transition-all duration-500 p-8 flex flex-col items-center justify-center text-center min-h-[300px]"
            >
              <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Plus className="w-6 h-6 text-foreground" />
              </div>
              <h2 className="font-display text-2xl font-semibold mb-2">New Review</h2>
              <span className="font-body text-[10px] tracking-mega uppercase text-muted-foreground group-hover:text-foreground transition-colors">
                Blank Canvas
              </span>
            </button>
          </div>

          <div className="md:col-span-7 flex flex-col">
            <div className="bg-secondary/50 border border-foreground/5 p-8 flex-1 min-h-[300px]">
              <div className="flex items-center gap-3 mb-8">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-body text-[10px] tracking-mega uppercase text-muted-foreground">
                  Active Sessions
                </h2>
              </div>

              {drafts.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center border border-dashed border-foreground/10">
                  <span className="font-body text-sm text-foreground/30">
                    No active drafts. You're all caught up.
                  </span>
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {drafts.map((draft) => (
                    <button
                      key={draft.id}
                      onClick={() => handleResume(draft.id)}
                      className="w-full flex items-center gap-4 p-4 bg-background hover:bg-foreground/5 border border-foreground/5 hover:border-foreground/10 transition-colors text-left group"
                    >
                      {draft.coverUrl ? (
                        <img 
                          src={draft.coverUrl} 
                          alt="cover" 
                          className="w-12 h-12 object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-foreground/5 flex items-center justify-center shrink-0">
                          <Disc3 className="w-5 h-5 text-foreground/20" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg font-medium truncate">
                          {draft.title || "Untitled Album"}
                        </h3>
                        <p className="font-body text-xs text-muted-foreground truncate">
                          {draft.artist || "Unknown Artist"}
                        </p>
                      </div>

                      <div className="hidden sm:flex items-center gap-4">
                        <span className="font-body text-[9px] tracking-mega uppercase text-foreground/40 px-2 py-1 bg-foreground/5">
                          {draft.status === "draft" ? "In Progress" : draft.status}
                        </span>
                        <ArrowRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}