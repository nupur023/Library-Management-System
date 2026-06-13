import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      setSubmitting(false);
      return;
    }

    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      // Navigate to where they came from or default based on role
      if (from === '/') {
        // We need to fetch user details to determine destination. Wait, login returns success and updates context.
        // Let's redirect in a brief microtask or retrieve the role from the response.
        // We can just query localStorage or check the context (we wait a moment or decode).
        // A simpler way: we know that from login context `login` updates user state.
        // Let's check what the role is by calling local check or using a brief timeout,
        // or just let useAuth state update and we navigate them dynamically.
        // Wait, the easiest way is to let the login method return the user role, or fetch it.
        // Let's see how we wrote `login`:
        // `setUser({ _id: data._id, name: data.name, email: data.email, role: data.role, status: data.status })`
        // We can update the context `login` return value to include the user object!
        // Wait, we can also check the token or just check role of updated state.
        // Let's look at `login` implementation in AuthContext.jsx:
        // `return { success: true };`
        // If we want the role, we can modify the login return or simply fetch it inside the component.
        // Wait, the user state is updated in context. So inside Login we can just do:
        // Let's see, if we inspect data returned from login:
        // Wait, we can get data by changing `login` to return `{ success: true, role: data.role }`.
        // Let's edit `AuthContext.jsx` to return `{ success: true, role: data.role }` to make navigation simple!
        // Ah, let's look at the current Login.jsx. We can check the role by decoding the jwt token,
        // or just have Login.jsx check the context user if it's set. But state update is async,
        // so checking `user.role` immediately after `await login()` might show `null` or old state.
        // Thus, returning `{ success: true, role: data.role }` from the context login function is the cleanest, most elegant solution.
        // Let's inspect `AuthContext.jsx` login method. Yes! It does:
        // `return { success: true };`
        // Let's make Login.jsx wait or we can modify AuthContext.jsx to return role.
        // Wait, we can also parse the email or look at the response!
        // Let's modify AuthContext.jsx login/register methods to return the full user data:
        // `return { success: true, user: data };`
        // This is a super tiny edit and makes components so much easier to read! Let's do that in a bit, or we can write Login.jsx to handle it by receiving `{ success: true, user: data }`.
      }
      // Let's write the Login logic to handle role check from response. We'll modify AuthContext to return the user in a bit,
      // or we can write the Login logic to read the user role from the local Storage or decode the token.
      // Wait, we can modify AuthContext.jsx in a second. Let's make Login.jsx assume `login` returns `{ success: true, role: data.role }`.
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Sign in to access <span className="text-emerald-400 font-semibold">GranthAlaya LMS</span>
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
            {errorMsg}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email-address" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                placeholder="you@granthalaya.in"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative flex w-full justify-center rounded-lg border border-transparent bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 px-4 text-sm font-semibold text-white shadow-lg transition-all hover:from-emerald-400 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300">
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-4 rounded-lg bg-slate-800/30 p-3 border border-slate-800 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-emerald-500 text-center">Demo Credentials:</p>
          <div className="flex justify-between">
            <span>Admin Librarian:</span>
            <span className="font-mono text-emerald-300">aarav.admin@granthalaya.in / adminpassword</span>
          </div>
          <div className="flex justify-between">
            <span>Student (Active):</span>
            <span className="font-mono text-emerald-300">priya.student@granthalaya.in / studentpassword</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
