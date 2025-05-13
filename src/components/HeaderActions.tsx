
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const HeaderActions = () => {
  const { user } = useAuth();

  return (
    <div className="flex items-center gap-3">
      {/* Theme Toggle */}
      <ThemeToggle className="mr-2" />
      
      {user ? (
        <Link to="/profile">
          <Avatar className="h-8 w-8 hover:ring-2 hover:ring-neon-purple transition-all hover:animate-pulse-shadow group">
            {user.avatarUrl ? (
              <AvatarImage 
                src={user.avatarUrl} 
                alt={user.username || 'User'} 
                className="object-cover group-hover:scale-110 transition-transform"
              />
            ) : (
              <AvatarFallback className="bg-muted group-hover:animate-pulse">
                <User className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </AvatarFallback>
            )}
            {/* Add subtle sparkle effect on hover */}
            <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden">
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-neon-purple rounded-full animate-ping-slow"></span>
              <span className="absolute bottom-0 left-0 w-1 h-1 bg-neon-pink rounded-full animate-ping-slow" style={{ animationDelay: "0.5s" }}></span>
            </span>
          </Avatar>
        </Link>
      ) : (
        <Link to="/login">
          <Button variant="outline" size="sm" className="hover:animate-pulse-shadow hover:border-neon-purple/50 transition-all">Login</Button>
        </Link>
      )}
    </div>
  );
};

export default HeaderActions;
