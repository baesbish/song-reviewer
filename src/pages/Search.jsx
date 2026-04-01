import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, Loader2, Music, ChevronRight } from "lucide-react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [tracklist, setTracklist] = useState([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  const navigate = useNavigate();

  const searchAlbums = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setSelectedAlbum(null);

    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=5`);
      const data = await res.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error("Failed to fetch albums:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAlbum = async (album) => {
    setSelectedAlbum(album);
    setIsLoadingTracks(true);
    setSearchResults([]); 

    try {
      const res = await fetch(`https://itunes.apple.com/lookup?id=${album.collectionId}&entity=song`);
      const data = await res.json();
      
      const tracksOnly = data.results.filter(item => item.wrapperType === "track");
      setTracklist(tracksOnly);
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  const handleStartReview = () => {
    navigate(`/review/${selectedAlbum.collectionId}`, {
      state: {
        album: selectedAlbum,
        tracks: tracklist
      }
    });
  };

  return (
    <div className="px-8 max-w-3xl mx-auto py-24">
      <p className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground mb-6">
        Step 01: Foundation
      </p>
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-8">
        Find your album.
      </h1>

      {!selectedAlbum && (
        <form onSubmit={searchAlbums} className="relative mb-12">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by album or artist..."
            className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border rounded-none font-body text-lg focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
          />
          <button 
            type="submit" 
            disabled={isSearching}
            className="absolute right-4 top-1/2 -translate-y-1/2 font-body text-[10px] tracking-mega uppercase hover:opacity-50 transition-opacity disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </button>
        </form>
      )}

      {searchResults.length > 0 && (
        <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {searchResults.map((album) => (
            <button
              key={album.collectionId}
              onClick={() => handleSelectAlbum(album)}
              className="flex items-center gap-6 p-4 border border-border hover:border-foreground text-left transition-colors group"
            >
              <img 
                src={album.artworkUrl100.replace('100x100', '300x300')} 
                alt={album.collectionName} 
                className="w-16 h-16 object-cover"
              />
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold">{album.collectionName}</h3>
                <p className="font-body text-sm text-muted-foreground">{album.artistName}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          ))}
        </div>
      )}

      {selectedAlbum && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-end gap-8 mb-12 pb-12 border-b border-border">
            <img 
              src={selectedAlbum.artworkUrl100.replace('100x100', '600x600')} 
              alt={selectedAlbum.collectionName} 
              className="w-48 h-48 object-cover shadow-2xl"
            />
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">{selectedAlbum.collectionName}</h2>
              <p className="font-body text-lg text-muted-foreground mb-4">{selectedAlbum.artistName}</p>
              <button 
                onClick={() => setSelectedAlbum(null)}
                className="font-body text-[10px] tracking-mega uppercase border-b border-foreground/30 hover:border-foreground pb-1 transition-colors"
              >
                ← Search Different Album
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-8">
              <p className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground">
                Step 02: Scope
              </p>
              <span className="font-body text-xs text-muted-foreground">{tracklist.length} Tracks</span>
            </div>
            
            {isLoadingTracks ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-2">
                {tracklist.map((track) => (
                  <div key={track.trackId} className="flex items-center gap-4 p-4 bg-secondary/20 hover:bg-secondary/50 transition-colors">
                    <span className="font-display text-sm text-muted-foreground w-6 text-right tabular-nums">
                      {track.trackNumber}
                    </span>
                    <Music className="w-4 h-4 text-muted-foreground/50" />
                    <span className="font-body font-medium flex-1">{track.trackName}</span>
                    <span className="font-body text-xs text-muted-foreground tabular-nums">
                      {Math.floor(track.trackTimeMillis / 60000)}:
                      {((track.trackTimeMillis % 60000) / 1000).toFixed(0).padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {tracklist.length > 0 && (
            <div className="mt-12 flex justify-end">
              <button 
                onClick={handleStartReview}
                className="bg-foreground text-background font-body text-xs tracking-mega uppercase px-8 py-4 hover:opacity-90 transition-opacity"
              >
                Start Reviewing →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}