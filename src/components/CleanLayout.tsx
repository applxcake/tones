
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import MinimalistSidebar from '@/components/MinimalistSidebar';
import HeaderActions from '@/components/HeaderActions';
import MusicPlayer from '@/components/MusicPlayer';
import { useIsMobile } from '@/hooks/use-mobile';

const CleanLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
      {!isMobile && (
        <MinimalistSidebar 
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50 p-4 sticky top-0 z-40">
          <div className="flex justify-end">
            <HeaderActions />
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-6 pb-32 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Music Player */}
      <MusicPlayer />
    </div>
  );
};

export default CleanLayout;
