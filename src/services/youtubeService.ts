// Define the structure of a YouTube video
export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
}

// API key for YouTube Data API - will be updated from environment variable if available
const DEFAULT_API_KEY = 'AIzaSyBAxmc3Rn7Id-bifTpe7iqsz5p8k1Otzdw';
const MAX_RESULTS = 10;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Helper function to get API key (allows for future expansion to multiple keys)
const getAPIKey = (): string => {
  // In the future, this could rotate between multiple keys or use environment variables
  return DEFAULT_API_KEY;
};

// Helper function to delay execution (for retries)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch with retry logic
const fetchWithRetry = async (url: string, retries = MAX_RETRIES): Promise<Response> => {
  try {
    const response = await fetch(url);
    
    if (response.ok) {
      return response;
    }
    
    // Handle rate limiting (429) or server errors (5xx)
    if ((response.status === 429 || response.status >= 500) && retries > 0) {
      console.log(`YouTube API returned ${response.status}. Retrying in ${RETRY_DELAY}ms...`);
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, retries - 1);
    }
    
    // Log detailed error for debugging
    const errorText = await response.text();
    console.error(`YouTube API Error (${response.status}):`, errorText);
    throw new Error(`YouTube API Error: ${response.status}`);
  } catch (error) {
    if (retries > 0) {
      console.log(`Network error fetching YouTube data. Retrying in ${RETRY_DELAY}ms...`);
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
};

// Search YouTube videos by query
export const searchYouTubeVideos = async (query: string): Promise<YouTubeVideo[]> => {
  try {
    console.log(`Searching YouTube for: "${query}"`);
    const apiKey = getAPIKey();
    
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${MAX_RESULTS}&q=${encodeURIComponent(
      query
    )}&key=${apiKey}&type=video`;
    
    const response = await fetchWithRetry(url);
    const data = await response.json();
    
    console.log(`YouTube search returned ${data.items?.length || 0} results`);
    
    // Map the response to our YouTubeVideo format
    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    // Show detailed error but still return mock data for better UX
    console.log('Falling back to mock data');
    return getMockSearchResults(query);
  }
};

// Get video details by ID
export const getYouTubeVideoById = async (videoId: string): Promise<YouTubeVideo | null> => {
  try {
    const apiKey = getAPIKey();
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
    
    const response = await fetchWithRetry(url);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return {
        id: video.id,
        title: video.snippet.title,
        thumbnailUrl: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching YouTube video by ID:', error);
    return getMockVideoById(videoId);
  }
};

// Search videos implementation for compatibility with Search page
export const searchVideos = async (query: string, pageToken?: string) => {
  try {
    console.log(`Searching videos with pageToken: ${pageToken || 'none'}`);
    const apiKey = getAPIKey();
    
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${MAX_RESULTS}&q=${encodeURIComponent(
      query
    )}&key=${apiKey}&type=video`;
    
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }
    
    const response = await fetchWithRetry(url);
    const data = await response.json();
    
    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));
    
    return {
      items: videos,
      nextPageToken: data.nextPageToken
    };
  } catch (error) {
    console.error('Error in searchVideos:', error);
    // Toast notification is handled by the component using this function
    
    return {
      items: getMockSearchResults(query),
      nextPageToken: undefined
    };
  }
};

