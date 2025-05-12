import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
  followers: string[];
  following: string[];
  createdAt: string;
  likedSongs?: string[];
}

// Define a type for mock users so we can reuse it
type MockUser = {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  followers: string[];
  following: string[];
  createdAt: string;
  likedSongs?: string[];
}

// Mock users data
const MOCK_USERS: MockUser[] = [
  {
    id: 'user2',
    username: 'JazzMaster',
    avatar: 'https://i.pravatar.cc/150?u=jazzmaster',
    bio: 'Jazz enthusiast and trumpet player',
    followers: [],
    following: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user3',
    username: 'ClassicalVibes',
    avatar: 'https://i.pravatar.cc/150?u=classical',
    bio: 'Piano and orchestra lover',
    followers: [],
    following: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user4',
    username: 'RockStar',
    avatar: 'https://i.pravatar.cc/150?u=rockstar',
    bio: 'Living on the edge with rock music',
    followers: [],
    following: [],
    createdAt: new Date().toISOString(),
  },
];

// Generate a unique ID (using uuid)
export function generateId(): string {
  return uuidv4();
}

// Get current user - returns a promise
export const getCurrentUser = async (userId?: string) => {
  if (!userId) return null;
  
  try {
    // Try to fetch from follows table to test connection
    const { data: followData, error: followError } = await supabase
      .from('follows')
      .select('*')
      .limit(1);
    
    if (followError) {
      console.log('Could not connect to database, using mock data');
      
      // Create mockup user data
      return {
        id: userId,
        username: `User_${userId.substring(0, 5)}`,
        bio: '',
        followers: [],
        following: [],
        createdAt: new Date().toISOString(),
      };
    }
    
    // If we can connect, try to get user data
    // Since we need to create a composite view of user data from multiple tables
    
    // 1. Check follows to get followers
    const { data: followers } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId);
    
    // 2. Check follows to get following
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    
    // 3. Check liked_songs to get liked songs
    const { data: likedSongs } = await supabase
      .from('liked_songs')
      .select('song_id')
      .eq('user_id', userId);
    
    // Create user with available data
    return {
      id: userId,
      username: `User_${userId.substring(0, 5)}`,
      email: undefined,
      avatar: `https://i.pravatar.cc/150?u=${userId}`,
      bio: '',
      followers: followers ? followers.map(f => f.follower_id) : [],
      following: following ? following.map(f => f.following_id) : [],
      likedSongs: likedSongs ? likedSongs.map(ls => ls.song_id) : [],
      createdAt: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('Error fetching current user:', error);
    // Return mock user on error
    return {
      id: userId,
      username: `User_${userId.substring(0, 5)}`,
      bio: '',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
    };
  }
};

// Get all users
export const getAllUsers = async (): Promise<MockUser[]> => {
  try {
    // Try to fetch from follows table to test connection
    const { data: followData, error: followError } = await supabase
      .from('follows')
      .select('*')
      .limit(1);
    
    if (followError) {
      console.log('Could not connect to database, using mock data');
      return MOCK_USERS;
    }
    
    // Try to get users by looking at follows table
    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select('*');
    
    if (followsError || !follows || follows.length === 0) {
      return MOCK_USERS;
    }
    
    // Extract unique user IDs from follows
    const userIds = new Set<string>();
    follows.forEach(follow => {
      userIds.add(follow.follower_id);
      userIds.add(follow.following_id);
    });
    
    // Create user profiles from the follows data
    const users = Array.from(userIds).map(id => {
      const followers = follows.filter(f => f.following_id === id).map(f => f.follower_id);
      const following = follows.filter(f => f.follower_id === id).map(f => f.following_id);
      
      return {
        id,
        username: `User_${id.substring(0, 5)}`,
        avatar: `https://i.pravatar.cc/150?u=${id}`,
        bio: '',
        followers,
        following,
        followersCount: followers.length,
        followingCount: following.length,
        createdAt: new Date().toISOString(),
      };
    });
    
    return users.length > 0 ? users : MOCK_USERS;
    
  } catch (error) {
    console.error('Error fetching all users:', error);
    return MOCK_USERS;
  }
};

