import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Branding */}
            <Link to="/" className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-xl font-bold tracking-wider text-transparent sm:text-2xl">
                GranthAlaya
              </span>
              <span className="hidden rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 sm:inline-block">
                LMS
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {user.role === 'admin' ? (
                <>
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-emerald-400'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/admin/books"
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-emerald-400'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }`
                    }
                  >
                    Manage Books
                  </NavLink>
                  <NavLink
                    to="/admin/students"
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-emerald-400'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }`
                    }
                  >
                    Students Directory
                  </NavLink>
                  <NavLink
                    to="/admin/transactions"
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-emerald-400'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }`
                    }
                  >
                    Transactions
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    to="/student/catalog"
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-emerald-400'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }`
                    }
                  >
                    Book Catalog
                  </NavLink>
                  <NavLink
                    to="/student/history"
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-emerald-400'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }`
                    }
                  >
                    Borrowing History
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* User Profile and Logout */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {user.role}
              </span>
              <span className="hidden text-sm font-medium text-slate-300 sm:inline-block">
                {user.name}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile menu (displays as simple secondary horizontal navbar) */}
        <div className="flex space-x-1 border-t border-slate-800/50 py-2 md:hidden overflow-x-auto scrollbar-none">
          {user.role === 'admin' ? (
            <>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                    isActive ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/books"
                className={({ isActive }) =>
                  `flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                    isActive ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                  }`
                }
              >
                Books
              </NavLink>
              <NavLink
                to="/admin/students"
                className={({ isActive }) =>
                  `flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                    isActive ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                  }`
                }
              >
                Students
              </NavLink>
              <NavLink
                to="/admin/transactions"
                className={({ isActive }) =>
                  `flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                    isActive ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                  }`
                }
              >
                Txns
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/student/catalog"
                className={({ isActive }) =>
                  `flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                    isActive ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                  }`
                }
              >
                Catalog
              </NavLink>
              <NavLink
                to="/student/history"
                className={({ isActive }) =>
                  `flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                    isActive ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                  }`
                }
              >
                My History
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
