
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import MusicPlayer from "./MusicPlayer";
import { AccountButton } from "./AccountButton";

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex">
      <AppSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
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
