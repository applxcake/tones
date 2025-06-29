import { toast } from '@/components/ui/use-toast';
import { getUserProfile, setUserProfile, FirestoreUserProfile } from '@/integrations/firebase/database';

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

// Get current user - returns a promise
export const getCurrentUser = async (userId?: string) => {
  if (!userId) return null;
  // Use only mock data or Firebase Auth for user info
  return {
    id: userId,
    username: `User_${userId.substring(0, 5)}`,
    bio: '',
    followers: [],
    following: [],
    createdAt: new Date().toISOString(),
  };
};

// Get all users (mock only)
export const getAllUsers = async (): Promise<User[]> => {
  // Return empty or mock users
  return [];
};

// Get user by ID (mock only)
export const getUserById = async (userId: string) => {
  if (!userId) return null;
  return {
    id: userId,
    username: `User_${userId.substring(0, 5)}`,
    email: undefined,
    avatar: `https://i.pravatar.cc/150?u=${userId}`,
    bio: '',
    followers: [],
    following: [],
    createdAt: new Date().toISOString(),
  };
};

// Update user profile (mock only)
export const updateUserProfile = async (
  userId: string,
  profile: Partial<FirestoreUserProfile>
): Promise<boolean> => {
  return await setUserProfile(userId, profile);
};

// Upload profile picture via URL (Firebase-based)
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
    // Update the user profile in Firestore with the new avatar URL
    const success = await updateUserProfile(userId, { avatarUrl: imageUrl });
    
    if (success) {
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been successfully updated.",
      });
      return true;
    } else {
      throw new Error('Failed to update profile');
    }
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

export const fetchUserProfile = async (userId: string): Promise<FirestoreUserProfile | null> => {
  return await getUserProfile(userId);
};

// Helper function to get popular image hosting services for avatars
export const getAvatarHostingSuggestions = () => {
  return [
    {
      name: 'Imgur',
      url: 'https://imgur.com/',
      description: 'Free image hosting with direct links'
    },
    {
      name: 'Cloudinary',
      url: 'https://cloudinary.com/',
      description: 'Professional image hosting with transformations'
    },
    {
      name: 'Gravatar',
      url: 'https://gravatar.com/',
      description: 'Email-based avatar service'
    },
    {
      name: 'Placeholder.com',
      url: 'https://placeholder.com/',
      description: 'Simple placeholder images'
    }
  ];
};

// Example avatar URLs for testing
export const getExampleAvatarUrls = () => {
  return [
    'https://i.pravatar.cc/150?u=user1',
    'https://i.pravatar.cc/150?u=user2',
    'https://i.pravatar.cc/150?u=user3',
    'https://via.placeholder.com/150/6366f1/ffffff?text=Avatar'
  ];
};
