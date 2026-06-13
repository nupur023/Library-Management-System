const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a book title'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Please provide an author'],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, 'Please provide an ISBN number'],
      unique: true,
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Please provide a genre'],
      trim: true,
    },
    totalCopies: {
      type: Number,
      required: [true, 'Please provide the total copies'],
      min: [0, 'Total copies cannot be negative'],
      default: 1,
    },
    availableCopies: {
      type: Number,
      required: [true, 'Please provide the available copies'],
      min: [0, 'Available copies cannot be negative'],
      default: 1,
    },
    shelfLocation: {
      type: String,
      required: [true, 'Please provide a shelf location'],
      default: 'Stack Area A1',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Book', bookSchema);
