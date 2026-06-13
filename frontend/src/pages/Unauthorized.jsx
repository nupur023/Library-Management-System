import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Unauthorized = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-950 px-4 text-center">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md max-w-md w-full">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-6">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-8">
          You do not have the required permissions to view this page. Librarian authorization is required.
        </p>
        <Link
          to={user?.role === 'admin' ? '/admin/dashboard' : '/student/catalog'}
          className="inline-block rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-6 py-2.5 transition-all shadow-lg shadow-emerald-500/20"
        >
          Return to Safety
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
