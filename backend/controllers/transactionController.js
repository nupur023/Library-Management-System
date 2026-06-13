const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');

// @desc    Borrow a book (standard 14-day checkout period)
// @route   POST /api/transactions/borrow
// @access  Private (Students and Admins, typically Students)
const borrowBook = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    if (!bookId) {
      res.status(400);
      throw new Error('Please provide a book ID');
    }

    // Check if user is active
    const user = await User.findById(userId);
    if (!user || user.status === 'Suspended') {
      res.status(403);
      throw new Error('Your account is suspended. You cannot borrow books.');
    }

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    // Check if copies are available
    if (book.availableCopies <= 0) {
      res.status(400);
      throw new Error('No copies available for borrowing at this time');
    }

    // Check if user already has this book checked out
    const activeTransaction = await Transaction.findOne({
      userId,
      bookId,
      status: 'borrowed',
    });

    if (activeTransaction) {
      res.status(400);
      throw new Error('You have already borrowed a copy of this book. Return it before borrowing again.');
    }

    // Decrement available copies
    book.availableCopies -= 1;
    await book.save();

    // Create transaction (dueDate is handled by mongoose schema default)
    const transaction = await Transaction.create({
      bookId,
      userId,
      status: 'borrowed',
    });

    // Populate book and user details to return to UI
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('bookId', 'title author isbn shelfLocation')
      .populate('userId', 'name email');

    res.status(201).json(populatedTransaction);
  } catch (error) {
    next(error);
  }
};

// @desc    Return a borrowed book
// @route   POST /api/transactions/return
// @access  Private (Admins or Students. Let's allow either, but return requires the transaction ID)
const returnBook = async (req, res, next) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      res.status(400);
      throw new Error('Please provide a transaction ID');
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      res.status(404);
      throw new Error('Transaction record not found');
    }

    if (transaction.status === 'returned') {
      res.status(400);
      throw new Error('Book has already been returned');
    }

    // Check permissions: Students can only return their own transactions (unless user is admin)
    if (req.user.role !== 'admin' && transaction.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to return this book');
    }

    // Increment available copies
    const book = await Book.findById(transaction.bookId);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      await book.save();
    }

    // Update transaction
    transaction.returnDate = Date.now();
    transaction.status = 'returned';
    await transaction.save();

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('bookId', 'title author isbn')
      .populate('userId', 'name email');

    res.json({
      message: 'Book returned successfully',
      transaction: populatedTransaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get borrowing history of the logged-in student
// @route   GET /api/transactions/history
// @access  Private (Student and Admin)
const getUserHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check and update overdue statuses for this user before retrieving
    const now = new Date();
    await Transaction.updateMany(
      { userId, status: 'borrowed', dueDate: { $lt: now } },
      { $set: { status: 'overdue' } }
    );

    const transactions = await Transaction.find({ userId })
      .populate('bookId', 'title author isbn genre shelfLocation')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions (overdue, returned, active borrows)
// @route   GET /api/transactions
// @access  Private/Admin
const getAllTransactions = async (req, res, next) => {
  try {
    // Check and update overdue statuses globally
    const now = new Date();
    await Transaction.updateMany(
      { status: 'borrowed', dueDate: { $lt: now } },
      { $set: { status: 'overdue' } }
    );

    const transactions = await Transaction.find()
      .populate('bookId', 'title author isbn shelfLocation')
      .populate('userId', 'name email role status')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered students (Librarian student directory)
// @route   GET /api/transactions/students
// @access  Private/Admin
const getStudentsDirectory = async (req, res, next) => {
  try {
    // Find all users with role 'student'
    const students = await User.find({ role: 'student' }).select('-password').sort({ name: 1 });
    
    // For each student, get counts of active, returned, and overdue books
    const studentsWithMetrics = await Promise.all(
      students.map(async (student) => {
        const activeBorrows = await Transaction.countDocuments({
          userId: student._id,
          status: 'borrowed',
        });
        const overdueBorrows = await Transaction.countDocuments({
          userId: student._id,
          status: 'overdue',
        });
        const returnedBorrows = await Transaction.countDocuments({
          userId: student._id,
          status: 'returned',
        });

        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          status: student.status,
          createdAt: student.createdAt,
          metrics: {
            activeBorrows,
            overdueBorrows,
            returnedBorrows,
            totalBorrows: activeBorrows + overdueBorrows + returnedBorrows,
          },
        };
      })
    );

    res.json(studentsWithMetrics);
  } catch (error) {
    next(error);
  }
};

// @desc    Get borrowing history of a specific student
// @route   GET /api/transactions/students/:id/history
// @access  Private/Admin
const getStudentHistory = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    const student = await User.findById(studentId).select('-password');
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    const transactions = await Transaction.find({ userId: studentId })
      .populate('bookId', 'title author isbn genre shelfLocation')
      .sort({ createdAt: -1 });

    res.json({
      student,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student membership status (Active/Suspended)
// @route   PUT /api/transactions/students/:id/status
// @access  Private/Admin
const updateStudentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const studentId = req.params.id;

    if (!status || !['Active', 'Suspended'].includes(status)) {
      res.status(400);
      throw new Error('Please provide a valid status: Active or Suspended');
    }

    const student = await User.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    if (student.role !== 'student') {
      res.status(400);
      throw new Error('Cannot update status of an administrator');
    }

    student.status = status;
    await student.save();

    res.json({
      message: `Student status updated to ${status} successfully`,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        status: student.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  borrowBook,
  returnBook,
  getUserHistory,
  getAllTransactions,
  getStudentsDirectory,
  getStudentHistory,
  updateStudentStatus,
};
