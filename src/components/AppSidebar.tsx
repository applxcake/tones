import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, SearchCheck, ListMusic, UserRound, Disc3, LogOut, Users, Sparkle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface AppSidebarProps {
  onToggleSidebar?: () => void;
}

const AppSidebar = ({ onToggleSidebar }: AppSidebarProps) => {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  return (
    <div className="h-screen w-64 bg-sidebar fixed left-0 top-0 z-30 shadow-lg backdrop-blur-md bg-background/95">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Disc3 className="h-8 w-8 text-neon-purple animate-pulse-glow" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink text-transparent bg-clip-text">
            Tones
          </h1>
        </div>
        <p className="text-sm text-gray-400 mb-8">Music made free!</p>
        
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-start gap-2 mb-4"
          onClick={() => handleNavigation('/search')}
        >
          <SearchCheck className="h-4 w-4" />
          Search...
        </Button>
        
        <nav className="space-y-1">
          <SidebarNavItem to="/home" icon={<Home className="h-5 w-5" />} label="Home" onToggleSidebar={onToggleSidebar} />
          <SidebarNavItem to="/search" icon={<SearchCheck className="h-5 w-5" />} label="Search" onToggleSidebar={onToggleSidebar} />
          <SidebarNavItem to="/playlists" icon={<ListMusic className="h-5 w-5" />} label="Playlists" onToggleSidebar={onToggleSidebar} />
          <SidebarNavItem to="/explore" icon={<Users className="h-5 w-5" />} label="Explore" onToggleSidebar={onToggleSidebar} />
          <SidebarNavItem to="/ai" icon={<Sparkle className="h-5 w-5" />} label="AI Suggestions" onToggleSidebar={onToggleSidebar} />
          <SidebarNavItem to="/profile" icon={<UserRound className="h-5 w-5" />} label="Profile" onToggleSidebar={onToggleSidebar} />
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-gray-800">
        {isAuthenticated ? (
          <div className="flex flex-col">
            <div className="text-sm text-gray-400 mb-2">
              <p>Signed in as:</p>
              <p className="font-medium text-white">{user?.username || user?.email}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="justify-start text-gray-400 hover:text-white"
              onClick={() => {
                signOut();
                if (onToggleSidebar) {
                  onToggleSidebar();
                }
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={() => handleNavigation('/login')}
            >
              Sign In
            </Button>
            <Button 
              size="sm" 
              className="w-full bg-neon-purple hover:bg-neon-purple/80" 
              onClick={() => handleNavigation('/signup')}
            >
              Sign Up
            </Button>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-4">
          <p>© 2025 Tones</p>
          <p className="mt-1">Music made free!</p>
        </div>
      </div>
    </div>
  );
};

interface SidebarNavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onToggleSidebar?: () => void;
}

const SidebarNavItem = ({ to, icon, label, onToggleSidebar }: SidebarNavItemProps) => {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2 transition-all duration-200",
        isActive 
          ? "bg-accent text-accent-foreground neon-glow-purple" 
          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
      )}
      onClick={handleClick}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default AppSidebar;
