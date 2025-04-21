
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, ListMusic, User, Disc3, LogOut, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const AppSidebar = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate('/search');
  };

  return (
    <div className="h-screen w-64 bg-sidebar fixed left-0 top-0 z-30 glass-panel">
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
          onClick={handleSearch}
        >
          <Search className="h-4 w-4" />
          Search...
        </Button>
        
        <nav className="space-y-1">
          <SidebarNavItem to="/home" icon={<Home className="h-5 w-5" />} label="Home" />
          <SidebarNavItem to="/search" icon={<Search className="h-5 w-5" />} label="Search" />
          <SidebarNavItem to="/playlists" icon={<ListMusic className="h-5 w-5" />} label="Playlists" />
          <SidebarNavItem to="/explore" icon={<Users className="h-5 w-5" />} label="Explore" />
          <SidebarNavItem to="/profile" icon={<User className="h-5 w-5" />} label="Profile" />
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
              onClick={() => signOut()}
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
              asChild
            >
              <NavLink to="/login">Sign In</NavLink>
            </Button>
            <Button 
              size="sm" 
              className="w-full bg-neon-purple hover:bg-neon-purple/80" 
              asChild
            >
              <NavLink to="/signup">Sign Up</NavLink>
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
}

const SidebarNavItem = ({ to, icon, label }: SidebarNavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200",
        isActive 
          ? "bg-accent text-accent-foreground neon-glow-purple" 
          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
      )}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default AppSidebar;
