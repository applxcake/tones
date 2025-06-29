import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, Sparkle, ListPlus } from 'lucide-react';
import { getMultipleVideoDetails } from '@/services/youtubeService';
import { getUserPlaylists, addSongToPlaylist, createPlaylist } from '@/services/playlistService';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';

// Gemini API key - replace with your actual key from https://makersuite.google.com/app/apikey
const GEMINI_API_KEY = 'AIzaSyAHwzzDPsU9oOt4fw2CSX5MgWEYq7OfrVQ';

async function fetchAISuggestions(prompt: string) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      console.warn(`API request failed: ${response.status}. Using fallback suggestions.`);
      // Return fallback popular video IDs
      return [
        'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up
        '9bZkp7q19f0', // PSY - GANGNAM STYLE
        'kJQP7kiw5Fk', // Luis Fonsi - Despacito
        'y6120QOlsfU', // Sandstorm - Darude
        'ZZ5LpwO-An4', // The Beatles - Hey Jude
        'hTWKbfoikeg', // Nirvana - Smells Like Teen Spirit
        'YykjpeuMNEk', // Cyndi Lauper - Girls Just Want To Have Fun
        'L_jWHffIx5E', // Smash Mouth - All Star
        'kffacxfA7G4', // Baby Shark Dance
        'y6120QOlsfU'  // Darude - Sandstorm
      ];
    }

    const data = await response.json();
    
    // Try to extract a JSON array of video IDs from the response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Look for JSON array pattern in the response
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      try {
        const ids = JSON.parse(jsonMatch[0]);
        // Remove duplicates and ensure we have an array
        const uniqueIds = Array.isArray(ids) ? [...new Set(ids)] : [];
        return uniqueIds.slice(0, 10); // Limit to 10 unique suggestions
      } catch (parseError) {
        console.error('Failed to parse JSON from AI response:', parseError);
      }
    }
    
    // If no JSON found, try to extract YouTube video IDs using regex
    const videoIdPattern = /[a-zA-Z0-9_-]{11}/g;
    const videoIds = text.match(videoIdPattern) || [];
    // Remove duplicates and limit to 10
    const uniqueIds = [...new Set(videoIds)].slice(0, 10);
    return uniqueIds;
    
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    console.warn('Using fallback suggestions due to API error.');
    // Return fallback popular video IDs
    return [
      'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up
      '9bZkp7q19f0', // PSY - GANGNAM STYLE
      'kJQP7kiw5Fk', // Luis Fonsi - Despacito
      'y6120QOlsfU', // Sandstorm - Darude
      'ZZ5LpwO-An4', // The Beatles - Hey Jude
      'hTWKbfoikeg', // Nirvana - Smells Like Teen Spirit
      'YykjpeuMNEk', // Cyndi Lauper - Girls Just Want To Have Fun
      'L_jWHffIx5E', // Smash Mouth - All Star
      'kffacxfA7G4', // Baby Shark Dance
      'y6120QOlsfU'  // Darude - Sandstorm
    ];
  }
}