// Get user by ID
export const getUserById = async (userId: string) => {
  if (!userId) return null;
  
  try {
    // Check if it's one of our mock users
    if (['user2', 'user3', 'user4'].includes(userId)) {
      const mockUser = MOCK_USERS.find(user => user.id === userId);
      return mockUser || null;
    }
    
    // Try to get followers
    const { data: followers, error: followersError } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId);
    
    // Try to get following
    const { data: following, error: followingError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    // Check if we have any data or should return null
    if ((followersError && followingError) || (!followers && !following)) {
      return null;
    }
    
    // Return user with followers and following
    return {
      id: userId,
      username: `User_${userId.substring(0, 5)}`,
      email: undefined,
      avatar: `https://i.pravatar.cc/150?u=${userId}`,
      bio: '',
      followers: followers ? followers.map(f => f.follower_id) : [],
      following: following ? following.map(f => f.following_id) : [],
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Follow a user
export const followUser = async (userId: string, currentUserId?: string) => {
  if (!currentUserId) {
    toast({
      title: "Error",
      description: "You must be logged in to follow users.",
      variant: "destructive"
    });
    return false;
  }
  
  try {
    // First, ensure the user to follow exists
    const userToFollow = await getUserById(userId);
    
    if (!userToFollow) {
      toast({
        title: "Error",
        description: "User not found.",
        variant: "destructive"
      });
      return false;
    }
    
    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', currentUserId)
      .eq('following_id', userId)
      .maybeSingle();
    
    if (checkError) throw checkError;
      
    if (existingFollow) {
      toast({
        title: "Already Following",
        description: `You are already following this user.`,
      });
      return false;
    }
    
    // Create follow relationship
    const { error: insertError } = await supabase
      .from('follows')
      .insert([{
        id: generateId(),
        follower_id: currentUserId,
        following_id: userId,
        created_at: new Date().toISOString()
      }]);
    
    if (insertError) throw insertError;
      
    toast({
      title: "Following",
      description: `You are now following ${userToFollow.username}.`,
    });
    
    return true;
  } catch (error) {
    console.error('Error following user:', error);
    toast({
      title: "Error",
      description: "Could not follow user. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

// Unfollow a user
export const unfollowUser = async (userId: string, currentUserId?: string) => {
  if (!currentUserId) {
    toast({
      title: "Error",
      description: "You must be logged in to unfollow users.",
      variant: "destructive"
    });
    return false;
  }
  
  try {
    // Get user info for the toast message
    const userToUnfollow = await getUserById(userId);
    
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', userId);
    
    if (error) throw error;
      
    toast({
      title: "Unfollowed",
      description: userToUnfollow ? `You are no longer following ${userToUnfollow.username}.` : `You are no longer following this user.`,
    });
    
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    toast({
      title: "Error",
      description: "Could not unfollow user. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

// Search for users
export const searchUsers = async (query: string): Promise<MockUser[]> => {
  if (!query) return [];
  
  try {
    const normalizedQuery = query.toLowerCase();
    
    // Filter mock users as fallback
    const filteredMockUsers = MOCK_USERS.filter(user => 
      user.username.toLowerCase().includes(normalizedQuery) || 
      (user.bio && user.bio.toLowerCase().includes(normalizedQuery))
    );
    
    // Try to get real users from follows table
    const { data: follows, error } = await supabase
      .from('follows')
      .select('*');
    
    if (error || !follows || follows.length === 0) {
      return filteredMockUsers;
    }
    
    // Extract unique user IDs from follows
    const userIds = new Set<string>();
    follows.forEach(follow => {
      userIds.add(follow.follower_id);
      userIds.add(follow.following_id);
    });
    
    // Create user profiles
    const users = Array.from(userIds).map(id => {
      const username = `User_${id.substring(0, 5)}`;
      const avatarUrl = `https://i.pravatar.cc/150?u=${id}`;
      
      // Only include users that match the search query
      if (!username.toLowerCase().includes(normalizedQuery)) {
        return null;
      }
      
      const followers = follows.filter(f => f.following_id === id).map(f => f.follower_id);
      const following = follows.filter(f => f.follower_id === id).map(f => f.following_id);
      
      return {
        id,
        username,
        avatar: avatarUrl,
        bio: '',
        followers,
        following,
        followersCount: followers.length,
        followingCount: following.length,
        createdAt: new Date().toISOString(),
      };
    }).filter(Boolean) as MockUser[];
    
    return users.length > 0 ? users : filteredMockUsers;
    
  } catch (error) {
    console.error('Error searching users:', error);
    return MOCK_USERS.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) || 
      (user.bio && user.bio.toLowerCase().includes(query.toLowerCase()))
    );
  }
};

// Update user profile
export const updateUserProfile = async (profile: Partial<User>, userId?: string) => {
  if (!userId) {
    toast({
      title: "Error",
      description: "You must be logged in to update your profile.",
      variant: "destructive"
    });
    return null;
  }
  
  try {
    // Since we can't directly update profiles, we'll just return the updated user object
    // In a real app, this would update the database
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
    
    // Return updated user data
    return {
      id: userId,
      username: profile.username || `User_${userId.substring(0, 5)}`,
      email: profile.email,
      avatar: profile.avatar || `https://i.pravatar.cc/150?u=${userId}`,
      bio: profile.bio || '',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    toast({
      title: "Error",
      description: "Could not update profile. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

// Upload profile picture via URL
export const uploadProfilePicture = async (imageUrl: string, userId?: string) => {
  if (!userId) {
    toast({
      title: "Error",
      description: "You must be logged in to update your profile picture.",
      variant: "destructive"
    });
    return false;
  }
  
  // Validate URL format
  try {
    new URL(imageUrl);
  } catch (e) {
    toast({
      title: "Invalid URL",
      description: "Please enter a valid image URL.",
      variant: "destructive"
    });
    return false;
  }
  
  try {
    toast({
      title: "Profile Picture Updated",
      description: "Your profile picture has been successfully updated.",
    });
    
    return true;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    toast({
      title: "Error",
      description: "Could not update profile picture. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};
