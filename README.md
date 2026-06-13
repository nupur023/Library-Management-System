# Library Management System

A full-stack Library Management System built using the MERN Stack (MongoDB, Express.js, React.js, Node.js). The application provides separate functionalities for administrators and students, enabling efficient management of books, users, and transactions.

## Features

### Admin Features

* Admin authentication and authorization
* Add, update, and delete books
* View all registered students
* Manage book issue and return transactions
* Dashboard with library statistics

### Student Features

* User registration and login
* Browse available books
* View issued books and transaction history
* Secure access to student-specific pages

## Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Context API

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt.js

## Project Structure

```text
Library-Management-System/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── vite.config.js
│
└── README.md
```

## Installation

### Clone Repository

```bash
git clone https://github.com/nupur023/Library-Management-System.git
cd Library-Management-System
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Start backend server:

```bash
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## API Features

* User Authentication
* Book Management
* Student Management
* Transaction Management
* Protected Routes using JWT

## Learning Outcomes

This project helped in understanding:

* MERN Stack Development
* REST API Development
* Authentication & Authorization
* MongoDB Database Design
* State Management in React
* Full-Stack Project Deployment

## Author

Nupur Patel

GitHub: https://github.com/nupur023
