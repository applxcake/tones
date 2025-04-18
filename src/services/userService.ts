
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

// Get current user - returns a promise
export const getCurrentUser = async (userId?: string) => {
  if (!userId) return null;
  
  try {
    // Get followers
    const { data: followers, error: followersError } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId);
      
    if (followersError) throw followersError;
    
    // Get following
    const { data: following, error: followingError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
      
    if (followingError) throw followingError;
    
    // Get user from auth (need to create a user profile table in a real app)
    const { data: authUser } = await supabase.auth.getUser();
    
    if (!authUser?.user) return null;
    
    return {
      id: authUser.user.id,
      username: authUser.user.user_metadata?.username || authUser.user.email?.split('@')[0] || 'User',
      email: authUser.user.email,
      avatar: authUser.user.user_metadata?.avatar_url,
      bio: authUser.user.user_metadata?.bio || '',
      followers: followers?.map(f => f.follower_id) || [],
      following: following?.map(f => f.following_id) || [],
      createdAt: authUser.user.created_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    // In a real app, you'd have a users/profiles table
    // This is simplified - we'll return mock data
    return [
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
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

// Get user by ID
export const getUserById = async (userId: string) => {
  if (userId === 'current-user') {
    return getCurrentUser();
  }
  
  try {
    // In a real app, you'd fetch from a users/profiles table
    // This is simplified - we'll return mock data for sample users
    if (['user2', 'user3', 'user4'].includes(userId)) {
      const mockUsers = await getAllUsers();
      return mockUsers.find(user => user.id === userId) || null;
    }
    
    return null;
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
    // Check if already following
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', currentUserId)
      .eq('following_id', userId)
      .single();
      
    if (existingFollow) {
      toast({
        title: "Already Following",
        description: `You are already following this user.`,
      });
      return false;
    }
    
    // Create follow relationship
    const { error } = await supabase
      .from('follows')
      .insert([{
        follower_id: currentUserId,
        following_id: userId,
      }]);
      
    if (error) throw error;
    
    toast({
      title: "Following",
      description: `You are now following this user.`,
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
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', userId);
      
    if (error) throw error;
    
    toast({
      title: "Unfollowed",
      description: `You are no longer following this user.`,
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
export const searchUsers = async (query: string) => {
  if (!query) return [];
  
  try {
    // In a real app, you would query the database here
    // For now, we'll filter the mock users
    const allUsers = await getAllUsers();
    const normalizedQuery = query.toLowerCase();
    
    return allUsers.filter(user => 
      user.username.toLowerCase().includes(normalizedQuery) || 
      (user.bio && user.bio.toLowerCase().includes(normalizedQuery))
    );
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
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
    const { error } = await supabase.auth.updateUser({
      data: {
        username: profile.username,
        bio: profile.bio,
        avatar_url: profile.avatar
      }
    });
    
    if (error) throw error;
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated.",
    });
    
    return getCurrentUser(userId);
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
