import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState(null);
  
  // Form States
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    totalCopies: 1,
    shelfLocation: 'Stack Area A1',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const { data } = await api.get(`/books?search=${encodeURIComponent(search)}`);
      setBooks(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setErrorMsg('Failed to load books database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBooks();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      genre: '',
      totalCopies: 1,
      shelfLocation: 'Stack Area A1',
    });
    setIsEditing(false);
    setShowModal(true);
    setErrorMsg('');
  };

  const handleOpenEditModal = (book) => {
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      totalCopies: book.totalCopies,
      shelfLocation: book.shelfLocation,
    });
    setCurrentBookId(book._id);
    setIsEditing(true);
    setShowModal(true);
    setErrorMsg('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentBookId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'totalCopies' ? Number(value) : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    const { title, author, isbn, genre, totalCopies, shelfLocation } = formData;
    if (!title || !author || !isbn || !genre || totalCopies === undefined) {
      setErrorMsg('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/books/${currentBookId}`, formData);
        setSuccessMsg(`Book "${title}" updated successfully!`);
      } else {
        await api.post('/books', formData);
        setSuccessMsg(`Book "${title}" created successfully!`);
      }
      handleCloseModal();
      await fetchBooks();
    } catch (error) {
      console.error('Submit failed:', error);
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Operation failed. Please verify the ISBN is unique.';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      return;
    }

    try {
      setErrorMsg('');
      setSuccessMsg('');
      const { data } = await api.delete(`/books/${book._id}`);
      setSuccessMsg(data.message || 'Book deleted successfully!');
      await fetchBooks();
    } catch (error) {
      console.error('Delete failed:', error);
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to delete book. Check if some copies are borrowed.';
      setErrorMsg(message);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-slate-800 pb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Manage Books Inventory</h1>
          <p className="mt-2 text-slate-400">Add, edit, or remove books catalog titles.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="self-start sm:self-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 font-semibold text-sm transition shadow-md shadow-emerald-500/10"
        >
          Add New Book
        </button>
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

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter by title, author, or ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-808/30 py-2.5 px-4 text-black placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-12 text-center text-slate-400">
          <p className="text-lg font-medium">No catalog entries found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800/60 bg-slate-900/15">
          <table className="min-w-full divide-y divide-slate-800 text-left">
            <thead className="bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">ISBN</th>
                <th className="px-6 py-4">Genre</th>
                <th className="px-6 py-4 text-center">Copies (Avail/Total)</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
              {books.map((book) => {
                const isFullyAvailable = book.availableCopies === book.totalCopies;
                return (
                  <tr key={book._id} className="hover:bg-slate-900/10">
                    <td className="px-6 py-4 font-semibold text-white">{book.title}</td>
                    <td className="px-6 py-4">{book.author}</td>
                    <td className="px-6 py-4 font-mono text-xs">{book.isbn}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                        {book.genre}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold">
                      <span className={book.availableCopies === 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {book.availableCopies}
                      </span>
                      <span className="text-slate-500"> / </span>
                      <span className="text-slate-300">{book.totalCopies}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">{book.shelfLocation}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(book)}
                        className="rounded bg-slate-805 border border-slate-700 hover:border-emerald-500/50 px-2.5 py-1.5 text-xs text-slate-300 transition-colors hover:text-emerald-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(book)}
                        className="rounded bg-slate-805 border border-slate-700 hover:border-rose-500/50 px-2.5 py-1.5 text-xs text-slate-300 transition-colors hover:text-rose-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-850 bg-slate-900 p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">
                {isEditing ? 'Modify Book Entry' : 'Create Book Entry'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white text-2xl font-bold">×</button>
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Book Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white sm:text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Higher Engineering Mathematics"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Author Name *</label>
                  <input
                    type="text"
                    name="author"
                    required
                    value={formData.author}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white sm:text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="B.S. Grewal"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">ISBN Number *</label>
                  <input
                    type="text"
                    name="isbn"
                    required
                    value={formData.isbn}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white sm:text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="9788193328491"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Genre *</label>
                  <input
                    type="text"
                    name="genre"
                    required
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white sm:text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Mathematics"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Copies *</label>
                  <input
                    type="number"
                    name="totalCopies"
                    required
                    min="1"
                    value={formData.totalCopies}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white sm:text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Shelf Location</label>
                  <input
                    type="text"
                    name="shelfLocation"
                    value={formData.shelfLocation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white sm:text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Mathematics Section M1"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-850 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2 font-bold text-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : isEditing ? 'Save Changes' : 'Create Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;
