import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  ChevronDown,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Shield,
  History,
  Zap,
  Brain,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TOOLS } from '../../lib/toolsConfig';

export const Navbar: React.FC = () => {
  const { user, remainingTodayCount, dailyLimit, logout } = useAuth() as any;
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsToolsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800 text-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md group-hover:bg-blue-500 transition-colors">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  TextCraft <span className="text-blue-400">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase -mt-1 hidden sm:block">
                  Smart Text Suite
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {/* Tools Dropdown */}
              <div className="relative" ref={toolsDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsToolsOpen(!isToolsOpen)}
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isToolsOpen || location.pathname.startsWith('/tools/')
                      ? 'bg-slate-800 text-blue-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                  aria-expanded={isToolsOpen}
                >
                  <span>Tools</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isToolsOpen ? 'rotate-180 text-blue-400' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isToolsOpen && (
                  <div className="absolute left-0 mt-2 w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        10 AI Writing Tools
                      </span>
                      <span className="text-[11px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Brain className="w-3 h-3" /> High Thinking
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-1 max-h-[70vh] overflow-y-auto">
                      {TOOLS.map((tool) => (
                        <Link
                          key={tool.slug}
                          to={`/tools/${tool.slug}`}
                          className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-800 transition-colors group"
                        >
                          <span className="text-2xl shrink-0 p-1 bg-slate-800 rounded group-hover:scale-110 transition-transform">
                            {tool.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-white group-hover:text-blue-400">
                                {tool.name}
                              </span>
                              {tool.supportsHighThinking && (
                                <span className="text-[9px] bg-slate-800 text-blue-300 px-1.5 py-0.2 rounded font-mono">
                                  Argon
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {tool.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'bg-slate-800 text-blue-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/admin'
                    ? 'bg-slate-800 text-blue-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Shield className="w-4 h-4 text-slate-400" />
                <span>Admin</span>
              </Link>

              <Link
                to="/about"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/about'
                    ? 'bg-slate-800 text-blue-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                About
              </Link>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Daily Usage Pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-300"
              title={`Generations remaining today: ${remainingTodayCount ?? 5}`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>
                <strong className="text-white font-semibold">{remainingTodayCount ?? 5}</strong>
                <span className="text-slate-400">/{user.role === 'user' ? '20' : user.role === 'admin' ? '∞' : '5'} today</span>
              </span>
            </div>

            {user.role !== 'guest' ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium border border-slate-700 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate text-slate-200">{user.fullName}</span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono">
                      ADMIN
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-xl p-1.5 z-50">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email || 'Free Member'}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <History className="w-4 h-4 text-blue-400" />
                      <span>My Generations</span>
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-slate-800 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{remainingTodayCount ?? 5}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
            <span>Daily Generations Left:</span>
            <span className="font-semibold text-white">
              {remainingTodayCount ?? 5} / {user.role === 'user' ? 20 : user.role === 'admin' ? 'Unlimited' : 5}
            </span>
          </div>

          <div className="space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              Dashboard &amp; History
            </Link>
            <Link
              to="/admin"
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              Admin Panel
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              About
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              All 10 AI Tools
            </p>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
              {TOOLS.map((tool) => (
                <Link
                  key={tool.slug}
                  to={`/tools/${tool.slug}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/60 text-xs font-medium text-slate-200 hover:bg-slate-800"
                >
                  <span>{tool.icon}</span>
                  <span className="truncate">{tool.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            {user.role !== 'guest' ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-800 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-white font-medium truncate">{user.fullName}</span>
                  <span className="text-xs text-blue-400 capitalize">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-lg text-sm"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="w-full text-center py-2 text-sm font-medium bg-slate-800 rounded-lg text-slate-200"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center py-2 text-sm font-medium bg-blue-600 text-white rounded-lg"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
