
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { followUser, unfollowUser, getCurrentUser } from '@/services/userService';

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
  const currentUser = getCurrentUser();
  const [isFollowing, setIsFollowing] = useState(
    currentUser?.following.includes(user.id) || false
  );

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowUser(user.id);
      setIsFollowing(false);
    } else {
      followUser(user.id);
      setIsFollowing(true);
    }
  };

  return (
    <div className="glass-panel rounded-lg p-4 hover-scale">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback>
            <UserIcon className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        
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
          className={isFollowing ? "" : "bg-neon-purple hover:bg-neon-purple/80"}
          onClick={handleFollowToggle}
        >
          {isFollowing ? (
            <UserMinus className="h-4 w-4 mr-1" />
          ) : (
            <UserPlus className="h-4 w-4 mr-1" />
          )}
          {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
      </div>

      {user.bio && (
        <p className="mt-2 text-sm text-gray-300 line-clamp-2">{user.bio}</p>
      )}
    </div>
  );
};

export default UserCard;
