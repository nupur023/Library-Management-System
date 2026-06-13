import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalTitles: 0,
    totalCopies: 0,
    issuedBooks: 0,
    overdueBooks: 0,
    activeStudents: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [overdueTransactions, setOverdueTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      // Fetch Books, Transactions, and Students
      const [booksRes, txsRes, studentsRes] = await Promise.all([
        api.get('/books'),
        api.get('/transactions'),
        api.get('/transactions/students'),
      ]);

      const books = booksRes.data;
      const transactions = txsRes.data;
      const students = studentsRes.data;

      // Calculate Metrics
      const totalTitles = books.length;
      const totalCopies = books.reduce((acc, book) => acc + book.totalCopies, 0);
      const issuedBooks = transactions.filter((t) => t.status === 'borrowed').length;
      const overdueBooks = transactions.filter((t) => t.status === 'overdue').length;
      const activeStudents = students.length;

      setMetrics({
        totalTitles,
        totalCopies,
        issuedBooks,
        overdueBooks,
        activeStudents,
      });

      // Filter recent transactions (limit to 5)
      setRecentTransactions(transactions.slice(0, 5));

      // Filter overdue transactions
      setOverdueTransactions(transactions.filter((t) => t.status === 'overdue'));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setErrorMsg('Failed to load dashboard metrics. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-slate-800 pb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Admin Dashboard</h1>
          <p className="mt-2 text-slate-400">High-level overview of library inventory, active checkouts, and students status.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="self-start sm:self-center rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-750 hover:text-white"
        >
          Refresh Data
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-rose-400">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Books */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/15 p-6 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-400">Total Books</span>
                <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{metrics.totalCopies}</span>
                <span className="text-xs font-medium text-slate-400">({metrics.totalTitles} titles)</span>
              </div>
            </div>

            {/* Issued Books */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/15 p-6 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-400">Active Borrows</span>
                <span className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white">{metrics.issuedBooks}</span>
              </div>
            </div>

            {/* Overdue Books */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/15 p-6 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-400">Overdue Books</span>
                <span className="rounded-lg bg-rose-500/10 p-2 text-rose-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white">{metrics.overdueBooks}</span>
              </div>
            </div>

            {/* Active Students */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/15 p-6 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-400">Registered Students</span>
                <span className="rounded-lg bg-teal-500/10 p-2 text-teal-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white">{metrics.activeStudents}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Management Actions</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/admin/books"
                className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 font-semibold text-sm transition shadow-md shadow-emerald-500/5"
              >
                Add / Edit Books Inventory
              </Link>
              <Link
                to="/admin/students"
                className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-white px-5 py-2.5 font-semibold text-sm transition"
              >
                Manage Student Memberships
              </Link>
              <Link
                to="/admin/transactions"
                className="rounded-lg border border-slate-700 bg-slate-805/50 hover:bg-slate-800 text-slate-300 px-5 py-2.5 font-semibold text-sm transition"
              >
                Track Overdues & Returns
              </Link>
            </div>
          </div>

          {/* Main sections layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Overdue Alerts */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/15 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-rose-400 mb-4 flex items-center gap-2">
                  <span>Critical Overdue Alerts</span>
                  <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-400">
                    {overdueTransactions.length}
                  </span>
                </h3>

                {overdueTransactions.length === 0 ? (
                  <div className="rounded-lg border border-slate-800 bg-slate-900/10 p-8 text-center text-slate-500 text-sm">
                    No books are currently overdue. Excellent!
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {overdueTransactions.map((tx) => (
                      <div
                        key={tx._id}
                        className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 flex items-center justify-between gap-4 text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-100">{tx.bookId?.title}</p>
                          <p className="text-slate-400 mt-0.5">
                            Student: <span className="text-emerald-400 font-semibold">{tx.userId?.name}</span>
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-rose-400 font-semibold">Due: {formatDate(tx.dueDate)}</p>
                          <p className="text-slate-500 mt-0.5">Status: Suspended?</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800/50 text-right">
                <Link to="/admin/transactions" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                  Manage all transaction queues &rarr;
                </Link>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/15 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
                {recentTransactions.length === 0 ? (
                  <div className="rounded-lg border border-slate-800 bg-slate-900/10 p-8 text-center text-slate-500 text-sm">
                    No recent borrowing transactions recorded.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTransactions.map((tx) => (
                      <div
                        key={tx._id}
                        className="rounded-lg border border-slate-800 bg-slate-900/20 p-3 flex items-center justify-between gap-4 text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-100">{tx.bookId?.title}</p>
                          <p className="text-slate-400 mt-0.5">
                            By {tx.userId?.name} ({tx.userId?.role})
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span
                            className={`inline-block rounded px-2 py-0.5 font-semibold uppercase ${
                              tx.status === 'returned'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : tx.status === 'overdue'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {tx.status}
                          </span>
                          <p className="text-slate-500 mt-1">{formatDate(tx.issueDate)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800/50 text-right">
                <Link to="/admin/transactions" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                  View full ledger history &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
