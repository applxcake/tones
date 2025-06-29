import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import MusicPlayer from '@/components/MusicPlayer';
import MobileNav from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import AnimatedBackground from '@/components/AnimatedBackground';
import FloatingElements from '@/components/FloatingElements';
import LyricFlashHighlight from '@/components/LyricFlashHighlight';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Layout = () => {
  const isMobile = useIsMobile();
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar-open');
    return saved !== null ? JSON.parse(saved) : true; // default to open
  });

  // Update sidebar state when screen size changes
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  // Close sidebar on mobile when overlay is clicked
  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="liquid-bg min-h-screen text-foreground overflow-hidden relative">
      {/* Enhanced background with animated elements */}
      <AnimatedBackground density={12} speed="slow" colorScheme="purple" />
      <FloatingElements count={15} type="mixed" className="z-0 opacity-30" />
      
      {/* Add lyric flash highlights */}
      <LyricFlashHighlight className="z-50" />
      
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-md border-b border-gray-800 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Sidebar toggle button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="transition-all duration-300 animate-pulse-slow hover:bg-white/10 backdrop-blur-md hover:rotate-12 hover:scale-110"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? 
              <ChevronLeft className="text-neon-purple animate-pulse-soft" /> : 
              <ChevronRight className="text-neon-purple animate-pulse-soft" />
            }
            <span className="sr-only">{sidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>
          </Button>
          
          {/* App Title */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink text-transparent bg-clip-text">
              Tones
            </h1>
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-gray-400 hover:text-white"
                onClick={() => navigate('/profile')}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.username || user?.email?.split('@')[0]}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-2 text-gray-400 hover:text-white hover:text-red-400"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button 
                size="sm" 
                className="bg-neon-purple hover:bg-neon-purple/80" 
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 md:hidden" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar with improved transitions */}
      <div 
        className={`fixed top-16 bottom-0 w-64 bg-background z-30 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        style={{ willChange: 'transform' }}
      >
        <AppSidebar onToggleSidebar={toggleSidebar} />
      </div>
      
      <MobileNav />
      
      <div 
        className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'} relative z-10`}
        style={{ minHeight: 'calc(100vh - 80px)' }}
      >
        <div className="container mx-auto px-4 pt-20 animate-fade-in pb-40">
          <Outlet />
        </div>
      </div>
      
      <MusicPlayer />
    </div>
  );
};

export default Layout;
