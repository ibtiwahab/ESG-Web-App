import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext'; // Adjust path as needed
import ManageAdmins from './ManageAdmins';
import PendingPosts from './PendingPosts';
import ReviewHistory from './ReviewHistory';
import CreatePost from './CreatePost';

const SuperAdminDashboard = () => {
  const { user: contextUser, loading } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Don't run if still loading auth context
    if (loading) return;

    // Use user from AuthContext if available, otherwise fallback to localStorage
    let loggedInUser = contextUser;
    
    if (!loggedInUser) {
      try {
        const storedUser = localStorage.getItem('user');
        loggedInUser = storedUser ? JSON.parse(storedUser) : null;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        loggedInUser = null;
      }
    }

    if (!loggedInUser || loggedInUser.role !== 'superadmin') {
      navigate('/login');
      return;
    }
    
    setUser(loggedInUser);
  }, [contextUser, loading]); // Remove navigate from dependencies

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Show loading state while checking auth
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <p className="text-gray-300 mt-1">{user.name}</p>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="px-4 py-2 hover:bg-gray-700">
              <Link to="/dashboard/superadmin" className="block">Dashboard</Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-700">
              <Link to="/dashboard/manage-admins" className="block">Manage Admins</Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-700">
              <Link to="/dashboard/pending-posts" className="block">Pending Posts</Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-700">
              <Link to="/dashboard/review-history" className="block">Review History</Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-700">
              <Link to="/dashboard/create" className="block">Create Post</Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-700">
              <button onClick={handleLogout} className="w-full text-left">Logout</button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          </div>
        </header>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<DashboardHome user={user} />} />
            <Route path="/admins" element={<ManageAdmins />} />
            <Route path="/pending" element={<PendingPosts />} />
            <Route path="/history" element={<ReviewHistory />} />
            <Route path="/create" element={<CreatePost />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const DashboardHome = ({ user }) => {
  return (
    <div>
      <h2 className="text-xl mb-4">Welcome, {user.name}!</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Manage Admins</h3>
          <p className="text-gray-600 mb-4">Create, view and delete admin accounts</p>
          <Link to="/dashboard/manage-admins" className="text-blue-600 hover:underline">Go to Admin Management</Link>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Pending Posts</h3>
          <p className="text-gray-600 mb-4">Review posts waiting for approval</p>
          <Link to="/dashboard/pending-posts" className="text-blue-600 hover:underline">Review Pending Posts</Link>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Review History</h3>
          <p className="text-gray-600 mb-4">View history of approved and rejected posts</p>
          <Link to="/dashboard/review-history" className="text-blue-600 hover:underline">View Review History</Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;