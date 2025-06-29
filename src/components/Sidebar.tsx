import { NavLink } from 'react-router-dom';
import { Home, SearchCheck, Heart, ListMusic, Settings2, UserRound, LogOut, Disc3, Sparkle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

const Sidebar = () => {
  const { signOut, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: SearchCheck, label: 'Search', path: '/search' },
    { icon: Heart, label: 'Liked Songs', path: '/favorites' },
    { icon: ListMusic, label: 'Playlists', path: '/playlists' },
    { icon: Sparkle, label: 'AI Suggestions', path: '/ai' },
    { icon: UserRound, label: 'Profile', path: '/profile' },
    { icon: Settings2, label: 'Settings', path: '/settings' },
  ];

  // Hamburger for mobile
  return (
    <>
      {/* Hamburger button (mobile only) */}
      <button
        className="fixed top-4 left-4 z-50 bg-black/60 rounded-lg p-2 sm:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><line x1="4" y1="7" x2="24" y2="7" /><line x1="4" y1="14" x2="24" y2="14" /><line x1="4" y1="21" x2="24" y2="21" /></svg>
      </button>

      {/* Sidebar (desktop) */}
      <aside className={`bg-black/20 backdrop-blur-sm border-r border-white/10 flex flex-col hidden sm:flex transition-all duration-200 ${collapsed ? 'w-16 items-center' : 'w-64'} min-h-screen glass-sidebar`}>
        {/* Logo and Collapse Button */}
        <div className={`border-b border-white/10 flex items-center justify-between ${collapsed ? 'px-0 py-4 flex-col gap-2' : 'p-6 flex-row gap-3'}`}>
          <div className={`flex items-center justify-center ${collapsed ? 'w-full' : ''}`}>
            <Disc3 className="h-8 w-8 text-purple-400" />
            {!collapsed && <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-400 via-blue-400 to-purple-300 bg-[length:300%_300%] bg-clip-text text-transparent ml-3 animate-gradient">Tones</h1>}
          </div>
          <button
            className={`text-white/60 hover:text-white p-1 rounded transition-colors ${collapsed ? '' : 'ml-auto'}`}
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            ) : (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            )}
          </button>
        </div>
        {/* Navigation */}
        <nav className={`flex-1 p-4 ${collapsed ? 'px-2 py-4' : ''}`}>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path} className="flex justify-center">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-0 py-3 rounded-lg transition-colors duration-200 w-full`,
                      isActive
                        ? "bg-purple-600/20 text-purple-300"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {/* User Info & Sign Out */}
        <div className="p-4 border-t border-white/10 w-full flex flex-col items-center">
          {user && !collapsed && (
            <div className="mb-4 p-3 bg-white/5 rounded-lg w-full">
              <div className="flex items-center gap-3">
                {user.avatarUrl && (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.username || user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={signOut}
            className={`w-full justify-start text-gray-300 hover:text-white hover:bg-white/5 ${collapsed ? 'flex justify-center' : ''}`}
          >
            <LogOut className="h-4 w-4 mr-3" />
            {!collapsed && 'Sign Out'}
          </Button>
        </div>
      </aside>

      {/* Sidebar Drawer (mobile) */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 flex">
          <aside className="w-64 bg-black/90 h-full flex flex-col animate-slide-in-left">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Disc3 className="h-8 w-8 text-purple-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-400 via-blue-400 to-purple-300 bg-[length:300%_300%] bg-clip-text text-transparent animate-gradient">Tones</h1>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-white ml-2">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="6" x2="22" y2="22" /><line x1="6" y1="22" x2="22" y2="6" /></svg>
              </button>
            </div>
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200",
                          isActive
                            ? "bg-purple-600/20 text-purple-300"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        )
                      }
                      onClick={() => setOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-4 border-t border-white/10">
              {user && (
                <div className="mb-4 p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    {user.avatarUrl && (
                      <img
                        src={user.avatarUrl}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user.username || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                onClick={signOut}
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </aside>
          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
};

export default Sidebar;
