
import { Home, Search, ListMusic, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const MobileNav = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="md:hidden fixed bottom-20 left-4 right-4 z-40 glass-panel border-t border-white/10 rounded-xl shadow-lg">
      <div className="flex justify-around relative overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 via-neon-pink/5 to-neon-purple/5 opacity-60"></div>
        
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
        "flex flex-col items-center py-3 px-5 relative z-10",
        isActive 
          ? "text-neon-purple" 
          : "text-gray-400 hover:text-gray-200"
      )}
    >
      {({ isActive }) => (
        <>
          <div className={cn(
            "mb-1 transition-all duration-300",
            isActive && "transform scale-110"
          )}>
            {icon}
            
            {/* Glowing dot indicator */}
            {isActive && (
              <span className="absolute -top-0.5 left-1/2 w-1 h-1 bg-neon-purple rounded-full shadow-[0_0_5px_rgba(155,135,245,0.8)]"></span>
            )}
          </div>
          <span className={cn(
            "text-xs transition-all",
            isActive && "font-medium"
          )}>
            {label}
          </span>
          
          {/* Bottom indicator line */}
          {isActive && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-neon-purple rounded-full shadow-[0_0_5px_rgba(155,135,245,0.8)]"></div>
          )}
        </>
      )}
    </NavLink>
  );
};

export default MobileNav;
