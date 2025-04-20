
import axios from 'axios';

const API_KEY = 'AIzaSyDw396jNgBIcbQljAB-C0EHBtHw6OLdy3A';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  thumbnailUrl?: string; // Add this for backward compatibility
  publishedAt: string;
  channelTitle: string;
}

export interface YouTubeVideoBasic {
  id: string;
  title: string;
  thumbnail: string;
  thumbnailUrl?: string; // Add this for backward compatibility
  publishedAt: string;
  channelTitle?: string;
}

export const searchVideos = async (query: string): Promise<YouTubeVideo[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: 20,
        q: query,
        type: 'video',
        key: API_KEY
      }
    });

    return response.data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      thumbnailUrl: item.snippet.thumbnails.medium.url, // Add this for backward compatibility
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle
    }));
  } catch (error) {
    console.error('Error searching videos:', error);
    throw new Error('Failed to search videos');
  }
};

export const getTrendingMusic = async (): Promise<YouTubeVideo[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet',
        chart: 'mostPopular',
        videoCategoryId: '10', // Music category
        maxResults: 20,
        key: API_KEY
      }
    });

    return response.data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      thumbnailUrl: item.snippet.thumbnails.medium.url, // Add this for backward compatibility
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle
    }));
  } catch (error) {
    console.error('Error fetching trending music:', error);
    throw new Error('Failed to get trending music');
  }
};

export const getRecommendations = async (videoId: string): Promise<YouTubeVideo[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        relatedToVideoId: videoId,
        type: 'video',
        maxResults: 20,
        key: API_KEY
      }
    });

    return response.data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      thumbnailUrl: item.snippet.thumbnails.medium.url, // Add this for backward compatibility
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle
    }));
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw new Error('Failed to get recommendations');
  }
};

// Add the getTrendingMusicByGenre function since it's missing but used in GenreExplore.tsx
export const getTrendingMusicByGenre = async (genre: string): Promise<YouTubeVideo[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: `${genre} music`,
        type: 'video',
        videoCategoryId: '10', // Music category
        maxResults: 20,
        key: API_KEY
      }
    });

    return response.data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      thumbnailUrl: item.snippet.thumbnails.medium.url, // Add this for backward compatibility
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle
    }));
  } catch (error) {
    console.error(`Error fetching ${genre} music:`, error);
    throw new Error(`Failed to get ${genre} music`);
  }
};
