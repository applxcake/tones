
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create songs table
CREATE TABLE IF NOT EXISTS public.songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  channel_title TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER
);

-- Create follows table (for following relationships)
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- Create playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create playlist_songs table (join table for playlists and songs)
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(playlist_id, song_id)
);

-- Create liked_songs table
CREATE TABLE IF NOT EXISTS public.liked_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  liked_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, song_id)
);

-- Create recently_played table
CREATE TABLE IF NOT EXISTS public.recently_played (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user profile table for additional user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON public.playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_liked_songs_user_id ON public.liked_songs(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_played_user_id ON public.recently_played(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

-- Create RLS policies (Row Level Security)
-- Enable row level security on all tables
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_played ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Public read access to songs
CREATE POLICY "Songs are publicly viewable" ON public.songs FOR SELECT USING (true);

-- Playlists can be viewed by anyone
CREATE POLICY "Playlists are viewable by anyone" ON public.playlists FOR SELECT USING (true);

-- Users can only insert/update/delete their own playlists
CREATE POLICY "Users can insert their own playlists" ON public.playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own playlists" ON public.playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own playlists" ON public.playlists FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for liked songs, playlist songs, etc.
CREATE POLICY "Users can insert their own liked songs" ON public.liked_songs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own liked songs" ON public.liked_songs FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own liked songs" ON public.liked_songs FOR SELECT USING (auth.uid() = user_id);

-- Playlist songs policies
CREATE POLICY "Anyone can view playlist songs" ON public.playlist_songs FOR SELECT USING (true);
CREATE POLICY "Users can insert songs into their playlists" ON public.playlist_songs 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can delete songs from their playlists" ON public.playlist_songs 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid())
  );

-- Profile policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Recently played policies
CREATE POLICY "Users can view their recently played" ON public.recently_played FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their recently played" ON public.recently_played FOR INSERT WITH CHECK (auth.uid() = user_id);
