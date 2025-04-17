import { toast } from '@/components/ui/use-toast';

// Use the new API key provided by the user
const API_KEY = 'AIzaSyD_-rqFfFxCzPFqT9fhLUPri0DGoSCRMsE';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export interface YouTubeSearchResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
}

export const searchVideos = async (
  query: string,
  pageToken?: string
): Promise<YouTubeSearchResponse> => {
  try {
    const params = new URLSearchParams({
      part: 'snippet',
      maxResults: '20',
      q: query,
      type: 'video',
      videoCategoryId: '10', // Music category
      key: API_KEY,
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    const response = await fetch(`${BASE_URL}/search?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Network response was not ok');
    }
    
    const data = await response.json();
    
    const videos: YouTubeVideo[] = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
    }));
    
    return {
      items: videos,
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    console.error('Error fetching videos:', error);
    toast({
      title: "Error fetching videos",
      description: error instanceof Error ? error.message : "There was a problem with the YouTube API.",
      variant: "destructive"
    });
    return { items: [] };
  }
};

export const getTrendingMusic = async (): Promise<YouTubeVideo[]> => {
  try {
    const params = new URLSearchParams({
      part: 'snippet',
      chart: 'mostPopular',
      videoCategoryId: '10', // Music category
      maxResults: '20',
      key: API_KEY,
    });

    const response = await fetch(`${BASE_URL}/videos?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Network response was not ok');
    }
    
    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('Error fetching trending music:', error);
    toast({
      title: "Error fetching trends",
      description: error instanceof Error ? error.message : "There was a problem with the YouTube API.",
      variant: "destructive"
    });
    return [];
  }
};

export const getRecommendedMusic = async (videoId: string): Promise<YouTubeVideo[]> => {
  try {
    const params = new URLSearchParams({
      part: 'snippet',
      relatedToVideoId: videoId,
      type: 'video',
      maxResults: '10',
      key: API_KEY,
    });

    const response = await fetch(`${BASE_URL}/search?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('Error fetching recommended music:', error);
    toast({
      title: "Error fetching recommendations",
      description: "There was a problem with the YouTube API.",
      variant: "destructive"
    });
    return [];
  }
};
