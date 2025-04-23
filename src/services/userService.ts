
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
    // Get user from Supabase
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !userData) {
      // User doesn't exist yet, create a new user
      const username = `User_${userId.substring(0, 5)}`;
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          username,
          created_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating user:', insertError);
      }
      
      return {
        id: userId,
        username,
        bio: '',
        followers: [],
        following: [],
        createdAt: new Date().toISOString(),
      };
    }
    
    // Get followers
    const { data: followers } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId);
    
    // Get following
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    
    // Get liked songs
    const { data: likedSongs } = await supabase
      .from('liked_songs')
      .select('song_id')
      .eq('user_id', userId);
    
    // Get profile picture from user_profiles table (if exists)
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // If profile picture exists in user_profiles but not in users table, update users table
    if (profileData?.profile_picture_url && !userData.avatar) {
      await supabase
        .from('users')
        .update({ avatar: profileData.profile_picture_url })
        .eq('id', userId);
    }
    
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar || (profileData?.profile_picture_url),
      bio: userData.bio || '',
      followers: followers?.map(f => f.follower_id) || [],
      following: following?.map(f => f.following_id) || [],
      likedSongs: likedSongs?.map(ls => ls.song_id) || [],
      createdAt: userData.created_at,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    // Query all users from Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
    
    if (error || !users || users.length === 0) {
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
    return users.map(user => ({
      id: user.id,
      username: user.username,
      avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.username}`,
      bio: user.bio || '',
      followers: [],  // Will be populated when needed
      following: [], // Will be populated when needed
      createdAt: user.created_at,
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

// Get user by ID
export const getUserById = async (userId: string) => {
  if (!userId) return null;
  
  try {
    // Get users from Supabase
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && userData) {
      // User exists in the database
      // Get followers
      const { data: followers } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId);
      
      // Get following
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      // Return user with followers and following
      return {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar,
        bio: userData.bio || '',
        followers: followers?.map(f => f.follower_id) || [],
        following: following?.map(f => f.following_id) || [],
        createdAt: userData.created_at,
      };
    }
    
    // If not found in database, check if it's one of our sample users
    if (['user2', 'user3', 'user4'].includes(userId)) {
      const mockUsers = await getAllUsers();
      const mockUser = mockUsers.find(user => user.id === userId);
      
      if (mockUser) {
        // Create the mock user in Supabase for persistence
        await supabase
          .from('users')
          .upsert({
            id: mockUser.id,
            username: mockUser.username,
            avatar: mockUser.avatar,
            bio: mockUser.bio,
            created_at: mockUser.createdAt
          });
        
        return mockUser;
      }
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
      .eq('following_id', userId);
      
    if (checkError) {
      throw new Error(`Error checking follow status: ${checkError.message}`);
    }
    
    if (existingFollow && existingFollow.length > 0) {
      toast({
        title: "Already Following",
        description: `You are already following this user.`,
      });
      return false;
    }
    
    // Create follow relationship
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: currentUserId,
        following_id: userId,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      throw new Error(`Error following user: ${error.message}`);
    }
      
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
      
    if (error) {
      throw new Error(`Error unfollowing user: ${error.message}`);
    }
      
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
    // Search in Supabase users
    const normalizedQuery = query.toLowerCase();
    
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${normalizedQuery}%,bio.ilike.%${normalizedQuery}%`);
    
    if (error) {
      throw new Error(`Error searching users: ${error.message}`);
    }
    
    if (users && users.length > 0) {
      return Promise.all(users.map(async (user) => {
        // Get followers and following counts
        const { count: followersCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', user.id);
        
        const { count: followingCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', user.id);
        
        return {
          id: user.id,
          username: user.username,
          avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.username}`,
          bio: user.bio || '',
          followers: [],
          following: [],
          followersCount: followersCount || 0,
          followingCount: followingCount || 0,
          createdAt: user.created_at,
        };
      }));
    }
    
    // Fallback to mock users if no results from database
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
    const { data: userExists, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw new Error(`Error checking if user exists: ${checkError.message}`);
    }
    
    if (!userExists) {
      // Create user if they don't exist
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          username: profile.username || `User_${userId.substring(0, 5)}`,
          email: profile.email,
          bio: profile.bio,
          avatar: profile.avatar,
          created_at: new Date().toISOString()
        });
      
      if (insertError) {
        throw new Error(`Error creating user: ${insertError.message}`);
      }
    } else {
      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: profile.username,
          email: profile.email,
          bio: profile.bio,
          avatar: profile.avatar
        })
        .eq('id', userId);
      
      if (updateError) {
        throw new Error(`Error updating user: ${updateError.message}`);
      }
    }
    
    // Save profile picture URL to user_profiles table for better organization
    if (profile.avatar) {
      // Check if profile exists in user_profiles
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();
      
      if (existingProfile) {
        // Update existing profile
        await supabase
          .from('user_profiles')
          .update({
            profile_picture_url: profile.avatar
          })
          .eq('user_id', userId);
      } else {
        // Create new profile
        await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            profile_picture_url: profile.avatar
          });
      }
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
    // Update the user's avatar in users table
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ avatar: imageUrl })
      .eq('id', userId);
    
    if (userUpdateError) {
      throw new Error(`Error updating user avatar: ${userUpdateError.message}`);
    }
    
    // Update or create in user_profiles table
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();
    
    if (existingProfile) {
      const { error } = await supabase
        .from('user_profiles')
        .update({ profile_picture_url: imageUrl })
        .eq('user_id', userId);
        
      if (error) {
        throw new Error(`Error updating profile picture: ${error.message}`);
      }
    } else {
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          profile_picture_url: imageUrl
        });
        
      if (error) {
        throw new Error(`Error inserting profile picture: ${error.message}`);
      }
    }
    
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
