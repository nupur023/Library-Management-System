import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, borrowed, overdue, returned
  const [search, setSearch] = useState('');
  
  const [returnLoading, setReturnLoading] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const { data } = await api.get('/transactions');
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setErrorMsg('Failed to load transaction logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleManualReturn = async (transactionId) => {
    if (!window.confirm('Mark this book as manually returned? This updates availability counts.')) {
      return;
    }

    try {
      setReturnLoading((prev) => ({ ...prev, [transactionId]: true }));
      setErrorMsg('');
      setSuccessMsg('');

      const { data } = await api.post('/transactions/return', { transactionId });
      
      // Update local state or re-fetch
      await fetchTransactions();
      setSuccessMsg(data.message || 'Book returned successfully!');
    } catch (error) {
      console.error('Return failed:', error);
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to process return.';
      setErrorMsg(message);
    } finally {
      setReturnLoading((prev) => ({ ...prev, [transactionId]: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Filter and Search Logic
  const filteredTransactions = transactions.filter((tx) => {
    // Apply Tab filter
    if (activeTab === 'borrowed' && tx.status !== 'borrowed') return false;
    if (activeTab === 'overdue' && tx.status !== 'overdue') return false;
    if (activeTab === 'returned' && tx.status !== 'returned') return false;

    // Apply Search filter (Student name, Book title, ISBN, Email)
    if (search) {
      const query = search.toLowerCase();
      const bookTitle = tx.bookId?.title?.toLowerCase() || '';
      const bookIsbn = tx.bookId?.isbn?.toLowerCase() || '';
      const studentName = tx.userId?.name?.toLowerCase() || '';
      const studentEmail = tx.userId?.email?.toLowerCase() || '';

      return (
        bookTitle.includes(query) ||
        bookIsbn.includes(query) ||
        studentName.includes(query) ||
        studentEmail.includes(query)
      );
    }

    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Transactions Ledger</h1>
        <p className="mt-2 text-slate-400">Monitor all checkouts, returns, and overdue assets globally.</p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400 flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-300 font-bold">×</button>
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-rose-400 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-300 font-bold">×</button>
        </div>
      )}

      {/* Filters and Search controls */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by student, book title, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-808/30 py-2.5 pl-4 pr-10 text-white placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex rounded-lg border border-slate-800 bg-slate-900/40 p-1 space-x-1">
          {[
            { id: 'all', label: 'All Logs' },
            { id: 'borrowed', label: 'Borrowed' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'returned', label: 'Returned' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-12 text-center text-slate-400">
          <p className="text-lg font-medium">No transactions found matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800/60 bg-slate-900/15">
          <table className="min-w-full divide-y divide-slate-800 text-left">
            <thead className="bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Book Title</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Return Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
              {filteredTransactions.map((tx) => {
                const isBorrowed = tx.status === 'borrowed';
                const isOverdue = tx.status === 'overdue';
                const isReturned = tx.status === 'returned';

                return (
                  <tr key={tx._id} className="hover:bg-slate-900/10">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{tx.bookId?.title || 'Deleted Book'}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">ISBN: {tx.bookId?.isbn || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{tx.userId?.name || 'Deleted User'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{tx.userId?.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{formatDate(tx.issueDate)}</td>
                    <td className="px-6 py-4 font-mono text-xs">{formatDate(tx.dueDate)}</td>
                    <td className="px-6 py-4 font-mono text-xs text-emerald-400">
                      {isReturned ? formatDate(tx.returnDate) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded px-2.5 py-0.5 text-xs font-bold uppercase ${
                          isReturned
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : isOverdue
                            ? 'bg-rose-500/10 text-rose-455 animate-pulse'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isReturned && (
                        <button
                          onClick={() => handleManualReturn(tx._id)}
                          disabled={returnLoading[tx._id]}
                          className="rounded border border-slate-700 bg-slate-805 hover:bg-slate-800 hover:border-emerald-500/50 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:text-emerald-400 disabled:opacity-50"
                        >
                          {returnLoading[tx._id] ? 'Returning...' : 'Mark Returned'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
