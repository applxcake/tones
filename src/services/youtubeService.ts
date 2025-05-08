
// Define the structure of a YouTube video
export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
}

// API key for YouTube Data API
const API_KEY = 'AIzaSyBAxmc3Rn7Id-bifTpe7iqsz5p8k1Otzdw';
const MAX_RESULTS = 10;

// Search YouTube videos by query
export const searchYouTubeVideos = async (query: string): Promise<YouTubeVideo[]> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${MAX_RESULTS}&q=${encodeURIComponent(
        query
      )}&key=${API_KEY}&type=video`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Error:', errorData);
      return getMockSearchResults(query);
    }

    const data = await response.json();
    
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
    // Return mock data in case of error
    return getMockSearchResults(query);
  }
};

// Get video details by ID
export const getYouTubeVideoById = async (videoId: string): Promise<YouTubeVideo | null> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`
    );

    if (!response.ok) {
      console.error('YouTube API Error:', await response.text());
      return getMockVideoById(videoId);
    }

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
    const videos = await searchYouTubeVideos(query);
    
    // Format results to match expected structure
    return {
      items: videos,
      nextPageToken: undefined // Mock implementation doesn't support paging
    };
  } catch (error) {
    console.error('Error in searchVideos:', error);
    return {
      items: getMockSearchResults(query),
      nextPageToken: undefined
    };
  }
};

// Get trending music implementation for the Explore page
export const getTrendingMusic = async (): Promise<YouTubeVideo[]> => {
  // For mock implementation, return some predefined results
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
};

// Mock data for testing when API fails
function getMockSearchResults(query: string): YouTubeVideo[] {
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
