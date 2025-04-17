
import { Home, Search, ListMusic, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const MobileNav = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="md:hidden fixed bottom-20 left-0 right-0 z-40 glass-panel border-t border-white/10">
      <div className="flex justify-around">
        <NavLinkItem to="/" icon={<Home className="h-5 w-5" />} label="Home" />
        <NavLinkItem to="/search" icon={<Search className="h-5 w-5" />} label="Search" />
        <NavLinkItem to="/playlists" icon={<ListMusic className="h-5 w-5" />} label="Playlists" />
        <NavLinkItem 
          to={isAuthenticated ? "/profile" : "/login"} 
          icon={<User className="h-5 w-5" />} 
          label={isAuthenticated ? "Profile" : "Login"} 
        />
      </div>
    </div>
  );
};

interface NavLinkItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavLinkItem = ({ to, icon, label }: NavLinkItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex flex-col items-center py-3 px-5",
        isActive ? "text-neon-purple" : "text-gray-400"
      )}
    >
      <div className={cn(
        "mb-1",
        "transition-all"
      )}>
        {icon}
      </div>
      <span className="text-xs">{label}</span>
    </NavLink>
  );
};

export default MobileNav;
