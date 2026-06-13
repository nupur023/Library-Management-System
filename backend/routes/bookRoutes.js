const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { protect, admin } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getBooks)
  .post(protect, admin, createBook);

router
  .route('/:id')
  .get(protect, getBookById)
  .put(protect, admin, updateBook)
  .delete(protect, admin, deleteBook);

module.exports = router;
