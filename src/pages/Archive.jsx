import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Disc3, ArrowUpRight, Trash2 } from "lucide-react";

export default function Archive() {
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("vinyl_reviews") || "[]");
    setReviews(data.filter((rev) => rev.status === "completed").sort((a, b) => b.lastUpdated - a.lastUpdated));
  }, []);

  const handleDelete = (e, id) => {
    e.preventDefault();
    if (window.confirm("Delete this review?")) {
      const data = JSON.parse(localStorage.getItem("vinyl_reviews") || "[]");
      const filtered = data.filter(r => r.id !== id);
      localStorage.setItem("vinyl_reviews", JSON.stringify(filtered));
      setReviews(filtered.filter(rev => rev.status === "completed"));
    }
  };

  const filtered = reviews.filter(r => 
    r.albumData.collectionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.albumData.artistName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-8 max-w-6xl mx-auto py-24">
      <header className="mb-16">
        <p className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground mb-6">Collection</p>
        <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-8">The Archive.</h1>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search reviews..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-foreground/5 font-body text-sm focus:outline-none" />
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-foreground/10"><Disc3 className="w-10 h-10 mx-auto mb-4 text-foreground/10" /><p className="font-body text-sm text-muted-foreground">Empty.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {filtered.map((rev) => (
            <div key={rev.id} className="group relative">
              <Link to={`/review/${rev.id}`} className="block">
                <div className="aspect-square bg-secondary overflow-hidden mb-4 relative">
                  <img src={rev.albumData.artworkUrl100} alt="cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ArrowUpRight className="text-white" /></div>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0"><h2 className="font-display text-lg font-semibold truncate">{rev.albumData.collectionName}</h2><p className="font-body text-[10px] uppercase text-muted-foreground">{rev.albumData.artistName}</p></div>
                  <span className="font-display text-2xl font-light">{(rev.finalScore || 0).toFixed(1)}</span>
                </div>
              </Link>
              <button onClick={(e) => handleDelete(e, rev.id)} className="absolute top-2 right-2 p-2 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><Trash2 size={14}/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}