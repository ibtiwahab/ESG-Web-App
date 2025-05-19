import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BusinessListPage from './pages/BusinessListPage';
import PostDetailPage from './pages/PostDetailPage';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import BusinessOwnerDashboard from './pages/dashboard/BusinessOwnerDashboard';
import InvestorDashboard from './pages/dashboard/InvestorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
import CreatePost from './pages/dashboard/CreatePost';
import PendingPosts from './pages/dashboard/PendingPosts';
import ReviewHistory from './pages/dashboard/ReviewHistory';
import ManageAdmins from './pages/dashboard/ManageAdmins';

// Route Protection
import ProtectedRoute from './components/routing/ProtectedRoute';

// Context
import { AuthProvider } from './context/AuthContext';
import EditPost from './pages/dashboard/EditPost';

function App() {
  return (
      <Router>
        <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/businesses" element={<BusinessListPage />} />
              <Route path="/post/:id" element={<PostDetailPage />} />

              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              
              {/* Business Owner Routes */}
              <Route 
                path="/dashboard/business" 
                element={
                  <ProtectedRoute roles={['business_owner']}>
                    <BusinessOwnerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/create-post" 
                element={
                  <ProtectedRoute roles={['business_owner']}>
                    <CreatePost />
                  </ProtectedRoute>
                } 
              />
              <Route path="/dashboard/edit-post" element={
                  <ProtectedRoute roles={['business_owner']}>
                    <EditPost />
                  </ProtectedRoute>
                } 
              />
              {/* Investor Routes */}
              <Route 
                path="/dashboard/investor" 
                element={
                  <ProtectedRoute roles={['investor']}>
                    <InvestorDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/dashboard/admin" 
                element={
                  <ProtectedRoute roles={['admin', 'superadmin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/pending-posts" 
                element={
                  <ProtectedRoute roles={['admin', 'superadmin']}>
                    <PendingPosts />
                  </ProtectedRoute>
                } 
              />

              {/* Super Admin Routes */}
              <Route 
                path="/dashboard/superadmin" 
                element={
                  <ProtectedRoute roles={['superadmin']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/review-history" 
                element={
                  <ProtectedRoute roles={['superadmin']}>
                    <ReviewHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/manage-admins" 
                element={
                  <ProtectedRoute roles={['superadmin']}>
                    <ManageAdmins />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
          <ToastContainer />
        </div>
        </AuthProvider>
      </Router>
  );
}

export default App;
