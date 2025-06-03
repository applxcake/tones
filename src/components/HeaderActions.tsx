
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Moon, Sun, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const HeaderActions = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = () => {
    signOut();
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 h-10 px-3 text-zinc-300 hover:text-white hover:bg-zinc-800/50"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium hidden md:block">
          {user?.username || 'User'}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform duration-200",
          showDropdown && "rotate-180"
        )} />
      </Button>

      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-56 bg-zinc-900/95 backdrop-blur-md border border-zinc-800/50 rounded-lg shadow-lg z-50"
            >
              <div className="p-2">
                {/* User Info */}
                <div className="px-3 py-2 border-b border-zinc-800/50 mb-2">
                  <p className="text-white font-medium text-sm">
                    {user?.username || 'Guest User'}
                  </p>
                  <p className="text-zinc-400 text-xs">
                    {user?.email || 'guest@example.com'}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800/50"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800/50"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Preferences
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800/50"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4 mr-2" />
                    ) : (
                      <Moon className="w-4 h-4 mr-2" />
                    )}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </Button>

                  <div className="border-t border-zinc-800/50 pt-1 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeaderActions;
