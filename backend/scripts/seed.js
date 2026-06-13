const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');

const users = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.admin@granthalaya.in',
    password: 'adminpassword',
    role: 'admin',
    status: 'Active',
  },
  {
    name: 'Priya Nair',
    email: 'priya.student@granthalaya.in',
    password: 'studentpassword',
    role: 'student',
    status: 'Active',
  },
  {
    name: 'Amit Verma',
    email: 'amit.student@granthalaya.in',
    password: 'studentpassword',
    role: 'student',
    status: 'Active',
  },
  {
    name: 'Kabir Malhotra',
    email: 'kabir.student@granthalaya.in',
    password: 'studentpassword',
    role: 'student',
    status: 'Suspended', // Seed a suspended user to test restriction flows
  },
];

const books = [
  {
    title: 'Higher Engineering Mathematics',
    author: 'B.S. Grewal',
    isbn: '9788193328491',
    genre: 'Mathematics',
    totalCopies: 5,
    availableCopies: 5,
    shelfLocation: 'Mathematics Section M1',
  },
  {
    title: 'A Textbook of Fluid Mechanics and Hydraulic Machines',
    author: 'R.K. Bansal',
    isbn: '9788131808153',
    genre: 'Mechanical Engineering',
    totalCopies: 4,
    availableCopies: 4,
    shelfLocation: 'Engineering Section E2',
  },
  {
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    isbn: '9780262033848',
    genre: 'Computer Science',
    totalCopies: 7,
    availableCopies: 7,
    shelfLocation: 'Computer Science Section CS1',
  },
  {
    title: 'Object-Oriented Programming with C++',
    author: 'E. Balagurusamy',
    isbn: '9781259029936',
    genre: 'Computer Science',
    totalCopies: 8,
    availableCopies: 8,
    shelfLocation: 'Computer Science Section CS2',
  },
  {
    title: 'Principles of Microeconomics',
    author: 'H.L. Ahuja',
    isbn: '9789352837311',
    genre: 'Economics',
    totalCopies: 3,
    availableCopies: 3,
    shelfLocation: 'Humanities Section H3',
  },
  {
    title: 'Let Us C',
    author: 'Yashavant Kanetkar',
    isbn: '9789389845686',
    genre: 'Computer Science',
    totalCopies: 10,
    availableCopies: 10,
    shelfLocation: 'Computer Science Section CS3',
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/granthalaya';
    console.log(`Connecting to database at ${mongoUri} for seeding...`);
    await mongoose.connect(mongoUri);

    // Clear existing collection records
    await User.deleteMany();
    await Book.deleteMany();
    await Transaction.deleteMany();

    console.log('Existing collections cleared.');

    // Seed Users (passwords will be hashed via Mongoose pre-save hook)
    const seededUsers = await User.create(users);
    console.log(`Successfully seeded ${seededUsers.length} users.`);

    // Seed Books
    const seededBooks = await Book.create(books);
    console.log(`Successfully seeded ${seededBooks.length} books.`);

    // Seed one transaction for Priya Nair borrowing "Let Us C"
    const priya = seededUsers.find((u) => u.email === 'priya.student@granthalaya.in');
    const letUsC = seededBooks.find((b) => b.isbn === '9789389845686');

    if (priya && letUsC) {
      // Decrement book availability
      letUsC.availableCopies -= 1;
      await letUsC.save();

      // Create transaction
      await Transaction.create({
        bookId: letUsC._id,
        userId: priya._id,
        issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Checked out 5 days ago
        dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),  // Due in 9 days
        status: 'borrowed',
      });
      console.log('Seeded initial transaction: Priya Nair borrowed "Let Us C".');
    }

    // Seed one overdue transaction for Amit Verma borrowing "Introduction to Algorithms"
    const amit = seededUsers.find((u) => u.email === 'amit.student@granthalaya.in');
    const introAlgo = seededBooks.find((b) => b.isbn === '9780262033848');

    if (amit && introAlgo) {
      introAlgo.availableCopies -= 1;
      await introAlgo.save();

      await Transaction.create({
        bookId: introAlgo._id,
        userId: amit._id,
        issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // Checked out 20 days ago
        dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),  // Due 6 days ago (Overdue!)
        status: 'overdue',
      });
      console.log('Seeded initial transaction: Amit Verma borrowed "Introduction to Algorithms" (OVERDUE).');
    }

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
