// Define the structure of a YouTube video
export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
}

// Multiple API keys for YouTube Data API
const API_KEYS = [
  'AIzaSyDNDvJQH39KgFcUkUMMQCSVDQWNm-hGYco', // Original key
  'AIzaSyDsH5aHG8Z8W7qJgkXF5frFpg_lA0hzyD0', // Second key
  'AIzaSyCpOSpVqn4HALDQ_Sj-8XrFVNfCLrtzvso'  // Third key
];

const MAX_RESULTS = 10;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const SEARCH_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for search results
const TRENDING_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for trending

// Cache interfaces
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface SearchCacheEntry {
  items: YouTubeVideo[];
  nextPageToken?: string;
  timestamp: number;
  expiresAt: number;
}

// Cache storage
const videoCache = new Map<string, CacheEntry<YouTubeVideo>>();
const searchCache = new Map<string, SearchCacheEntry>();
let trendingCache: CacheEntry<YouTubeVideo[]> | null = null;

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

// Track API key usage and quota status
interface APIKeyStatus {
  key: string;
  isQuotaExceeded: boolean;
  lastUsed: number;
  errorCount: number;
}

let apiKeyStatuses: APIKeyStatus[] = API_KEYS.map(key => ({
  key,
  isQuotaExceeded: false,
  lastUsed: 0,
  errorCount: 0
}));

// Helper function to get the best available API key
const getAPIKey = (): string | null => {
  const now = Date.now();
  
  // First, try keys that haven't exceeded quota
  const availableKeys = apiKeyStatuses.filter(status => !status.isQuotaExceeded);
  
  if (availableKeys.length > 0) {
    // Sort by last used time (least recently used first) and error count
    availableKeys.sort((a, b) => {
      if (a.errorCount !== b.errorCount) {
        return a.errorCount - b.errorCount; // Prefer keys with fewer errors
      }
      return a.lastUsed - b.lastUsed; // Then by least recently used
    });
    
    const selectedKey = availableKeys[0];
    selectedKey.lastUsed = now;
    return selectedKey.key;
  }
  
  // If all keys have exceeded quota, reset them and try again
  console.log('All API keys have exceeded quota, resetting status...');
  apiKeyStatuses.forEach(status => {
    status.isQuotaExceeded = false;
    status.errorCount = 0;
  });
  
  // Return the first key after reset
  const firstKey = apiKeyStatuses[0];
  firstKey.lastUsed = now;
  return firstKey.key;
};

// Helper function to mark an API key as quota exceeded
const markQuotaExceeded = (apiKey: string) => {
  const status = apiKeyStatuses.find(s => s.key === apiKey);
  if (status) {
    status.isQuotaExceeded = true;
    status.errorCount++;
    console.log(`API key ${apiKey.substring(0, 10)}... marked as quota exceeded`);
  }
};

// Helper function to delay execution (for retries)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Cache management functions
const isCacheValid = (entry: CacheEntry<any>): boolean => {
  return Date.now() < entry.expiresAt;
};

const createCacheEntry = <T>(data: T, duration: number): CacheEntry<T> => ({
  data,
  timestamp: Date.now(),
  expiresAt: Date.now() + duration
});

const cleanupExpiredCache = () => {
  const now = Date.now();
  
  // Cleanup video cache
  for (const [key, entry] of videoCache.entries()) {
    if (!isCacheValid(entry)) {
      videoCache.delete(key);
    }
  }
  
  // Cleanup search cache
  for (const [key, entry] of searchCache.entries()) {
    if (now >= entry.expiresAt) {
      searchCache.delete(key);
    }
  }
};

