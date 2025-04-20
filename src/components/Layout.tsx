
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import MusicPlayer from '@/components/MusicPlayer';
import MobileNav from '@/components/MobileNav';
import { Button } from '@/components/ui/button';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div 
        className={`transition-all duration-300 fixed top-0 bottom-0 z-30 
          ${sidebarOpen ? 'left-0' : '-left-64'}`}
      >
        <AppSidebar />
      </div>
      
      {/* Sidebar toggle button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="fixed top-4 left-4 z-40 md:left-[260px] transition-all duration-300"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
      </Button>
      
      <MobileNav />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <div className="container mx-auto px-4 pt-16">
          <Outlet />
        </div>
      </div>
      
      <MusicPlayer />
    </div>
  );
};

export default Layout;
