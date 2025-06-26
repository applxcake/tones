import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const CleanLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          <span className="text-white">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex bg-[#18122b] dark:bg-gradient-to-br dark:from-[#2d0b4e] dark:to-[#4b2067]">
      <Sidebar />
      <main className="flex-1 p-6 pb-24 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CleanLayout;
