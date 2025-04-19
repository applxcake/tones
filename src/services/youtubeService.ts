
import { SpotifyTrack, SpotifyTrackBasic, searchTracks as spotifySearchTracks, getTrendingByGenre } from './spotifyService';

// Rename YouTubeVideo to SpotifyTrack to maintain compatibility
export interface YouTubeVideo extends SpotifyTrack {}

// Use SpotifyTrackBasic for the YouTubeVideoBasic type but ensure publishedAt is required
export interface YouTubeVideoBasic extends Omit<SpotifyTrackBasic, 'publishedAt'> {
  publishedAt: string;  // Make publishedAt required to match YouTubeVideo
}

// Export searchVideos function that wraps searchTracks from spotifyService
export const searchVideos = spotifySearchTracks;

// Re-export functions from spotifyService
export { searchTracks, getTrendingMusic, getNewReleases, getRecommendations } from './spotifyService';

// Function to get trending music by genre
export const getTrendingMusicByGenre = (genre: string) => {
  return getTrendingByGenre(genre);
};
