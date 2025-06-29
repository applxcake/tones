import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserCardProps {
  user: {
    id: string;
    username: string;
    avatar?: string;
    bio?: string;
    followers?: string[];
  };
}

const UserCard = ({ user }: UserCardProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="glass-panel rounded-lg p-4 hover-scale animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to={`/users/${user.id}`}>
          <Avatar className="h-12 w-12 cursor-pointer hover:neon-glow-blue animate-scale-in">
            {!imageError && user.avatar ? (
              <AvatarImage 
                src={user.avatar} 
                alt={user.username} 
                onError={handleImageError}
              />
            ) : (
              <AvatarFallback>
                <UserIcon className="h-6 w-6" />
              </AvatarFallback>
            )}
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
            {user.followers?.length || 0} followers
          </p>
        </div>
      </div>

      {user.bio && (
        <p className="mt-2 text-sm text-gray-300 line-clamp-2 animate-fade-in">{user.bio}</p>
      )}
    </div>
  );
};

export default UserCard;
