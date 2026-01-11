
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { Bot } from './ui/Bot';

interface HeaderProps {
  isAdminLoggedIn: boolean;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ isAdminLoggedIn, onLogout, searchQuery, onSearchChange }) => {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-card">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
        {/* Top Row: Logo & Nav */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 shrink-0 group">
            <Link to="/" className="h-8 w-8 flex items-center justify-center p-0.5 bg-white/5 rounded-lg border border-white/10 group-hover:border-primary transition-colors">
              <Logo />
            </Link>
            <div className="flex flex-col">
              <h2 className="text-xl font-black leading-none tracking-tighter italic flex gap-1">
                <Link to="/repairs" className="text-white hover:text-primary transition-colors">FIX</Link>
                <Link to="/store" className="text-primary hover:text-white transition-colors">IT</Link>
              </h2>
            </div>
          </div>

          {/* Location Bar (Desktop/Large Mobile) */}
          {location.pathname !== '/' && (
            <div className="hidden xs:flex items-center gap-2 text-[10px] text-white/60 font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5 shadow-inner">
              <span className="material-symbols-outlined text-sm text-primary animate-pulse">location_on</span>
              <span>Kurnool <span className="text-white">518002</span></span>
            </div>
          )}

          {location.pathname !== '/' && (
            <div className="flex items-center gap-2">
              {isAdminLoggedIn ? (
                <Link to="/admin" className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-all border border-primary/20 shadow-lg shadow-primary/10">
                  <Bot animateOnHover className="w-5 h-5" />
                </Link>
              ) : (
                <Link to="/login" className="size-10 rounded-xl bg-white/5 text-white flex items-center justify-center hover:bg-primary hover:text-black transition-all border border-white/10">
                  <Bot animateOnHover className="w-5 h-5" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Search Bar Row with Repair Section */}
        {location.pathname !== '/' && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1 group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/30 text-lg group-focus-within:text-primary transition-colors">search</span>
              <input
                type="text"
                placeholder="Search accessories, chargers, skins..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/10 bg-black/60 focus:bg-black focus:ring-1 focus:ring-primary text-xs font-bold text-white transition-all placeholder:text-white/20 bento-shadow"
              />
            </div>

            {/* New Repair Button beside search bar */}
            {location.pathname !== '/store' && (
              <Link
                to="/repairs"
                className={`
                  h-11 px-4 sm:px-6 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg
                  ${location.pathname === '/repairs'
                    ? 'bg-white text-black font-black border-white'
                    : 'bg-primary text-black border-primary shadow-primary/20 hover:bg-white'
                  }
                `}
              >
                <span className="material-symbols-outlined text-lg">build</span>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest hidden xs:inline">Repairs</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