const AISuggestions = () => {
  const { user } = useAuth();
  const { playTrack, addToQueue, isCurrentSong, isPlaying } = usePlayer();
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('');
  const [adding, setAdding] = useState(false);

  const handlePlaySong = (song: any) => {
    playTrack(song);
  };

  const handleAddToQueue = (song: any) => {
    addToQueue(song);
  };

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    
    // Play the first song
    playTrack(songs[0]);
    
    // Add the rest to queue
    songs.slice(1).forEach(song => {
      addToQueue(song);
    });
  };

  const handleAddAllToQueue = () => {
    songs.forEach(song => {
      addToQueue(song);
    });
  };

  const handleGetSuggestions = async () => {
    setLoading(true);
    setError(null);
    setSongs([]);
    try {
      // Create a more specific prompt for better results
      const prompt = `You are a music recommendation AI. Based on current trends and popular music, recommend 10 YouTube video IDs for songs that are trending, popular, or highly rated. 

Focus on:
- Pop, electronic, hip-hop, and trending music
- Songs from the last few years that are widely popular
- Mix of different genres and artists

Return ONLY a JSON array of exactly 10 YouTube video IDs (11-character strings), like this:
["dQw4w9WgXcQ", "9bZkp7q19f0", "kJQP7kiw5Fk"]

Do not include any other text, just the JSON array.`;

      const ids = await fetchAISuggestions(prompt);
      
      if (ids.length === 0) {
        setError('No suggestions found. Please try again.');
        return;
      }
      
      const songObjs = await getMultipleVideoDetails(ids);
      const validSongs = songObjs.filter(Boolean);
      
      if (validSongs.length === 0) {
        setError('No valid songs found from the suggestions.');
        return;
      }
      
      setSongs(validSongs);
    } catch (e) {
      console.error('Error getting AI suggestions:', e);
      setError(e instanceof Error ? e.message : 'Failed to get AI suggestions.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllToPlaylist = async () => {
    setShowAddDialog(true);
    if (user?.id) {
      const pls = await getUserPlaylists(user.id);
      setPlaylists(pls);
    }
  };

  const handleSelectPlaylist = async (playlistId: string) => {
    setAdding(true);
    for (const song of songs) {
      await addSongToPlaylist(playlistId, song, user?.id);
    }
    setAdding(false);
    setShowAddDialog(false);
  };

  const handleCreateAndAdd = async (name: string) => {
    setAdding(true);
    const newPl = await createPlaylist(name, '', user?.id);
    if (newPl) {
      for (const song of songs) {
        await addSongToPlaylist(newPl.id, song, user?.id);
      }
    }
    setAdding(false);
    setShowAddDialog(false);
  };

  return (
    <div className="pt-10 pb-24 animate-slide-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Sparkle className="h-8 w-8 text-neon-purple animate-pulse-glow" />
        <h1 className="text-3xl font-bold">AI Suggestions</h1>
      </div>
      <p className="text-gray-400 mb-6">Let AI recommend music just for you! Click below to get a playlist of songs tailored to your taste.</p>
      <Button onClick={handleGetSuggestions} disabled={loading} className="mb-8 flex items-center gap-2">
        <Sparkle className="h-5 w-5" />
        {loading ? 'Getting Suggestions...' : 'Get AI Recommendations'}
      </Button>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {songs.length > 0 && (
        <div className="mb-6 flex gap-2">
          <Button onClick={handlePlayAll} className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" /> Play All
          </Button>
          <Button onClick={handleAddAllToQueue} className="flex items-center gap-2">
            <ListPlus className="h-5 w-5" /> Add All to Queue
          </Button>
          <Button onClick={handleAddAllToPlaylist} className="flex items-center gap-2">
            <ListPlus className="h-5 w-5" /> Add All to Playlist
          </Button>
        </div>
      )}
      {songs.length > 0 && (
        <div className="space-y-2">
          {songs.map((song, idx) => {
            const isCurrentlyPlaying = isCurrentSong(song.id) && isPlaying;
            return (
              <div key={song.id || `song-${idx}`} className="flex items-center justify-between p-3 rounded-lg glass-card hover:neon-glow-purple animate-fade-in">
                <div className="flex items-center gap-3">
                  <img src={song.thumbnailUrl} alt={song.title} className="w-12 h-12 rounded-md object-cover" />
                  <div>
                    <div className="font-semibold text-white truncate max-w-xs" title={song.title}>
                      {song.title}
                      {isCurrentlyPlaying && <span className="ml-2 text-neon-purple animate-pulse">●</span>}
                    </div>
                    <div className="text-xs text-gray-400">{song.channelTitle}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="hover-scale" 
                    onClick={() => handlePlaySong(song)}
                    title="Play"
                  >
                    <PlayCircle className="h-5 w-5" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="hover-scale" 
                    onClick={() => handleAddToQueue(song)}
                    title="Add to Queue"
                  >
                    <ListPlus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!loading && songs.length === 0 && !error && (
        <div className="text-center text-gray-500 py-8">No AI suggestions yet. Click the button above!</div>
      )}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add All to Playlist</h2>
            <div className="mb-4">
              <div className="mb-2 text-sm text-gray-400">Select a playlist:</div>
              {playlists.map((pl: any) => (
                <Button key={pl.id} className="w-full mb-2" onClick={() => handleSelectPlaylist(pl.id)} disabled={adding}>
                  {pl.name}
                </Button>
              ))}
            </div>
            <div className="mb-2 text-sm text-gray-400">Or create a new playlist:</div>
            <form onSubmit={e => { e.preventDefault(); handleCreateAndAdd((e.target as any).elements.name.value); }}>
              <input name="name" placeholder="Playlist name" className="w-full p-2 rounded mb-2 bg-muted text-foreground" required />
              <Button type="submit" className="w-full" disabled={adding}>Create and Add</Button>
            </form>
            <Button variant="outline" className="w-full mt-4" onClick={() => setShowAddDialog(false)} disabled={adding}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISuggestions; 