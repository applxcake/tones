
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import MusicPlayer from '@/components/MusicPlayer';
import MobileNav from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

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
      {/* Background gradient effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-background to-black/80 z-0"></div>
      
      {/* Animated particles or circles for visual interest */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(155,135,245,0.3) 0%, rgba(0,0,0,0) 70%)`,
              transform: `scale(${Math.random() * 0.5 + 0.5})`,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
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
        className={`fixed top-0 bottom-0 w-64 bg-background z-30 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        style={{ willChange: 'transform' }}
      >
        <AppSidebar onToggleSidebar={toggleSidebar} />
      </div>
      
      {/* Sidebar toggle button with animation */}
      <Button 
        variant="ghost" 
        size="icon" 
        className={`fixed top-4 z-40 transition-all duration-300 ${
          sidebarOpen ? 'left-[260px]' : 'left-4'
        } animate-fade-in hover:bg-white/10 backdrop-blur-md`}
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <ChevronLeft className="text-neon-purple" /> : <ChevronRight className="text-neon-purple" />}
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
