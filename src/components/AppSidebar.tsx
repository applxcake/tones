
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, ListMusic, User, Disc3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const AppSidebar = () => {
  return (
    <div className="hidden md:flex flex-col h-screen w-64 bg-sidebar fixed left-0 top-0 z-30 glass-panel">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Disc3 className="h-8 w-8 text-neon-purple animate-pulse-glow" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink text-transparent bg-clip-text">
            Tones
          </h1>
        </div>
        
        <nav className="space-y-1">
          <SidebarNavItem to="/" icon={<Home className="h-5 w-5" />} label="Home" />
          <SidebarNavItem to="/search" icon={<Search className="h-5 w-5" />} label="Search" />
          <SidebarNavItem to="/playlists" icon={<ListMusic className="h-5 w-5" />} label="Playlists" />
          <SidebarNavItem to="/profile" icon={<User className="h-5 w-5" />} label="Profile" />
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-gray-800">
        <div className="text-sm text-gray-400">
          <p>© 2025 Tones</p>
          <p className="text-xs mt-1">Futuristic Music Streaming</p>
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
