
import { toast } from '@/components/ui/use-toast';
import { executeQuery, generateId } from '@/integrations/neondb/client';

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
    // Get user from PostgreSQL database
    const userData = await executeQuery<any[]>(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    if (!userData || userData.length === 0) {
      // User doesn't exist yet, create a new user
      const username = `User_${userId.substring(0, 5)}`;
      
      await executeQuery(
        'INSERT INTO users (id, username, created_at) VALUES ($1, $2, $3)',
        [userId, username, new Date().toISOString()]
      );
      
      return {
        id: userId,
        username,
        bio: '',
        followers: [],
        following: [],
        createdAt: new Date().toISOString(),
      };
    }
    
    const user = userData[0];
    
    // Get followers
    const followers = await executeQuery<any[]>(
      'SELECT follower_id FROM follows WHERE following_id = $1',
      [userId]
    );
    
    // Get following
    const following = await executeQuery<any[]>(
      'SELECT following_id FROM follows WHERE follower_id = $1',
      [userId]
    );
    
    // Get liked songs
    const likedSongs = await executeQuery<any[]>(
      'SELECT song_id FROM liked_songs WHERE user_id = $1',
      [userId]
    );
    
    // Get profile picture from user_profiles table (if exists)
    const profileData = await executeQuery<any[]>(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    
    // If profile picture exists in user_profiles but not in users table, update users table
    if (profileData.length > 0 && profileData[0].profile_picture_url && !user.avatar) {
      await executeQuery(
        'UPDATE users SET avatar = $1 WHERE id = $2',
        [profileData[0].profile_picture_url, userId]
      );
    }
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar || (profileData.length > 0 ? profileData[0].profile_picture_url : undefined),
      bio: user.bio || '',
      followers: followers.map(f => f.follower_id) || [],
      following: following.map(f => f.following_id) || [],
      likedSongs: likedSongs.map(ls => ls.song_id) || [],
      createdAt: user.created_at,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    // Query all users from database
    const users = await executeQuery<any[]>('SELECT * FROM users');
    
    if (!users || users.length === 0) {
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
    return Promise.all(users.map(async (user) => {
      // Get followers and following counts for each user
      const { rowCount: followersCount } = await executeQuery<any>(
        'SELECT COUNT(*) FROM follows WHERE following_id = $1',
        [user.id]
      );
      
      const { rowCount: followingCount } = await executeQuery<any>(
        'SELECT COUNT(*) FROM follows WHERE follower_id = $1',
        [user.id]
      );
      
      return {
        id: user.id,
        username: user.username,
        avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.username}`,
        bio: user.bio || '',
        followers: [],  // Will be populated when needed
        following: [], // Will be populated when needed
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
        createdAt: user.created_at,
      };
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
    // Get users from database
    const userData = await executeQuery<any[]>(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (userData && userData.length > 0) {
      // User exists in the database
      const user = userData[0];
      
      // Get followers
      const followers = await executeQuery<any[]>(
        'SELECT follower_id FROM follows WHERE following_id = $1',
        [userId]
      );
      
      // Get following
      const following = await executeQuery<any[]>(
        'SELECT following_id FROM follows WHERE follower_id = $1',
        [userId]
      );

      // Return user with followers and following
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio || '',
        followers: followers.map(f => f.follower_id) || [],
        following: following.map(f => f.following_id) || [],
        createdAt: user.created_at,
      };
    }
    
    // If not found in database, check if it's one of our sample users
    if (['user2', 'user3', 'user4'].includes(userId)) {
      const mockUsers = await getAllUsers();
      const mockUser = mockUsers.find(user => user.id === userId);
      
      if (mockUser) {
        // Create the mock user in PostgreSQL for persistence
        await executeQuery(
          'INSERT INTO users (id, username, avatar, bio, created_at) VALUES ($1, $2, $3, $4, $5)',
          [mockUser.id, mockUser.username, mockUser.avatar, mockUser.bio, mockUser.createdAt]
        );
        
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
    const existingFollow = await executeQuery<any[]>(
      'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
      [currentUserId, userId]
    );
      
    if (existingFollow && existingFollow.length > 0) {
      toast({
        title: "Already Following",
        description: `You are already following this user.`,
      });
      return false;
    }
    
    // Create follow relationship
    await executeQuery(
      'INSERT INTO follows (id, follower_id, following_id, created_at) VALUES ($1, $2, $3, $4)',
      [generateId(), currentUserId, userId, new Date().toISOString()]
    );
      
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
    
    const result = await executeQuery(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
      [currentUserId, userId]
    );
      
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
    // Search in database users
    const normalizedQuery = query.toLowerCase();
    
    const users = await executeQuery<any[]>(
      "SELECT * FROM users WHERE LOWER(username) LIKE $1 OR LOWER(bio) LIKE $1",
      [`%${normalizedQuery}%`]
    );
    
    if (users && users.length > 0) {
      return Promise.all(users.map(async (user) => {
        // Get followers and following counts
        const followersCount = await executeQuery<any>(
          'SELECT COUNT(*) FROM follows WHERE following_id = $1',
          [user.id]
        );
        
        const followingCount = await executeQuery<any>(
          'SELECT COUNT(*) FROM follows WHERE follower_id = $1',
          [user.id]
        );
        
        return {
          id: user.id,
          username: user.username,
          avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.username}`,
          bio: user.bio || '',
          followers: [],
          following: [],
          followersCount: parseInt(followersCount[0]?.count || '0'),
          followingCount: parseInt(followingCount[0]?.count || '0'),
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
    const userExists = await executeQuery<any[]>(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );
    
    if (!userExists || userExists.length === 0) {
      // Create user if they don't exist
      await executeQuery(
        'INSERT INTO users (id, username, email, bio, avatar, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          userId, 
          profile.username || `User_${userId.substring(0, 5)}`,
          profile.email,
          profile.bio,
          profile.avatar,
          new Date().toISOString()
        ]
      );
    } else {
      // Update existing user
      await executeQuery(
        'UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email), bio = COALESCE($3, bio), avatar = COALESCE($4, avatar) WHERE id = $5',
        [profile.username, profile.email, profile.bio, profile.avatar, userId]
      );
    }
    
    // Save profile picture URL to user_profiles table for better organization
    if (profile.avatar) {
      // Check if profile exists in user_profiles
      const existingProfile = await executeQuery<any[]>(
        'SELECT user_id FROM user_profiles WHERE user_id = $1',
        [userId]
      );
      
      if (existingProfile && existingProfile.length > 0) {
        // Update existing profile
        await executeQuery(
          'UPDATE user_profiles SET profile_picture_url = $1 WHERE user_id = $2',
          [profile.avatar, userId]
        );
      } else {
        // Create new profile
        await executeQuery(
          'INSERT INTO user_profiles (user_id, profile_picture_url) VALUES ($1, $2)',
          [userId, profile.avatar]
        );
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
    await executeQuery(
      'UPDATE users SET avatar = $1 WHERE id = $2',
      [imageUrl, userId]
    );
    
    // Update or create in user_profiles table
    const existingProfile = await executeQuery<any[]>(
      'SELECT user_id FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    
    if (existingProfile && existingProfile.length > 0) {
      await executeQuery(
        'UPDATE user_profiles SET profile_picture_url = $1 WHERE user_id = $2',
        [imageUrl, userId]
      );
    } else {
      await executeQuery(
        'INSERT INTO user_profiles (user_id, profile_picture_url) VALUES ($1, $2)',
        [userId, imageUrl]
      );
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
