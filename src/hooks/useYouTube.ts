import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  searchYouTubeVideos, 
  getYouTubeVideoById, 
  getTrendingMusic, 
  searchVideos as searchVideosService,
  preloadPopularContent,
  getMultipleVideoDetails,
  smartSearch as smartSearchService,
  clearCache,
  getCacheStats,
  YouTubeVideo 
} from '../services/youtubeService';

interface UseYouTubeOptions {
  enableCache?: boolean;
  preloadContent?: boolean;
}

interface UseYouTubeReturn {
  // Search functions
  searchVideos: (query: string) => Promise<YouTubeVideo[]>;
  searchVideosWithPagination: (query: string, pageToken?: string) => Promise<{ items: YouTubeVideo[]; nextPageToken?: string }>;
  smartSearch: (query: string, includeSuggestions?: boolean) => Promise<{ results: YouTubeVideo[]; suggestions?: string[] }>;
  
  // Video details
  getVideoById: (videoId: string) => Promise<YouTubeVideo | null>;
  getMultipleVideos: (videoIds: string[]) => Promise<(YouTubeVideo | null)[]>;
  
  // Trending content
  getTrending: () => Promise<YouTubeVideo[]>;
  
  // Cache management
  clearCache: () => void;
  getCacheStats: () => { videoCacheSize: number; searchCacheSize: number; pendingRequests: number; totalAPIKeys: number; availableAPIKeys: number };
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Preload function
  preloadContent: () => Promise<void>;
}

export const useYouTube = (options: UseYouTubeOptions = {}): UseYouTubeReturn => {
  const { enableCache = true, preloadContent: shouldPreload = false } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clear error when component unmounts or when new request starts
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Wrapper function to handle loading states and errors
  const withLoadingState = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    clearError();
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`${operationName} failed: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Search videos
  const searchVideos = useCallback(async (query: string): Promise<YouTubeVideo[]> => {
    return withLoadingState(
      () => searchYouTubeVideos(query),
      'Search videos'
    );
  }, [withLoadingState]);

  // Search videos with pagination
  const searchVideosWithPagination = useCallback(async (
    query: string, 
    pageToken?: string
  ): Promise<{ items: YouTubeVideo[]; nextPageToken?: string }> => {
    return withLoadingState(
      () => searchVideosService(query, pageToken),
      'Search videos with pagination'
    );
  }, [withLoadingState]);

  // Smart search
  const smartSearch = useCallback(async (
    query: string, 
    includeSuggestions = true
  ): Promise<{ results: YouTubeVideo[]; suggestions?: string[] }> => {
    return withLoadingState(
      () => smartSearchService(query, includeSuggestions),
      'Smart search'
    );
  }, [withLoadingState]);

  // Get video by ID
  const getVideoById = useCallback(async (videoId: string): Promise<YouTubeVideo | null> => {
    return withLoadingState(
      () => getYouTubeVideoById(videoId),
      'Get video by ID'
    );
  }, [withLoadingState]);

  // Get multiple videos
  const getMultipleVideos = useCallback(async (videoIds: string[]): Promise<(YouTubeVideo | null)[]> => {
    return withLoadingState(
      () => getMultipleVideoDetails(videoIds),
      'Get multiple videos'
    );
  }, [withLoadingState]);

  // Get trending music
  const getTrending = useCallback(async (): Promise<YouTubeVideo[]> => {
    return withLoadingState(
      () => getTrendingMusic(),
      'Get trending music'
    );
  }, [withLoadingState]);

  // Preload content
  const preloadContent = useCallback(async (): Promise<void> => {
    return withLoadingState(
      () => preloadPopularContent(),
      'Preload content'
    );
  }, [withLoadingState]);

  // Cache management
  const clearCacheHandler = useCallback(() => {
    clearCache();
    clearError();
  }, [clearError]);

  const getCacheStatsHandler = useCallback(() => {
    return getCacheStats();
  }, []);

  // Preload content on mount if enabled
  useEffect(() => {
    if (shouldPreload) {
      preloadContent().catch(console.error);
    }
  }, [shouldPreload, preloadContent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    searchVideos,
    searchVideosWithPagination,
    smartSearch,
    getVideoById,
    getMultipleVideos,
    getTrending,
    clearCache: clearCacheHandler,
    getCacheStats: getCacheStatsHandler,
    isLoading,
    error,
    preloadContent
  };
};

// Hook for components that need to track cache stats
export const useYouTubeCacheStats = () => {
  const [stats, setStats] = useState(getCacheStats());

  const refreshStats = useCallback(() => {
    setStats(getCacheStats());
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [refreshStats]);

  return { stats, refreshStats };
}; 