// Enhanced fetch with API key rotation and request deduplication
const fetchWithAPIKeyRotation = async (urlTemplate: string, cacheKey?: string, retries = MAX_RETRIES): Promise<Response> => {
  // Check if there's already a pending request for this URL
  if (cacheKey && pendingRequests.has(cacheKey)) {
    console.log(`Deduplicating request for: ${cacheKey}`);
    return pendingRequests.get(cacheKey) as Promise<Response>;
  }
  
  const fetchPromise = (async () => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      const apiKey = getAPIKey();
      
      if (!apiKey) {
        throw new Error('No available API keys');
      }
      
      const url = urlTemplate.replace('{API_KEY}', apiKey);
      
      try {
        const response = await fetch(url);
        
        if (response.ok) {
          return response;
        }
        
        // Check if it's a quota exceeded error
        if (response.status === 403) {
          const errorText = await response.text();
          if (errorText.includes('quota') || errorText.includes('quotaExceeded')) {
            markQuotaExceeded(apiKey);
            console.log(`Quota exceeded for API key ${apiKey.substring(0, 10)}..., trying next key...`);
            continue; // Try next API key
          }
        }
        
        // Handle rate limiting (429) or server errors (5xx)
        if ((response.status === 429 || response.status >= 500) && attempt < retries - 1) {
          console.log(`YouTube API returned ${response.status}. Retrying in ${RETRY_DELAY}ms...`);
          await delay(RETRY_DELAY);
          continue;
        }
        
        // Log detailed error for debugging
        const errorText = await response.text();
        console.error(`YouTube API Error (${response.status}):`, errorText);
        lastError = new Error(`YouTube API Error: ${response.status}`);
        
      } catch (error) {
        console.log(`Network error with API key ${apiKey.substring(0, 10)}...:`, error);
        lastError = error as Error;
        
        if (attempt < retries - 1) {
          console.log(`Retrying in ${RETRY_DELAY}ms...`);
          await delay(RETRY_DELAY);
        }
      }
    }
    
    throw lastError || new Error('All API keys failed');
  })();
  
  // Store the promise for deduplication
  if (cacheKey) {
    pendingRequests.set(cacheKey, fetchPromise);
    
    // Clean up the promise after it resolves
    fetchPromise.finally(() => {
      pendingRequests.delete(cacheKey);
    });
  }
  
  return fetchPromise;
};

