import React, { useState, useEffect } from 'react';
import { FaPlus, FaList } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import API from "../../api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    pendingPosts: 0,
    totalBusinesses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          return parsedUser;
        }
        return null;
      } catch (err) {
        console.error('Error parsing user data:', err);
        return null;
      }
    };

    const fetchStats = async () => {
      const userData = fetchUserData();
      if (!userData?.token) {
        console.warn('No token found. Skipping fetch.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await API.get('/admin/stats', {
          headers: { Authorization: `Bearer ${userData.token}` },
        });

        if (response?.data) {
          const { pendingPosts, totalBusinesses } = response.data;
          setStats({ pendingPosts, totalBusinesses });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dashboardCards = [
    {
      title: 'Pending Posts',
      icon: <FaList className="text-yellow-500" size={24} />,
      link: '/dashboard/pending-posts',
      color: 'yellow',
      description: 'Review and approve new business postings',
    },
    {
      title: 'All Businesses',
      icon: <FaPlus className="text-green-500" size={24} />,
      link: '/businesses',
      color: 'green',
      description: 'View all registered businesses',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage business listings</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {dashboardCards.map((card, index) => (
                <Link
                  key={index}
                  to={card.link}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-full bg-${card.color}-100`}>
                      {card.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{card.title}</h3>
                  <p className="text-gray-600 text-sm">{card.description}</p>
                </Link>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  to="/dashboard/pending-posts"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-center"
                >
                  Review Pending Posts
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
