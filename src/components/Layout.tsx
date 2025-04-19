
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import MusicPlayer from "./MusicPlayer";
import { AccountButton } from "./AccountButton";

// Export as both default and named export for backward compatibility
const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex">
      <AppSidebar />
      
      <main className="flex-1 relative">
        <div className="absolute top-4 right-4 z-50">
          <AccountButton />
        </div>
        <div className="h-full overflow-auto pb-24">
          <Outlet />
        </div>
        <MusicPlayer />
      </main>
    </div>
  );
};

export { Layout };
export default Layout;
