import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Home, Search, ListMusic, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
  
  const handleSearch = () => {
    navigate('/search');
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className={cn(
          "fixed top-4 left-4 z-40 md:hidden",
          isOpen && "left-[calc(16rem-3rem)]"
        )}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-20 transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onToggle}
      />

      <div className={cn(
        "h-screen w-64 bg-sidebar fixed left-0 top-0 z-30 glass-panel transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0",
        isMobile && !isOpen && "shadow-none"
      )}>
        <SidebarHeader onSearch={handleSearch} />
        
        <nav className="space-y-1 px-6">
          <SidebarNavItem to="/" icon={<Home className="h-5 w-5" />} label="Home" />
          <SidebarNavItem to="/search" icon={<Search className="h-5 w-5" />} label="Search" />
          <SidebarNavItem to="/playlists" icon={<ListMusic className="h-5 w-5" />} label="Playlists" />
          <SidebarNavItem to="/explore" icon={<Users className="h-5 w-5" />} label="Explore" />
          <SidebarNavItem to="/profile" icon={<User className="h-5 w-5" />} label="Profile" />
        </nav>

        <SidebarFooter />
      </div>
    </>
  );
};

export default AppSidebar;
