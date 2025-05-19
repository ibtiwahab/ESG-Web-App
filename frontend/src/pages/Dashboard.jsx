import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);
  
  useEffect(() => {
    if (!loading) { // Only redirect once we know the auth state
      if (!user) {
        // Not authenticated
        navigate('/login');
        return;
      }

      // Redirect based on user role
      const userRole = user.role || localStorage.getItem('userRole');
      
      if (userRole === 'business_owner') {
        navigate('/dashboard/business');
      } else if (userRole === 'investor') {
        navigate('/dashboard/investor');
      } else if (userRole === 'admin') {
        navigate('/dashboard/admin');
      } else if (userRole === 'superadmin') {
        navigate('/dashboard/superadmin');
      } else {
        // Default to investor dashboard if role is not recognized
        navigate('/dashboard/investor');
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Loading...</h1>
          <p className="text-gray-600">Redirecting to your personalized dashboard...</p>
          <div className="mt-4">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="animate-pulse w-full h-full bg-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;