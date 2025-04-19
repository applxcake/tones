
import { SpotifyTrack, SpotifyTrackBasic } from './spotifyService';

// Rename YouTubeVideo to SpotifyTrack to maintain compatibility
export interface YouTubeVideo extends SpotifyTrack {}

// Use SpotifyTrackBasic for the YouTubeVideoBasic type
export interface YouTubeVideoBasic extends SpotifyTrackBasic {}

// Re-export functions from spotifyService
export { searchTracks, getTrendingMusic, getNewReleases, getRecommendations } from './spotifyService';
