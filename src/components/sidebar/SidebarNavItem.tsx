
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

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

export default SidebarNavItem;
