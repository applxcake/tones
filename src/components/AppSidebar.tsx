import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, ListMusic, User, Users, X, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import SidebarNavItem from './sidebar/SidebarNavItem';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarFooter from './sidebar/SidebarFooter';
interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}
const AppSidebar = ({
  isOpen,
  onToggle
}: AppSidebarProps) => {
  const navigate = useNavigate();
  const handleSearch = () => {
    navigate('/search');
  };
  return <div className={cn("h-screen w-64 bg-sidebar fixed left-0 top-0 z-30 glass-panel transition-all duration-300 ease-in-out", isOpen ? "translate-x-0" : "-translate-x-full")}>
      <Button variant="ghost" size="icon" onClick={onToggle} className="absolute top-4 right-4 z-40 text-xs">
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <SidebarHeader onSearch={handleSearch} />
      
      <nav className="space-y-1 px-6">
        <SidebarNavItem to="/" icon={<Home className="h-5 w-5" />} label="Home" />
        <SidebarNavItem to="/search" icon={<Search className="h-5 w-5" />} label="Search" />
        <SidebarNavItem to="/playlists" icon={<ListMusic className="h-5 w-5" />} label="Playlists" />
        <SidebarNavItem to="/explore" icon={<Users className="h-5 w-5" />} label="Explore" />
        <SidebarNavItem to="/profile" icon={<User className="h-5 w-5" />} label="Profile" />
      </nav>

      <SidebarFooter />
    </div>;
};
export default AppSidebar;