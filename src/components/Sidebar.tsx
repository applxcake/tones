
import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, List, Settings, User, LogOut, Disc3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { signOut, user } = useAuth();

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Heart, label: 'Liked Songs', path: '/favorites' },
    { icon: List, label: 'Playlists', path: '/playlists' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-black/20 backdrop-blur-sm border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Disc3 className="h-8 w-8 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Tones</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200",
                    isActive
                      ? "bg-purple-600/20 text-purple-300"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Sign Out */}
      <div className="p-4 border-t border-white/10">
        {user && (
          <div className="mb-4 p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.username || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