// Search YouTube videos by query with caching
export const searchYouTubeVideos = async (query: string): Promise<YouTubeVideo[]> => {
  try {
    console.log(`Searching YouTube for: "${query}"`);
    
    // Cleanup expired cache entries
    cleanupExpiredCache();
    
    // Check cache first
    const cacheKey = `search:${query.toLowerCase().trim()}`;
    const cachedResult = searchCache.get(cacheKey);
    
    if (cachedResult && Date.now() < cachedResult.expiresAt) {
      console.log(`Returning cached search results for: "${query}"`);
      return cachedResult.items;
    }
    
    const urlTemplate = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${MAX_RESULTS}&q=${encodeURIComponent(
      query
    )}&key={API_KEY}&type=video`;
    
    const response = await fetchWithAPIKeyRotation(urlTemplate, cacheKey);
    const data = await response.json();
    
    console.log(`YouTube search returned ${data.items?.length || 0} results`);
    
    // Map the response to our YouTubeVideo format
    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));
    
    // Cache the results
    searchCache.set(cacheKey, {
      items: videos,
      timestamp: Date.now(),
      expiresAt: Date.now() + SEARCH_CACHE_DURATION
    });
    
    return videos;
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    // Show detailed error but still return mock data for better UX
    console.log('Falling back to mock data');
    return getMockSearchResults(query);
  }
};

// Get video details by ID with caching
export const getYouTubeVideoById = async (videoId: string): Promise<YouTubeVideo | null> => {
  try {
    // Cleanup expired cache entries
    cleanupExpiredCache();
    
    // Check cache first
    const cachedVideo = videoCache.get(videoId);
    if (cachedVideo && isCacheValid(cachedVideo)) {
      console.log(`Returning cached video: ${videoId}`);
      return cachedVideo.data;
    }
    
    const urlTemplate = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key={API_KEY}`;
    
    const response = await fetchWithAPIKeyRotation(urlTemplate, `video:${videoId}`);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      const videoData = {
        id: video.id,
        title: video.snippet.title,
        thumbnailUrl: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
      };
      
      // Cache the video
      videoCache.set(videoId, createCacheEntry(videoData, CACHE_DURATION));
      
      return videoData;
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
    
    // Cleanup expired cache entries
    cleanupExpiredCache();
    
    // Check cache first (only for first page)
    if (!pageToken) {
      const cacheKey = `search:${query.toLowerCase().trim()}`;
      const cachedResult = searchCache.get(cacheKey);
      
      if (cachedResult && Date.now() < cachedResult.expiresAt) {
        console.log(`Returning cached search results for: "${query}"`);
        return {
          items: cachedResult.items,
          nextPageToken: cachedResult.nextPageToken
        };
      }
    }
    
    let urlTemplate = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${MAX_RESULTS}&q=${encodeURIComponent(
      query
    )}&key={API_KEY}&type=video`;
    
    if (pageToken) {
      urlTemplate += `&pageToken=${pageToken}`;
    }
    
    const cacheKey = pageToken ? `search:${query}:${pageToken}` : `search:${query}`;
    const response = await fetchWithAPIKeyRotation(urlTemplate, cacheKey);
    const data = await response.json();
    
    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));
    
    const result = {
      items: videos,
      nextPageToken: data.nextPageToken
    };
    
    // Cache the results (only for first page)
    if (!pageToken) {
      searchCache.set(`search:${query.toLowerCase().trim()}`, {
        items: videos,
        nextPageToken: data.nextPageToken,
        timestamp: Date.now(),
        expiresAt: Date.now() + SEARCH_CACHE_DURATION
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error in searchVideos:', error);
    // Toast notification is handled by the component using this function
    
    return {
      items: getMockSearchResults(query),
      nextPageToken: undefined
    };
  }
};

// Get trending music implementation for the Explore page with caching
export const getTrendingMusic = async (): Promise<YouTubeVideo[]> => {
  try {
    // Cleanup expired cache entries
    cleanupExpiredCache();
    
    // Check cache first
    if (trendingCache && isCacheValid(trendingCache)) {
      console.log('Returning cached trending music');
      return trendingCache.data;
    }
    
    // Use YouTube's API to get music category videos
    const urlTemplate = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=10&maxResults=${MAX_RESULTS}&key={API_KEY}`;
    
    const response = await fetchWithAPIKeyRotation(urlTemplate, 'trending');
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const videos = data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
      }));
      
      // Cache the trending results
      trendingCache = createCacheEntry(videos, TRENDING_CACHE_DURATION);
      
      return videos;
    }
    
    throw new Error('No trending music found');
  } catch (error) {
    console.error('Error fetching trending music:', error);
    // Return mock data for trending music
    return getMockTrendingSongs();
  }
};

// Cache management utilities
export const clearCache = () => {
  videoCache.clear();
  searchCache.clear();
  pendingRequests.clear();
  trendingCache = null;
  console.log('All caches cleared');
};

export const getCacheStats = () => {
  return {
    videoCacheSize: videoCache.size,
    searchCacheSize: searchCache.size,
    pendingRequests: pendingRequests.size,
    totalAPIKeys: API_KEYS.length,
    availableAPIKeys: apiKeyStatuses.filter(k => !k.isQuotaExceeded).length
  };
};

// Preload popular content to improve user experience
export const preloadPopularContent = async () => {
  try {
    console.log('Preloading popular content...');
    
    // Preload trending music
    await getTrendingMusic();
    
    // Preload some popular search terms
    const popularTerms = ['pop music', 'hip hop', 'rock music', 'electronic music'];
    await Promise.allSettled(
      popularTerms.map(term => searchYouTubeVideos(term))
    );
    
    console.log('Popular content preloaded successfully');
  } catch (error) {
    console.error('Error preloading content:', error);
  }
};

