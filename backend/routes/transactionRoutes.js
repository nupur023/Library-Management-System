const express = require('express');
const router = express.Router();
const {
  borrowBook,
  returnBook,
  getUserHistory,
  getAllTransactions,
  getStudentsDirectory,
  getStudentHistory,
  updateStudentStatus,
} = require('../controllers/transactionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/borrow', protect, borrowBook);
router.post('/return', protect, returnBook);
router.get('/history', protect, getUserHistory);

// Admin-only endpoints
router.get('/', protect, admin, getAllTransactions);
router.get('/students', protect, admin, getStudentsDirectory);
router.route('/students/:id/history').get(protect, admin, getStudentHistory);
router.route('/students/:id/status').put(protect, admin, updateStudentStatus);

module.exports = router;
