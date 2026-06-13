const Book = require('../models/Book');

// @desc    Get all books (with search & filter options)
// @route   GET /api/books
// @access  Private (both Admin and Student)
const getBooks = async (req, res, next) => {
  try {
    const { search, genre, author } = req.query;
    let query = {};

    // Apply search filter (Title, Author, or ISBN)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ];
    }

    // Apply genre filter
    if (genre) {
      query.genre = { $regex: genre, $options: 'i' };
    }

    // Apply author filter
    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }

    const books = await Book.find(query).sort({ title: 1 });
    res.json(books);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single book by ID
// @route   GET /api/books/:id
// @access  Private
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }
    res.json(book);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a book
// @route   POST /api/books
// @access  Private/Admin
const createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, genre, totalCopies, shelfLocation } = req.body;

    if (!title || !author || !isbn || !genre || totalCopies === undefined) {
      res.status(400);
      throw new Error('Please fill in all required fields');
    }

    const bookExists = await Book.findOne({ isbn });
    if (bookExists) {
      res.status(400);
      throw new Error('A book with this ISBN already exists');
    }

    // availableCopies is equal to totalCopies initially
    const book = await Book.create({
      title,
      author,
      isbn,
      genre,
      totalCopies: Number(totalCopies),
      availableCopies: Number(totalCopies),
      shelfLocation: shelfLocation || 'Stack Area A1',
    });

    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = async (req, res, next) => {
  try {
    const { title, author, isbn, genre, totalCopies, shelfLocation } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    // Check if other book has same ISBN
    if (isbn && isbn !== book.isbn) {
      const isbnExists = await Book.findOne({ isbn });
      if (isbnExists) {
        res.status(400);
        throw new Error('A book with this ISBN already exists');
      }
    }

    // Calculate changes in totalCopies to adjust availableCopies
    if (totalCopies !== undefined) {
      const diff = Number(totalCopies) - book.totalCopies;
      const newAvailable = book.availableCopies + diff;

      if (newAvailable < 0) {
        res.status(400);
        throw new Error(`Cannot reduce total copies. ${Math.abs(newAvailable)} copies are currently borrowed.`);
      }

      book.totalCopies = Number(totalCopies);
      book.availableCopies = newAvailable;
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.isbn = isbn || book.isbn;
    book.genre = genre || book.genre;
    book.shelfLocation = shelfLocation !== undefined ? shelfLocation : book.shelfLocation;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    // Check if any copy is currently borrowed
    if (book.availableCopies < book.totalCopies) {
      res.status(400);
      throw new Error('Cannot delete book while some copies are currently borrowed.');
    }

    await book.deleteOne();
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
