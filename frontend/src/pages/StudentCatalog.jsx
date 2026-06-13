import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StudentCatalog = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [borrowLoading, setBorrowLoading] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      // Build query string
      let queryParams = [];
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      if (selectedGenre) queryParams.push(`genre=${encodeURIComponent(selectedGenre)}`);
      
      const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
      const { data } = await api.get(`/books${queryString}`);
      setBooks(data);

      // Extract unique genres for the filter dropdown
      if (genres.length === 0 && data.length > 0) {
        const uniqueGenres = [...new Set(data.map((book) => book.genre))];
        setGenres(uniqueGenres);
      }
    } catch (error) {
      console.error('Error fetching catalog:', error);
      setErrorMsg('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly to avoid excessive requests
    const delayDebounce = setTimeout(() => {
      fetchBooks();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedGenre]);

  const handleBorrow = async (bookId) => {
    try {
      setBorrowLoading((prev) => ({ ...prev, [bookId]: true }));
      setErrorMsg('');
      setSuccessMsg('');

      const { data } = await api.post('/transactions/borrow', { bookId });
      
      // Update local state to reflect availability decrement immediately
      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book._id === bookId
            ? { ...book, availableCopies: book.availableCopies - 1 }
            : book
        )
      );

      setSuccessMsg(`"${data.bookId.title}" has been successfully borrowed! It is due back in 14 days.`);
      
      // Scroll to top to see notification
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Borrow request failed:', error);
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Borrowing failed. Please try again.';
      setErrorMsg(message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setBorrowLoading((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Book Catalog</h1>
        <p className="mt-2 text-slate-400">Search and borrow books from GranthAlaya's catalog.</p>
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

      {/* Filters & Search */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2.5 pl-4 pr-10 text-white placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2.5 px-3 text-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-12 text-center text-slate-400">
          <p className="text-lg font-medium">No books found matching your criteria.</p>
          <p className="text-sm mt-1">Try refining your search queries or filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => {
            const outOfStock = book.availableCopies <= 0;
            return (
              <div
                key={book._id}
                className="flex flex-col justify-between rounded-xl border border-slate-800/60 bg-slate-900/20 p-6 shadow-md transition-all hover:border-slate-700/80 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                      {book.genre}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      ISBN: {book.isbn}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white line-clamp-2 mt-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 font-medium">
                    By {book.author}
                  </p>
                  
                  <div className="mt-4 space-y-2 border-t border-slate-800/50 pt-3 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Shelf Location:</span>
                      <span className="text-slate-200 font-semibold">{book.shelfLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Availability:</span>
                      <span className={`font-semibold ${outOfStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {outOfStock ? 'Out of Stock' : `${book.availableCopies} of ${book.totalCopies} copies available`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => handleBorrow(book._id)}
                    disabled={outOfStock || borrowLoading[book._id]}
                    className={`flex w-full items-center justify-center rounded-lg py-2 px-4 text-sm font-semibold transition-all shadow-md focus:outline-none ${
                      outOfStock
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/10'
                    }`}
                  >
                    {borrowLoading[book._id] ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                    ) : outOfStock ? (
                      'Out of Stock'
                    ) : (
                      'Borrow Book'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentCatalog;
