import React from 'react';
import { Menu, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { useUIStore, selectTheme } from '@/store/uiStore';
import { useAuthStore, selectCurrentUser } from '@/features/auth/store';
import { ENV } from '@/config/env';

export const Navbar: React.FC = () => {
  const theme = useUIStore(selectTheme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const user = useAuthStore(selectCurrentUser);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      {/* Left: Hamburger + App Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-md shadow-brand-500/20">
            <span className="font-bold text-sm tracking-wider">RA</span>
          </div>
          <span className="hidden text-base font-bold text-slate-900 dark:text-slate-100 sm:inline-block">
            {ENV.appName}
          </span>
        </div>
      </div>

      {/* Right: Theme Toggle + User Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-600" />
          )}
        </button>

        {/* User Information */}
        {user && (
          <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-800 sm:pl-4">
            <div className="flex items-center gap-2.5">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-500/30"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  <UserIcon className="h-4 w-4" />
                </div>
              )}
              <div className="hidden text-left md:block">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
