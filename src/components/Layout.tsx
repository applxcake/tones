
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import MusicPlayer from '@/components/MusicPlayer';
import MobileNav from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import AnimatedBackground from '@/components/AnimatedBackground';
import FloatingElements from '@/components/FloatingElements';
import LyricFlashHighlight from '@/components/LyricFlashHighlight';

const Layout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('sidebar-open');
    // Default to open on desktop, closed on mobile
    return saved !== null ? JSON.parse(saved) : !isMobile;
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

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Enhanced background with animated elements */}
      <AnimatedBackground density={12} speed="slow" colorScheme="purple" />
      <FloatingElements count={15} type="mixed" className="z-0 opacity-30" />
      
      {/* Add lyric flash highlights */}
      <LyricFlashHighlight className="z-50" />
      
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
        className={`fixed top-0 bottom-0 w-64 bg-background z-30 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        style={{ willChange: 'transform' }}
      >
        <AppSidebar onToggleSidebar={toggleSidebar} />
      </div>
      
      {/* Sidebar toggle button with enhanced animation */}
      <Button 
        variant="ghost" 
        size="icon" 
        className={`fixed top-4 z-40 transition-all duration-300 ${
          sidebarOpen ? 'left-[260px]' : 'left-4'
        } animate-pulse-slow hover:bg-white/10 backdrop-blur-md hover:rotate-12 hover:scale-110`}
        onClick={toggleSidebar}
      >
        {sidebarOpen ? 
          <ChevronLeft className="text-neon-purple animate-pulse-soft" /> : 
          <ChevronRight className="text-neon-purple animate-pulse-soft" />
        }
        <span className="sr-only">{sidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>
      </Button>
      
      <MobileNav />
      
      <div 
        className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'} relative z-10`}
        style={{ minHeight: 'calc(100vh - 80px)' }}
      >
        <div className="container mx-auto px-4 pt-16 animate-fade-in pb-40">
          <Outlet />
        </div>
      </div>
      
      <MusicPlayer />
    </div>
  );
};

export default Layout;
