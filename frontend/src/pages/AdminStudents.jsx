import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Detail Modal states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [statusUpdating, setStatusUpdating] = useState({});

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const { data } = await api.get('/transactions/students');
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setErrorMsg('Failed to load registered student records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const toggleStudentStatus = async (studentId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    const confirmMsg = `Are you sure you want to change this student's status to ${nextStatus}?`;
    
    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      setStatusUpdating((prev) => ({ ...prev, [studentId]: true }));
      setErrorMsg('');
      setSuccessMsg('');

      const { data } = await api.put(`/transactions/students/${studentId}/status`, {
        status: nextStatus,
      });

      // Update locally
      setStudents((prevStudents) =>
        prevStudents.map((s) =>
          s._id === studentId ? { ...s, status: nextStatus } : s
        )
      );
      setSuccessMsg(data.message || 'Student status updated successfully!');
    } catch (error) {
      console.error('Failed to toggle student status:', error);
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to update student status.';
      setErrorMsg(message);
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  const handleOpenHistoryModal = async (student) => {
    try {
      setSelectedStudent(student);
      setShowHistoryModal(true);
      setHistoryLoading(true);
      setErrorMsg('');

      const { data } = await api.get(`/transactions/students/${student._id}/history`);
      setStudentHistory(data.transactions);
    } catch (error) {
      console.error('Failed to fetch student history:', error);
      setErrorMsg('Failed to load borrowing history for student.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedStudent(null);
    setStudentHistory([]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Students Directory</h1>
        <p className="mt-2 text-slate-400">View student accounts, track borrowing histories, and manage membership statuses.</p>
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

      {/* Student Directory Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-12 text-center text-slate-400">
          <p className="text-lg font-medium">No registered students found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800/60 bg-slate-900/15">
          <table className="min-w-full divide-y divide-slate-800 text-left">
            <thead className="bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-center">Active Borrowed</th>
                <th className="px-6 py-4 text-center">Overdue Books</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
              {students.map((student) => {
                const isActive = student.status === 'Active';
                return (
                  <tr key={student._id} className="hover:bg-slate-900/10">
                    <td className="px-6 py-4 font-semibold text-white">{student.name}</td>
                    <td className="px-6 py-4">{student.email}</td>
                    <td className="px-6 py-4 font-mono text-xs">{formatDate(student.createdAt)}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-200">
                      {student.metrics?.activeBorrows || 0}
                    </td>
                    <td className="px-6 py-4 text-center font-bold">
                      <span className={(student.metrics?.overdueBorrows || 0) > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}>
                        {student.metrics?.overdueBorrows || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenHistoryModal(student)}
                        className="rounded bg-slate-805 border border-slate-700 hover:border-emerald-500/50 px-2.5 py-1.5 text-xs text-slate-300 transition-colors hover:text-emerald-400"
                      >
                        View History
                      </button>
                      <button
                        onClick={() => toggleStudentStatus(student._id, student.status)}
                        disabled={statusUpdating[student._id]}
                        className={`rounded border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-450 hover:bg-rose-500/20 hover:text-rose-400'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450 hover:bg-emerald-500/20 hover:text-emerald-400'
                        }`}
                      >
                        {statusUpdating[student._id] ? 'Updating...' : isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* History Ledger Modal */}
      {showHistoryModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white">Borrowing History Ledger</h3>
                <p className="text-xs text-slate-400 mt-1">Student: {selectedStudent.name} ({selectedStudent.email})</p>
              </div>
              <button onClick={handleCloseHistoryModal} className="text-slate-400 hover:text-white text-2xl font-bold">×</button>
            </div>

            {historyLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : studentHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No borrowing history found for this student.
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-800">
                <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                  <thead className="bg-slate-900/60 font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Book Title</th>
                      <th className="px-4 py-3">Author</th>
                      <th className="px-4 py-3">ISBN</th>
                      <th className="px-4 py-3">Issue Date</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Return Date</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {studentHistory.map((tx) => (
                      <tr key={tx._id} className="hover:bg-slate-850/30">
                        <td className="px-4 py-3 font-semibold text-slate-100">{tx.bookId?.title || 'Unknown Book'}</td>
                        <td className="px-4 py-3">{tx.bookId?.author || '-'}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{tx.bookId?.isbn || '-'}</td>
                        <td className="px-4 py-3">{formatDate(tx.issueDate)}</td>
                        <td className="px-4 py-3">{formatDate(tx.dueDate)}</td>
                        <td className="px-4 py-3 text-emerald-400 font-semibold">{formatDate(tx.returnDate)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded px-2 py-0.5 font-bold uppercase text-[10px] ${
                              tx.status === 'returned'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : tx.status === 'overdue'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleCloseHistoryModal}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white"
              >
                Close Directory Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
