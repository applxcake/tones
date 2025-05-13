
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
          <Avatar className="h-8 w-8 hover:ring-2 hover:ring-neon-purple transition-all">
            {user.avatarUrl ? (
              <AvatarImage 
                src={user.avatarUrl} 
                alt={user.username || 'User'} 
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-muted">
                <User className="h-4 w-4" />
              </AvatarFallback>
            )}
          </Avatar>
        </Link>
      ) : (
        <Link to="/login">
          <Button variant="outline" size="sm">Login</Button>
        </Link>
      )}
    </div>
  );
};

export default HeaderActions;
