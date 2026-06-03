/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Cloud, Search, Sun, Moon, LogOut, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Sync search state with URL parameters
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchValue((prev) => (prev !== q ? q : prev));
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setSearchParams({ q: searchValue.trim() });
    } else {
      searchParams.delete('q');
      setSearchParams(searchParams);
    }
  };

  const handleClearSearch = () => {
    setSearchValue('');
    searchParams.delete('q');
    setSearchParams(searchParams);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div 
          onClick={() => navigate('/')} 
          className="flex cursor-pointer items-center space-x-3 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105 duration-300">
            <Cloud className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            NestDrive
          </span>
        </div>

        {/* Global Search Bar */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="relative hidden max-w-md w-full sm:flex items-center"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search folders and images..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-10 w-full rounded-full border border-border/60 bg-muted/30 pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-background transition-all duration-200"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Actions Menu */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/40 hover:bg-muted/50 text-foreground transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
          </button>

          {/* User Profile Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none cursor-pointer"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-purple-600 font-semibold text-white text-sm shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {dropdownOpen && (
                <>
                  {/* Overlay background to close dropdown */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-border/60 bg-card p-2 text-foreground shadow-2xl ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-border/40 mb-1">
                      <p className="text-sm font-semibold truncate text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/');
                      }}
                      className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted/50 cursor-pointer"
                    >
                      <Shield className="h-4 w-4 text-primary" />
                      <span>My Drive</span>
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
