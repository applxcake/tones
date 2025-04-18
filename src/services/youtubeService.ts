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
  publishedAt: string;
}
