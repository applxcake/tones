
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import MusicPlayer from '@/components/MusicPlayer';
import MobileNav from '@/components/MobileNav';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar />
      <MobileNav />
      
      <div className="md:ml-64">
        <div className="container mx-auto px-4">
          <Outlet />
        </div>
      </div>
      
      <MusicPlayer />
    </div>
  );
};

export default Layout;
