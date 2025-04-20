
import { toast } from '@/components/ui/use-toast';

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

// Mock users data - in a real app, this would be in a database
let users: User[] = [
  {
    id: 'current-user',
    username: 'MusicLover',
    email: 'user@example.com',
    avatar: 'https://i.pravatar.cc/150?u=musiclover',
    bio: 'Just here for the music',
    followers: ['user2', 'user3'],
    following: ['user2'],
    createdAt: new Date().toISOString(),
    likedSongs: [],
  },
  {
    id: 'user2',
    username: 'JazzMaster',
    avatar: 'https://i.pravatar.cc/150?u=jazzmaster',
    bio: 'Jazz enthusiast and trumpet player',
    followers: ['current-user'],
    following: ['current-user', 'user3'],
    createdAt: new Date().toISOString(),
    likedSongs: [],
  },
  {
    id: 'user3',
    username: 'ClassicalVibes',
    avatar: 'https://i.pravatar.cc/150?u=classical',
    bio: 'Piano and orchestra lover',
    followers: ['current-user'],
    following: [],
    createdAt: new Date().toISOString(),
    likedSongs: [],
  },
  {
    id: 'user4',
    username: 'RockStar',
    avatar: 'https://i.pravatar.cc/150?u=rockstar',
    bio: 'Living on the edge with rock music',
    followers: [],
    following: [],
    createdAt: new Date().toISOString(),
    likedSongs: [],
  },
];

// Get all users
export const getAllUsers = () => {
  return users.filter(user => user.id !== 'current-user');
};

// Get current user
export const getCurrentUser = () => {
  return users.find(user => user.id === 'current-user');
};

// Get user by ID
export const getUserById = (userId: string) => {
  return users.find(user => user.id === userId);
};

// Follow a user
export const followUser = (userId: string) => {
  const currentUser = getCurrentUser();
  const targetUser = getUserById(userId);

  if (!currentUser || !targetUser) {
    toast({
      title: "Error",
      description: "User not found.",
      variant: "destructive"
    });
    return false;
  }

  // Already following this user
  if (currentUser.following.includes(userId)) {
    toast({
      title: "Already Following",
      description: `You are already following ${targetUser.username}.`,
    });
    return false;
  }

  // Update current user's following list
  users = users.map(user => {
    if (user.id === 'current-user') {
      return {
        ...user,
        following: [...user.following, userId]
      };
    }
    // Update target user's followers list
    if (user.id === userId) {
      return {
        ...user,
        followers: [...user.followers, 'current-user']
      };
    }
    return user;
  });

  toast({
    title: "Following",
    description: `You are now following ${targetUser.username}.`,
  });
  
  return true;
};

// Unfollow a user
export const unfollowUser = (userId: string) => {
  const currentUser = getCurrentUser();
  const targetUser = getUserById(userId);

  if (!currentUser || !targetUser) {
    toast({
      title: "Error",
      description: "User not found.",
      variant: "destructive"
    });
    return false;
  }

  // Not following this user
  if (!currentUser.following.includes(userId)) {
    toast({
      title: "Not Following",
      description: `You are not following ${targetUser.username}.`,
    });
    return false;
  }

  // Update current user's following list
  users = users.map(user => {
    if (user.id === 'current-user') {
      return {
        ...user,
        following: user.following.filter(id => id !== userId)
      };
    }
    // Update target user's followers list
    if (user.id === userId) {
      return {
        ...user,
        followers: user.followers.filter(id => id !== 'current-user')
      };
    }
    return user;
  });

  toast({
    title: "Unfollowed",
    description: `You are no longer following ${targetUser.username}.`,
  });
  
  return true;
};

// Search for users
export const searchUsers = (query: string) => {
  if (!query) return [];
  
  const normalizedQuery = query.toLowerCase();
  return users.filter(user => 
    user.id !== 'current-user' && (
      user.username.toLowerCase().includes(normalizedQuery) || 
      (user.bio && user.bio.toLowerCase().includes(normalizedQuery))
    )
  );
};

// Update user profile
export const updateUserProfile = (profile: Partial<User>) => {
  users = users.map(user => {
    if (user.id === 'current-user') {
      return {
        ...user,
        ...profile
      };
    }
    return user;
  });

  toast({
    title: "Profile Updated",
    description: "Your profile has been updated.",
  });
  
  return getCurrentUser();
};
