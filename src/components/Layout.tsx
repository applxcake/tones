
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import MusicPlayer from '@/components/MusicPlayer';
import MobileNav from '@/components/MobileNav';
import { Button } from '@/components/ui/button';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('sidebar-open');
    return saved !== null ? JSON.parse(saved) : true;
  });

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
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 bottom-0 w-64 bg-background z-30 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ willChange: 'transform' }}
      >
        <AppSidebar onToggleSidebar={toggleSidebar} />
      </div>
      
      {/* Sidebar toggle button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className={`fixed top-4 z-40 transition-all duration-300 ${
          sidebarOpen ? 'left-[260px]' : 'left-4'
        } animate-fade-in`}
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
      </Button>
      
      <MobileNav />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <div className="container mx-auto px-4 pt-16 animate-fade-in">
          <Outlet />
        </div>
      </div>
      
      <MusicPlayer />
    </div>
  );
};

export default Layout;
