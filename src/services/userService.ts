
import { toast } from '@/components/ui/use-toast';
import { executeQuery, generateId } from '@/integrations/tidb/client';

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
    // Get user
    const users = await executeQuery<any[]>(
      `SELECT * FROM users WHERE id = ?`, 
      [userId]
    );
    
    if (!users.length) {
      // User doesn't exist yet, create a new user
      const username = `User_${userId.substring(0, 5)}`;
      await executeQuery(
        `INSERT INTO users (id, username, created_at) VALUES (?, ?, ?)`,
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
    
    // Get followers
    const followers = await executeQuery<any[]>(
      `SELECT follower_id FROM follows WHERE following_id = ?`, 
      [userId]
    );
    
    // Get following
    const following = await executeQuery<any[]>(
      `SELECT following_id FROM follows WHERE follower_id = ?`, 
      [userId]
    );
    
    // Get liked songs
    const likedSongs = await executeQuery<any[]>(
      `SELECT song_id FROM liked_songs WHERE user_id = ?`,
      [userId]
    );
    
    return {
      id: users[0].id,
      username: users[0].username,
      email: users[0].email,
      avatar: users[0].avatar,
      bio: users[0].bio || '',
      followers: followers.map(f => f.follower_id) || [],
      following: following.map(f => f.following_id) || [],
      likedSongs: likedSongs.map(ls => ls.song_id) || [],
      createdAt: users[0].created_at,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    // Query all users from the database
    const users = await executeQuery<any[]>(`SELECT * FROM users`);
    
    // If no users in database, return sample users
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
    // Get users from database
    const users = await executeQuery<any[]>(
      `SELECT * FROM users WHERE id = ?`, 
      [userId]
    );

    if (users && users.length > 0) {
      // User exists in the database
      // Get followers
      const followers = await executeQuery<any[]>(
        `SELECT follower_id FROM follows WHERE following_id = ?`, 
        [userId]
      );
      
      // Get following
      const following = await executeQuery<any[]>(
        `SELECT following_id FROM follows WHERE follower_id = ?`, 
        [userId]
      );

      // Return user with followers and following
      return {
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
        avatar: users[0].avatar,
        bio: users[0].bio || '',
        followers: followers.map(f => f.follower_id) || [],
        following: following.map(f => f.following_id) || [],
        createdAt: users[0].created_at,
      };
    }
    
    // If not found in database, check if it's one of our sample users
    if (['user2', 'user3', 'user4'].includes(userId)) {
      const mockUsers = await getAllUsers();
      const mockUser = mockUsers.find(user => user.id === userId);
      
      if (mockUser) {
        // Create the mock user in the database for persistence
        await executeQuery(
          `INSERT INTO users (id, username, avatar, bio, created_at) 
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE username = VALUES(username)`,
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
      `SELECT * FROM follows WHERE follower_id = ? AND following_id = ?`,
      [currentUserId, userId]
    );
      
    if (existingFollow.length) {
      toast({
        title: "Already Following",
        description: `You are already following this user.`,
      });
      return false;
    }
    
    // Create follow relationship
    await executeQuery(
      `INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (?, ?, ?, ?)`,
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
    
    await executeQuery(
      `DELETE FROM follows WHERE follower_id = ? AND following_id = ?`,
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
    
    const dbUsers = await executeQuery<any[]>(
      `SELECT * FROM users WHERE LOWER(username) LIKE ? OR LOWER(bio) LIKE ?`,
      [`%${normalizedQuery}%`, `%${normalizedQuery}%`]
    );
    
    if (dbUsers && dbUsers.length > 0) {
      return Promise.all(dbUsers.map(async (user) => {
        // Get followers and following counts
        const followers = await executeQuery<any[]>(
          `SELECT COUNT(*) as count FROM follows WHERE following_id = ?`, 
          [user.id]
        );
        
        const following = await executeQuery<any[]>(
          `SELECT COUNT(*) as count FROM follows WHERE follower_id = ?`, 
          [user.id]
        );
        
        return {
          id: user.id,
          username: user.username,
          avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.username}`,
          bio: user.bio || '',
          followers: [],
          following: [],
          followersCount: followers[0]?.count || 0,
          followingCount: following[0]?.count || 0,
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
      `SELECT id FROM users WHERE id = ?`, 
      [userId]
    );
    
    if (!userExists.length) {
      // Create user if they don't exist
      await executeQuery(
        `INSERT INTO users (id, username, email, bio, avatar, created_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId, 
          profile.username || `User_${userId.substring(0, 5)}`, 
          profile.email || null,
          profile.bio || null,
          profile.avatar || null,
          new Date().toISOString()
        ]
      );
    } else {
      // Update existing user
      await executeQuery(
        `UPDATE users SET username = ?, email = ?, bio = ?, avatar = ? WHERE id = ?`,
        [profile.username, profile.email, profile.bio, profile.avatar, userId]
      );
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
