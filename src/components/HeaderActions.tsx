
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const HeaderActions = () => {
  const { user } = useAuth();

  return (
    <div className="flex items-center gap-3">
      {/* Theme Toggle */}
      <ThemeToggle className="mr-2" />
      
      {user ? (
        <Link to="/profile">
          <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.username || 'User'} 
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
          </Button>
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
