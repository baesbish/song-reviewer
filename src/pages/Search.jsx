import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, Loader2, Music, ChevronRight, Plus, X } from "lucide-react";

export default function Search() {
  const navigate = useNavigate();
  
  // State Management
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [tracklist, setTracklist] = useState([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);

  // 1. Authentication Logic
  const getAccessToken = async () => {
    const clientID = "e8b72ce453ce4d0bbba9b15924618f67";
    const clientSecret = "b121dda6a33246579f6b0d3a8e916467";
    
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic " + btoa(clientID + ":" + clientSecret),
        },
        body: "grant_type=client_credentials",
      });
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("Auth Error:", error);
    }
  };

  // 2. Search Logic
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setSelectedAlbum(null);

    const token = await getAccessToken();
    try {
      const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSearchResults(data.albums.items);
    } catch (error) {
      console.error("Search Error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // 3. Selection & Track Fetching
  const handleSelectAlbum = async (album) => {
    setSelectedAlbum(album);
    setIsLoadingTracks(true);
    setSearchResults([]);
    setIsManualMode(false);

    const token = await getAccessToken();
    try {
      const res = await fetch(`https://api.spotify.com/v1/albums/${album.id}/tracks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const trackData = await res.json();
      
      const normalizedTracks = trackData.items.map(track => ({
        trackId: track.id,
        trackNumber: track.track_number,
        trackName: track.name,
        trackTimeMillis: track.duration_ms
      }));
      setTracklist(normalizedTracks);
    } catch (error) {
      console.error("Track Fetch Error:", error);
      setIsManualMode(true);
      setTracklist([{ trackId: Date.now().toString(), trackNumber: 1, trackName: "", trackTimeMillis: 0 }]);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  // --- Manual Mode Handlers ---
  const handleUpdateManualTrack = (index, value) => {
    const updated = [...tracklist];
    updated[index].trackName = value;
    setTracklist(updated);
  };

  const handleAddManualTrack = () => {
    setTracklist([...tracklist, { trackId: Date.now().toString(), trackNumber: tracklist.length + 1, trackName: "", trackTimeMillis: 0 }]);
  };

  const handleRemoveManualTrack = (index) => {
    const updated = tracklist.filter((_, i) => i !== index);
    updated.forEach((t, i) => t.trackNumber = i + 1); 
    setTracklist(updated);
  };

  const handleStartReview = () => {
    const finalTracks = isManualMode ? tracklist.filter(t => t.trackName.trim() !== "") : tracklist;
    
    navigate(`/review/${selectedAlbum.id}`, {
      state: {
        album: {
          collectionId: selectedAlbum.id,
          collectionName: selectedAlbum.name,
          artistName: selectedAlbum.artists[0].name,
          artworkUrl100: selectedAlbum.images[0].url
        },
        tracks: finalTracks.length > 0 ? finalTracks : [{ trackId: 'fallback', trackNumber: 1, trackName: 'Holistic Review', trackTimeMillis: 0 }]
      }
    });
  };

  return (
    <div className="px-8 max-w-3xl mx-auto py-24">
      <p className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground mb-6">Step 01: Foundation</p>
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-8">Find your album.</h1>

      {!selectedAlbum && (
        <form onSubmit={handleSearch} className="relative mb-12">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Spotify for albums..."
            className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border rounded-none font-body text-lg focus:outline-none focus:border-foreground transition-colors"
          />
          <button type="submit" disabled={isSearching} className="absolute right-4 top-1/2 -translate-y-1/2 font-body text-[10px] tracking-mega uppercase hover:opacity-50 disabled:opacity-50">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </button>
        </form>
      )}

      {searchResults.length > 0 && (
        <div className="grid gap-4">
          {searchResults.map((album) => (
            <button key={album.id} onClick={() => handleSelectAlbum(album)} className="flex items-center gap-6 p-4 border border-border hover:border-foreground text-left transition-colors group">
              <img src={album.images[2]?.url || album.images[0]?.url} alt={album.name} className="w-16 h-16 object-cover" />
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold">{album.name}</h3>
                <p className="font-body text-sm text-muted-foreground">{album.artists[0].name}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {selectedAlbum && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-end gap-8 mb-12 pb-12 border-b border-border">
            <img src={selectedAlbum.images[0].url} alt={selectedAlbum.name} className="w-48 h-48 object-cover shadow-2xl" />
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">{selectedAlbum.name}</h2>
              <p className="font-body text-lg text-muted-foreground mb-4">{selectedAlbum.artists[0].name}</p>
              <button onClick={() => setSelectedAlbum(null)} className="font-body text-[10px] tracking-mega uppercase border-b border-foreground/30 hover:border-foreground pb-1 transition-colors">
                ← Change Album
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <p className="font-body text-[10px] tracking-ultra uppercase text-muted-foreground">Step 02: Scope</p>
            <span className="font-body text-xs text-muted-foreground">{isManualMode ? "Manual Entry" : `${tracklist.length} Tracks`}</span>
          </div>

          {isLoadingTracks ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : isManualMode ? (
            <div className="space-y-4">
              {tracklist.map((track, i) => (
                <div key={track.trackId} className="flex items-center gap-4">
                  <span className="font-body text-[10px] text-muted-foreground w-6 text-right">{String(i + 1).padStart(2, "0")}</span>
                  <input type="text" value={track.trackName} onChange={(e) => handleUpdateManualTrack(i, e.target.value)} placeholder="Track name" className="flex-1 bg-transparent border-0 border-b border-foreground/10 focus:border-foreground/30 text-sm font-body focus:outline-none transition-colors pb-2" />
                  {tracklist.length > 1 && <button onClick={() => handleRemoveManualTrack(i)} className="text-foreground/20 hover:text-foreground"><X className="w-4 h-4" /></button>}
                </div>
              ))}
              <button onClick={handleAddManualTrack} className="mt-6 flex items-center gap-2 font-body text-[10px] tracking-mega uppercase text-muted-foreground hover:text-foreground"><Plus className="w-3 h-3" /> Add Track</button>
            </div>
          ) : (
            <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {tracklist.map((track) => (
                <div key={track.trackId} className="flex items-center gap-4 p-4 bg-secondary/20">
                  <span className="font-display text-sm text-muted-foreground w-6 text-right tabular-nums">{track.trackNumber}</span>
                  <Music className="w-4 h-4 text-muted-foreground/50" />
                  <span className="font-body font-medium flex-1">{track.trackName}</span>
                  <span className="font-body text-xs text-muted-foreground tabular-nums">
                    {Math.floor(track.trackTimeMillis / 60000)}:{((track.trackTimeMillis % 60000) / 1000).toFixed(0).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 flex justify-end">
            <button onClick={handleStartReview} disabled={isManualMode && tracklist.filter(t => t.trackName.trim()).length === 0} className="bg-foreground text-background font-body text-xs tracking-mega uppercase px-8 py-4 hover:opacity-90 disabled:opacity-20">
              Start Reviewing →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}