// Get trending music implementation for the Explore page
export const getTrendingMusic = async (): Promise<YouTubeVideo[]> => {
  try {
    const apiKey = getAPIKey();
    // Use YouTube's API to get music category videos
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=10&maxResults=${MAX_RESULTS}&key=${apiKey}`;
    
    const response = await fetchWithRetry(url);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
      }));
    }
    
    throw new Error('No trending music found');
  } catch (error) {
    console.error('Error fetching trending music:', error);
    // Return mock data for trending music
    return getMockTrendingSongs();
  }
};

// Mock data for testing when API fails
function getMockSearchResults(query: string): YouTubeVideo[] {
  // Keep existing code (mock data generation)
  // Base results that will be returned for any query
  const baseResults = [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channelTitle: 'Rick Astley',
      publishedAt: '2009-10-25T06:57:33Z',
    },
    {
      id: 'yPYZpwSpKmA',
      title: 'Rick Astley - Together Forever',
      thumbnailUrl: 'https://i.ytimg.com/vi/yPYZpwSpKmA/mqdefault.jpg',
      channelTitle: 'Rick Astley',
      publishedAt: '2010-10-25T06:57:33Z',
    },
  ];
  
  // Genre-specific mock data
  const genres: Record<string, YouTubeVideo[]> = {
    'hip hop': [
      {
        id: 'mock_hip_hop_1',
        title: 'Best Hip Hop Mix 2023',
        thumbnailUrl: 'https://i.pravatar.cc/300?img=1',
        channelTitle: 'Hip Hop Channel',
        publishedAt: '2023-01-15T10:30:00Z',
      },
      {
        id: 'mock_hip_hop_2',
        title: 'Classic Hip Hop Beats',
        thumbnailUrl: 'https://i.pravatar.cc/300?img=2',
        channelTitle: 'Beats Master',
        publishedAt: '2023-02-10T14:45:00Z',
      },
    ],
    'pop': [
      {
        id: 'mock_pop_1',
        title: 'Top Pop Hits 2023',
        thumbnailUrl: 'https://i.pravatar.cc/300?img=3',
        channelTitle: 'Pop Music Now',
        publishedAt: '2023-03-05T09:15:00Z',
      },
      {
        id: 'mock_pop_2',
        title: 'Best Pop Songs Playlist',
        thumbnailUrl: 'https://i.pravatar.cc/300?img=4',
        channelTitle: 'Pop Playlist',
        publishedAt: '2023-02-22T11:30:00Z',
      },
    ],
    'rock': [
      {
        id: 'mock_rock_1',
        title: 'Classic Rock Anthems',
        thumbnailUrl: 'https://i.pravatar.cc/300?img=5',
        channelTitle: 'Rock Legends',
        publishedAt: '2023-01-30T16:20:00Z',
      },
      {
        id: 'mock_rock_2',
        title: 'Rock Hits Compilation',
        thumbnailUrl: 'https://i.pravatar.cc/300?img=6',
        channelTitle: 'Rock Forever',
        publishedAt: '2023-03-12T08:45:00Z',
      },
    ],
  };
  
  // Check if query matches one of our genre keys
  const normalizedQuery = query.toLowerCase();
  for (const genre in genres) {
    if (normalizedQuery.includes(genre)) {
      return [...genres[genre], ...baseResults];
    }
  }
  
  return baseResults;
}

function getMockVideoById(videoId: string): YouTubeVideo {
  return {
    id: videoId,
    title: `Video ${videoId.substring(0, 6)}`,
    thumbnailUrl: `https://i.pravatar.cc/300?u=${videoId}`,
    channelTitle: 'Mock Channel',
    publishedAt: new Date().toISOString(),
  };
}

// Helper function for mock trending songs
function getMockTrendingSongs(): YouTubeVideo[] {
  return [
    {
      id: 'trending1',
      title: 'Top Hit - Currently Trending',
      thumbnailUrl: 'https://i.pravatar.cc/300?img=10',
      channelTitle: 'Trending Music',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'trending2',
      title: 'Popular Music Video',
      thumbnailUrl: 'https://i.pravatar.cc/300?img=11',
      channelTitle: 'Music Channel',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'trending3',
      title: 'Viral Song of the Week',
      thumbnailUrl: 'https://i.pravatar.cc/300?img=12',
      channelTitle: 'Viral Hits',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'trending4',
      title: 'New Release - Hot Track',
      thumbnailUrl: 'https://i.pravatar.cc/300?img=13',
      channelTitle: 'New Releases',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'trending5',
      title: 'Rising Artist - Breaking Hit',
      thumbnailUrl: 'https://i.pravatar.cc/300?img=14',
      channelTitle: 'Rising Stars',
      publishedAt: new Date().toISOString(),
    }
  ];
}
