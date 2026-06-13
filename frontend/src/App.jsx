import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import StudentCatalog from './pages/StudentCatalog';
import StudentHistory from './pages/StudentHistory';
import AdminDashboard from './pages/AdminDashboard';
import AdminBooks from './pages/AdminBooks';
import AdminStudents from './pages/AdminStudents';
import AdminTransactions from './pages/AdminTransactions';

// Home Redirect Helper based on user role
const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return user.role === 'admin' 
    ? <Navigate to="/admin/dashboard" replace /> 
    : <Navigate to="/student/catalog" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Home Router */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomeRedirect />
                  </ProtectedRoute>
                }
              />

              {/* Student/Member Routes */}
              <Route
                path="/student/catalog"
                element={
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <StudentCatalog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/history"
                element={
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <StudentHistory />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/books"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminBooks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/transactions"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminTransactions />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all Route redirects to / */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
