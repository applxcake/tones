
import React from 'react';
import { LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const SidebarFooter = () => {
  const { isAuthenticated, user, signOut } = useAuth();

  return (
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
  );
};

export default SidebarFooter;
