import React, { Suspense } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sun, Moon, CheckCircle2, Kanban, ShieldCheck, Zap } from 'lucide-react';
import { useUIStore, selectTheme } from '@/store/uiStore';
import { Spinner } from '@/components/ui/Spinner';

export const AuthLayout: React.FC = () => {
  const theme = useUIStore(selectTheme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  return (
    <div className="relative min-h-screen w-full flex bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Theme Toggle (Top-Right) */}
      <div className="absolute right-6 top-6 z-20">
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-2.5 text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-400" />
          )}
        </button>
      </div>

      {/* Left Feature Showcase (Visible on lg screens) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10 border-r border-slate-800/60 bg-slate-900/30 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/25">
            <Kanban className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">TaskFlow</span>
        </Link>

        <div className="space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-xs font-semibold">
            <Zap className="h-3.5 w-3.5" /> High-Performance Team Kanban
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Manage engineering projects with precision and speed.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Role-based multi-tenancy, fractional task positioning, and real-time sprint management designed for high-velocity teams.
          </p>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Multi-tenant workspace isolation (Owner, Admin, Member)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>JWT rotation with secure SQL token revocation</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Zod input validation & rate-limited authentication</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} TaskFlow Inc. Production Architecture.
        </div>
      </div>

      {/* Right Form Card Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-2xl">
          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center">
                <Spinner size="lg" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
};
