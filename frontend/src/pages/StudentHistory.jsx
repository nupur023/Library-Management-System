import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StudentHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnLoading, setReturnLoading] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const { data } = await api.get('/transactions/history');
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching history:', error);
      setErrorMsg('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleReturn = async (transactionId) => {
    try {
      setReturnLoading((prev) => ({ ...prev, [transactionId]: true }));
      setErrorMsg('');
      setSuccessMsg('');

      const { data } = await api.post('/transactions/return', { transactionId });

      // Refresh list to update status and returnDate
      await fetchHistory();
      setSuccessMsg(data.message || 'Book returned successfully!');
    } catch (error) {
      console.error('Return request failed:', error);
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to return book. Please try again.';
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

  const activeBorrows = transactions.filter((t) => ['borrowed', 'overdue'].includes(t.status));
  const pastReturns = transactions.filter((t) => t.status === 'returned');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Borrowing History</h1>
        <p className="mt-2 text-slate-400">Track your active checkouts and past returned books.</p>
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

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Active Borrows */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>Currently Borrowed</span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
                {activeBorrows.length}
              </span>
            </h2>

            {activeBorrows.length === 0 ? (
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/10 p-8 text-center text-slate-400">
                <p>You have no books currently checked out.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {activeBorrows.map((tx) => {
                  const isOverdue = tx.status === 'overdue';
                  return (
                    <div
                      key={tx._id}
                      className={`flex flex-col justify-between rounded-xl border p-6 shadow-md transition-all ${
                        isOverdue
                          ? 'border-rose-500/30 bg-rose-955/5 hover:border-rose-500/50 shadow-rose-950/5'
                          : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              isOverdue
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {isOverdue ? 'Overdue' : 'Borrowed'}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            ISBN: {tx.bookId?.isbn}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white line-clamp-2 mt-1">
                          {tx.bookId?.title}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          By {tx.bookId?.author}
                        </p>

                        <div className="mt-4 space-y-2 border-t border-slate-800/50 pt-3 text-xs text-slate-400">
                          <div className="flex justify-between">
                            <span>Issue Date:</span>
                            <span className="text-slate-200 font-medium">{formatDate(tx.issueDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Due Date:</span>
                            <span className={`font-semibold ${isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                              {formatDate(tx.dueDate)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shelf Location:</span>
                            <span className="text-slate-200 font-medium">{tx.bookId?.shelfLocation}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={() => handleReturn(tx._id)}
                          disabled={returnLoading[tx._id]}
                          className="flex w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-white py-2 px-4 text-sm font-semibold transition-all focus:outline-none disabled:opacity-50"
                        >
                          {returnLoading[tx._id] ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          ) : (
                            'Return Book'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Returns */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>Return History</span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
                {pastReturns.length}
              </span>
            </h2>

            {pastReturns.length === 0 ? (
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/10 p-8 text-center text-slate-400">
                <p>No past returns recorded.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800/60 bg-slate-900/15">
                <table className="min-w-full divide-y divide-slate-800 text-left">
                  <thead className="bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Book Title</th>
                      <th className="px-6 py-4">Author</th>
                      <th className="px-6 py-4">Issue Date</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4">Return Date</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
                    {pastReturns.map((tx) => (
                      <tr key={tx._id} className="hover:bg-slate-900/10">
                        <td className="px-6 py-4 font-medium text-white">{tx.bookId?.title || 'Unknown Book'}</td>
                        <td className="px-6 py-4">{tx.bookId?.author || '-'}</td>
                        <td className="px-6 py-4">{formatDate(tx.issueDate)}</td>
                        <td className="px-6 py-4">{formatDate(tx.dueDate)}</td>
                        <td className="px-6 py-4 text-emerald-400 font-semibold">{formatDate(tx.returnDate)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                            Returned
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHistory;