// Batch video details fetching for efficiency
export const getMultipleVideoDetails = async (videoIds: string[]): Promise<(YouTubeVideo | null)[]> => {
  try {
    // Filter out already cached videos
    const uncachedIds = videoIds.filter(id => {
      const cached = videoCache.get(id);
      return !cached || !isCacheValid(cached);
    });
    
    if (uncachedIds.length === 0) {
      // All videos are cached
      return videoIds.map(id => {
        const cached = videoCache.get(id);
        return cached ? cached.data : null;
      });
    }
    
    // Fetch uncached videos in batches (YouTube API allows up to 50 IDs per request)
    const batchSize = 50;
    const results: (YouTubeVideo | null)[] = new Array(videoIds.length);
    
    for (let i = 0; i < uncachedIds.length; i += batchSize) {
      const batch = uncachedIds.slice(i, i + batchSize);
      const idsParam = batch.join(',');
      
      const urlTemplate = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${idsParam}&key={API_KEY}`;
      const response = await fetchWithAPIKeyRotation(urlTemplate, `batch:${idsParam}`);
      const data = await response.json();
      
      // Create a map of fetched videos
      const fetchedVideos = new Map<string, YouTubeVideo>();
      if (data.items) {
        data.items.forEach((item: any) => {
          const videoData = {
            id: item.id,
            title: item.snippet.title,
            thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
          };
          fetchedVideos.set(item.id, videoData);
          videoCache.set(item.id, createCacheEntry(videoData, CACHE_DURATION));
        });
      }
      
      // Fill results for this batch
      batch.forEach(id => {
        const video = fetchedVideos.get(id) || null;
        const originalIndex = videoIds.indexOf(id);
        if (originalIndex !== -1) {
          results[originalIndex] = video;
        }
      });
    }
    
    // Fill in cached results
    videoIds.forEach((id, index) => {
      if (results[index] === undefined) {
        const cached = videoCache.get(id);
        results[index] = cached ? cached.data : null;
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error fetching multiple video details:', error);
    // Fallback to individual requests
    return Promise.all(videoIds.map(id => getYouTubeVideoById(id)));
  }
};

// Smart search with suggestions and caching
export const smartSearch = async (query: string, includeSuggestions = true): Promise<{
  results: YouTubeVideo[];
  suggestions?: string[];
}> => {
  try {
    const results = await searchYouTubeVideos(query);
    
    if (!includeSuggestions) {
      return { results };
    }
    
    // Generate search suggestions based on the query
    const suggestions = generateSearchSuggestions(query);
    
    return { results, suggestions };
  } catch (error) {
    console.error('Error in smart search:', error);
    return { results: getMockSearchResults(query) };
  }
};

// Generate search suggestions based on the query
const generateSearchSuggestions = (query: string): string[] => {
  const normalizedQuery = query.toLowerCase().trim();
  
  const suggestions: string[] = [];
  
  // Add genre-based suggestions
  if (normalizedQuery.includes('pop')) {
    suggestions.push('pop hits 2024', 'top pop songs', 'pop music playlist');
  } else if (normalizedQuery.includes('hip') || normalizedQuery.includes('rap')) {
    suggestions.push('hip hop hits', 'rap music 2024', 'hip hop playlist');
  } else if (normalizedQuery.includes('rock')) {
    suggestions.push('rock classics', 'rock hits 2024', 'rock music playlist');
  } else if (normalizedQuery.includes('electronic') || normalizedQuery.includes('edm')) {
    suggestions.push('electronic music', 'edm hits', 'electronic playlist');
  }
  
  // Add general suggestions
  suggestions.push(
    `${query} official music video`,
    `${query} live performance`,
    `${query} acoustic version`,
    `${query} remix`
  );
  
  // Remove duplicates and limit to 5 suggestions
  return [...new Set(suggestions)].slice(0, 5);
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
