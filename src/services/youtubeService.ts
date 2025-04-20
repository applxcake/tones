
// Define YouTubeVideo type
export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
}

// Define YouTubeVideoBasic type for videos from database with fewer properties
export interface YouTubeVideoBasic {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string; // Changed from optional to required to match YouTubeVideo
}

// YouTube API key - NOTE: In production, this should be stored in environment variables
const YOUTUBE_API_KEY = 'AIzaSyDw396jNgBIcbQljAB-C0EHBtHw6OLdy3A';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Fetches trending music videos from YouTube
 * @param maxResults - Maximum number of results to return (default: 15)
 * @returns Array of YouTubeVideo objects
 */
export const getTrendingMusic = async (maxResults = 15): Promise<YouTubeVideo[]> => {
  try {
    // Use music category ID (10) and fetch trending videos
    const response = await fetch(
      `${YOUTUBE_API_URL}/videos?part=snippet&chart=mostPopular&videoCategoryId=10&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error:', errorData);
      throw new Error(`YouTube API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) {
    console.error('Error fetching trending music from YouTube:', error);
    
    // Return mock data if API fails (for development purposes)
    return getMockTrendingMusic();
  }
};

/**
 * Searches for videos on YouTube
 * @param query - Search query
 * @param maxResults - Maximum number of results to return (default: 20)
 * @returns Array of YouTubeVideo objects
 */
export const searchYouTubeVideos = async (query: string, maxResults = 20): Promise<YouTubeVideo[]> => {
  if (!query) return [];
  
  try {
    const response = await fetch(
      `${YOUTUBE_API_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error:', errorData);
      throw new Error(`YouTube API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    return [];
  }
};

// Add the missing searchVideos function that is imported in Search.tsx
export const searchVideos = async (query: string, pageToken?: string) => {
  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      videoCategoryId: '10', // Music category
      maxResults: '20',
      key: YOUTUBE_API_KEY
    });
    
    if (pageToken) {
      params.append('pageToken', pageToken);
    }
    
    const response = await fetch(`${YOUTUBE_API_URL}/search?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to search videos');
    }
    
    const data = await response.json();
    
    return {
      items: data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt
      })),
      nextPageToken: data.nextPageToken
    };
  } catch (error) {
    console.error('Error searching videos:', error);
    return { items: [], nextPageToken: undefined };
  }
};

/**
 * Generates mock trending music data
 * Used as fallback when API calls fail
 */
const getMockTrendingMusic = (): YouTubeVideo[] => {
  return [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channelTitle: 'Rick Astley',
      publishedAt: '2009-10-25T06:57:33Z'
    },
    {
      id: '1XzY2ij_vL4',
      title: 'Katy Perry - Dark Horse ft. Juicy J',
      thumbnailUrl: 'https://i.ytimg.com/vi/1XzY2ij_vL4/mqdefault.jpg',
      channelTitle: 'Katy Perry',
      publishedAt: '2019-12-16T16:32:12Z'
    },
    {
      id: 'IcrbM1l_BoI',
      title: 'Avicii - Wake Me Up',
      thumbnailUrl: 'https://i.ytimg.com/vi/IcrbM1l_BoI/mqdefault.jpg',
      channelTitle: 'Avicii',
      publishedAt: '2013-07-29T13:54:22Z'
    },
    {
      id: 'CqdL36VKbMQ',
      title: 'Adele - Rolling in the Deep',
      thumbnailUrl: 'https://i.ytimg.com/vi/CqdL36VKbMQ/mqdefault.jpg',
      channelTitle: 'Adele',
      publishedAt: '2013-11-14T23:12:45Z'
    },
    {
      id: 'OPf0YbXqDm0',
      title: 'Mark Ronson ft. Bruno Mars - Uptown Funk',
      thumbnailUrl: 'https://i.ytimg.com/vi/OPf0YbXqDm0/mqdefault.jpg',
      channelTitle: 'Mark Ronson',
      publishedAt: '2014-11-19T17:32:56Z'
    },
    {
      id: 'JGwWNGJdvx8',
      title: 'Ed Sheeran - Shape of You',
      thumbnailUrl: 'https://i.ytimg.com/vi/JGwWNGJdvx8/mqdefault.jpg',
      channelTitle: 'Ed Sheeran',
      publishedAt: '2017-01-30T11:10:22Z'
    },
    {
      id: 'r8OXJuTBlqE',
      title: 'Taylor Swift - Blank Space',
      thumbnailUrl: 'https://i.ytimg.com/vi/r8OXJuTBlqE/mqdefault.jpg', 
      channelTitle: 'Taylor Swift',
      publishedAt: '2014-11-10T15:43:12Z'
    },
    {
      id: 'YykjpeuMNEk',
      title: 'Coldplay - Hymn For The Weekend',
      thumbnailUrl: 'https://i.ytimg.com/vi/YykjpeuMNEk/mqdefault.jpg',
      channelTitle: 'Coldplay',
      publishedAt: '2016-01-29T14:22:54Z'
    },
    {
      id: 'fKopy74weus',
      title: 'Imagine Dragons - Believer',
      thumbnailUrl: 'https://i.ytimg.com/vi/fKopy74weus/mqdefault.jpg',
      channelTitle: 'Imagine Dragons',
      publishedAt: '2017-03-07T13:11:23Z'
    },
    {
      id: 'eH4F1Tdb040',
      title: 'Sia - Chandelier',
      thumbnailUrl: 'https://i.ytimg.com/vi/eH4F1Tdb040/mqdefault.jpg',
      channelTitle: 'Sia',
      publishedAt: '2014-05-06T18:32:12Z'
    }
  ];
};
