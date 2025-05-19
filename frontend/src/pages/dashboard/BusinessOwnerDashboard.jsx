import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import API from "../../api";

const BusinessOwnerDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token missing. Please log in again.');
        return;
      }
      
      const res = await API.get('/posts/user/posts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Check if response has data
      if (res.data && Array.isArray(res.data)) {
        // Log the data to help with debugging
        console.log('Posts data:', res.data);
        setPosts(res.data);
      } else {
        console.error('Unexpected API response format:', res);
        setPosts([]);
        setError('Received invalid data from server');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load your business listings: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    if (window.confirm('Are you sure you want to delete this business listing?')) {
      try {
        setDeleteLoading(id);
        const token = localStorage.getItem('token');
        
        // Use the API instance with the correct endpoint
        await API.delete(`/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setPosts(posts.filter(post => post._id !== id));
        setSuccessMessage('Business listing deleted successfully');
      } catch (err) {
        console.error('Error deleting post:', err);
        setError('Failed to delete business listing: ' + (err.response?.data?.message || err.message));
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending Review</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchPosts();
  };

  // Added function to handle clicking edit - this will ensure data is stored for edit form
  const handleEditClick = (post) => {
    // Store the post data in localStorage so the edit form can access it
    localStorage.setItem('editPostData', JSON.stringify(post));
    // Navigate to edit page
    navigate(`/dashboard/edit-post/${post._id}`);
  };

  // Helper function to get business name, handling both title and businessName fields
  const getBusinessName = (post) => {
    // Check for businessName first, then fall back to title
    return post.businessName || post.title || "Unnamed Business";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your business listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Business Dashboard</h1>
          <Link 
            to="/dashboard/create-post" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Create New Listing
          </Link>
        </div>

        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p>{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-start" role="alert">
            <FaExclamationTriangle className="mt-1 mr-3" />
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
              <button 
                onClick={handleRetry}
                className="mt-2 text-sm bg-red-200 hover:bg-red-300 text-red-800 py-1 px-3 rounded"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Your Business Listings</h2>
            <p className="text-gray-600 mt-1">Manage your investment opportunities</p>
          </div>

          {!posts || posts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">You haven't created any business listings yet.</p>
              <Link 
                to="/dashboard/create-post" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg inline-flex items-center"
              >
                <FaPlus className="mr-2" /> Create Your First Listing
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Industry
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investment Needed
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map(post => (
                    <tr key={post._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getBusinessName(post)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{post.industry || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {post.investmentNeeded 
                            ? `$${Number(post.investmentNeeded).toLocaleString()}` 
                            : "Not specified"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(post.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {post.createdAt 
                            ? new Date(post.createdAt).toLocaleDateString() 
                            : "Unknown date"}
                        </div>
                      </td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center gap-x-2">
                          <Link 
                            to={`/post/${post._id}`} 
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <FaEye />
                          </Link>

                          {/* Uncomment to enable Edit button */}
                          {/* <button 
                            onClick={() => handleEditClick(post)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <FaEdit />
                          </button> */}

                          <button 
                            onClick={() => deletePost(post._id)} 
                            className={`text-red-600 hover:text-red-900 ${post.status === 'approved' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={post.status === 'approved' || deleteLoading === post._id}
                            title={post.status === 'approved' ? "Approved listings cannot be deleted" : "Delete"}
                          >
                            {deleteLoading === post._id ? (
                              <span className="animate-pulse">...</span>
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        </div>
                    </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        
      </div>
    </div>
  );
};

export default BusinessOwnerDashboard;