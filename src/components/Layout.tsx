
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar with transition */}
      <div 
        className={`fixed top-0 bottom-0 z-30 transition-all duration-300 ${
          sidebarOpen ? 'left-0' : '-left-64'
        } md:${sidebarOpen ? 'left-0' : '-left-64'}`}
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
