
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

// Generate a unique ID (using uuid)
export function generateId(): string {
  return uuidv4();
}

// Get current user - returns a promise
export const getCurrentUser = async (userId?: string) => {
  if (!userId) return null;
  
  try {
    // Using raw query to check if profiles table exists
    const { data: profileData, error: profileError } = await supabase
      .rpc('get_profile_by_id', { user_id_param: userId })
      .throwOnError();
    
    if (profileError) {
      console.log('Could not find profile, will create a new one');
      
      // User profile doesn't exist yet, create a new one with raw SQL
      const username = `User_${userId.substring(0, 5)}`;
      
      // Create mockup user data
      return {
        id: userId,
        username,
        bio: '',
        followers: [],
        following: [],
        createdAt: new Date().toISOString(),
      };
    }
    
    // If we have a profile, use it
    if (profileData && Array.isArray(profileData) && profileData.length > 0) {
      const profile = profileData[0];
      
      // Get followers using a custom function
      const { data: followers } = await supabase
        .rpc('get_followers', { user_id_param: userId })
        .throwOnError();
      
      // Get following
      const { data: following } = await supabase
        .rpc('get_following', { user_id_param: userId })
        .throwOnError();
      
      // Get liked songs
      const { data: likedSongs } = await supabase
        .rpc('get_liked_songs', { user_id_param: userId })
        .throwOnError();
      
      return {
        id: profile.id,
        username: profile.username || `User_${userId.substring(0, 5)}`,
        email: profile.email,
        avatar: profile.avatar_url,
        bio: profile.bio || '',
        followers: followers?.map(f => f.follower_id) || [],
        following: following?.map(f => f.following_id) || [],
        likedSongs: likedSongs?.map(ls => ls.song_id) || [],
        createdAt: profile.created_at,
      };
    }
    
    // Fallback to mock user
    return {
      id: userId,
      username: `User_${userId.substring(0, 5)}`,
      bio: '',
      followers: [],
      following: [],
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
export const getAllUsers = async () => {
  try {
    // Use a custom RPC function to get user profiles
    const { data: profiles, error: profilesError } = await supabase
      .rpc('get_all_profiles')
      .throwOnError();
    
    if (profilesError || !profiles || profiles.length === 0) {
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
    }
    
    // Process database users
    return Promise.all(profiles.map(async (profile) => {
      // Get followers count
      const { data: followersData } = await supabase
        .rpc('count_followers', { user_id_param: profile.id })
        .throwOnError();
      
      const followersCount = followersData ? followersData[0]?.count || 0 : 0;
      
      // Get following count
      const { data: followingData } = await supabase
        .rpc('count_following', { user_id_param: profile.id })
        .throwOnError();
      
      const followingCount = followingData ? followingData[0]?.count || 0 : 0;
      
      return {
        id: profile.id,
        username: profile.username || `User_${profile.id.substring(0, 5)}`,
        avatar: profile.avatar_url || `https://i.pravatar.cc/150?u=${profile.username || profile.id}`,
        bio: profile.bio || '',
        followers: [],
        following: [],
        followersCount,
        followingCount,
        createdAt: profile.created_at || new Date().toISOString(),
      };
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
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
  }
};

// Get user by ID
export const getUserById = async (userId: string) => {
  if (!userId) return null;
  
  try {
    // Get user with RPC function
    const { data: profileData, error: profileError } = await supabase
      .rpc('get_profile_by_id', { user_id_param: userId })
      .throwOnError();

    if (profileError || !profileData || profileData.length === 0) {
      // Check if it's one of our sample users
      if (['user2', 'user3', 'user4'].includes(userId)) {
        const mockUsers = await getAllUsers();
        const mockUser = mockUsers.find(user => user.id === userId);
        
        return mockUser || null;
      }
      
      return null;
    }
    
    const profile = profileData[0];
    
    // Get followers
    const { data: followers } = await supabase
      .rpc('get_followers', { user_id_param: userId })
      .throwOnError();
    
    // Get following
    const { data: following } = await supabase
      .rpc('get_following', { user_id_param: userId })
      .throwOnError();

    // Return user with followers and following
    return {
      id: profile.id,
      username: profile.username || `User_${userId.substring(0, 5)}`,
      email: profile.email,
      avatar: profile.avatar_url,
      bio: profile.bio || '',
      followers: followers?.map(f => f.follower_id) || [],
      following: following?.map(f => f.following_id) || [],
      createdAt: profile.created_at || new Date().toISOString(),
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
export const searchUsers = async (query: string) => {
  if (!query) return [];
  
  try {
    // Search in Supabase
    const normalizedQuery = query.toLowerCase();
    
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${normalizedQuery}%,bio.ilike.%${normalizedQuery}%`);
    
    if (error) throw error;
    
    if (users && users.length > 0) {
      return Promise.all(users.map(async (user) => {
        // Get followers and following counts
        const { data: followers } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', user.id);
        
        const { data: following } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', user.id);
        
        return {
          id: user.id,
          username: user.username,
          avatar: user.avatar_url || `https://i.pravatar.cc/150?u=${user.username}`,
          bio: user.bio || '',
          followers: [],
          following: [],
          followersCount: followers ? followers.length : 0,
          followingCount: following ? following.length : 0,
          createdAt: user.created_at,
        };
      }));
    }
    
    // Fallback to mock users if no results from Supabase
    const allUsers = await getAllUsers();
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
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    const updates = {
      username: profile.username,
      email: profile.email,
      bio: profile.bio,
      avatar_url: profile.avatar,
      updated_at: new Date().toISOString()
    };
    
    if (!existingProfile) {
      // Create new profile
      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          ...updates,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (insertError) throw insertError;
    } else {
      // Update existing profile
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
        
      if (updateError) throw updateError;
    }
    
    // Return updated user data
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
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
    
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
