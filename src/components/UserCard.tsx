
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { followUser, unfollowUser, getCurrentUser } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface UserCardProps {
  user: {
    id: string;
    username: string;
    avatar?: string;
    bio?: string;
    followers: string[];
  };
}

const UserCard = ({ user }: UserCardProps) => {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  // Fetch current user data to check following status
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (authUser) {
        try {
          setLoading(true);
          const userData = await getCurrentUser(authUser.id);
          setCurrentUserData(userData);
          if (userData?.following) {
            setIsFollowing(userData.following.includes(user.id));
          } else {
            setIsFollowing(false);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchCurrentUser();
  }, [authUser, user.id]);

  const handleFollowToggle = async () => {
    if (!authUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users.",
        variant: "destructive"
      });
      return;
    }
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const success = await unfollowUser(user.id, authUser.id);
        if (success) setIsFollowing(false);
      } else {
        const success = await followUser(user.id, authUser.id);
        if (success) setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast({
        title: "Follow Action Failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-lg p-4 hover-scale animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-700"></div>
          <div className="flex-1">
            <div className="h-4 w-24 bg-gray-700 rounded"></div>
            <div className="h-3 w-16 bg-gray-800 rounded mt-2"></div>
          </div>
          <div className="h-8 w-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-lg p-4 hover-scale">
      <div className="flex items-center gap-4">
        <Link to={`/users/${user.id}`}>
          <Avatar className="h-12 w-12 cursor-pointer hover:neon-glow-blue">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback>
              <UserIcon className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link 
            to={`/users/${user.id}`} 
            className="font-medium hover:text-primary hover:underline"
          >
            {user.username}
          </Link>
          <p className="text-sm text-gray-400 truncate">
            {user.followers.length} followers
          </p>
        </div>
        
        <Button 
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          className={`${isFollowing ? "" : "bg-neon-purple hover:bg-neon-purple/80"} ${followLoading ? "opacity-70" : ""}`}
          onClick={handleFollowToggle}
          disabled={followLoading}
        >
          {followLoading ? (
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-current rounded-full animate-pulse"></div>
              <div className="h-2 w-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="h-2 w-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            </div>
          ) : isFollowing ? (
            <>
              <UserMinus className="h-4 w-4 mr-1" />
              Unfollow
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-1" />
              Follow
            </>
          )}
        </Button>
      </div>

      {user.bio && (
        <p className="mt-2 text-sm text-gray-300 line-clamp-2">{user.bio}</p>
      )}
    </div>
  );
};

export default UserCard;
