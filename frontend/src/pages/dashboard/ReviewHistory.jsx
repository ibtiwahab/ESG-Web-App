import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from "../../api";
import { AuthContext } from '../../context/AuthContext';

const ReviewHistory = () => {
  const [reviewedPosts, setReviewedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    // Check authorization - should only be accessible by superadmin
    if (!user || (!user.token)) {
      console.error('Access denied: No authentication token');
      setError('You need to be logged in to access this page');
      setLoading(false);
      return;
    }
    
    // Check if user has superadmin privileges - handle both potential role structures
    const hasSuperAdminPrivileges = 
      // Check for roles array (new format)
      (Array.isArray(user.roles) && user.roles.includes('superadmin')) ||
      // Check for single role property (old format)
      (user.role === 'superadmin');
      
    if (!hasSuperAdminPrivileges) {
      console.error('Access denied: User does not have superadmin privileges');
      setError('This page is restricted to Super Administrators only');
      setLoading(false);
      return;
    }
    
    fetchReviewHistory();
  }, [user]);

  const fetchReviewHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.token) {
        throw new Error('No authentication token available');
      }
      
      // Try all possible API endpoints systematically
      const endpoints = [
        '/api/posts/admin/history',
        '/posts/admin/history',
        '/api/posts/history', 
        '/posts/history'
      ];
      
      let response = null;
      let lastError = null;
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await API.get(endpoint, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          console.log(`Success with endpoint: ${endpoint}`);
          break; // Exit loop if successful
        } catch (err) {
          console.log(`Failed with endpoint ${endpoint}:`, err.message);
          lastError = err;
        }
      }
      
      // If all endpoints failed
      if (!response) {
        throw lastError || new Error('Failed to fetch review history from all attempted endpoints');
      }
      
      console.log('Review history response:', response);
      
      // Check if the response data is valid
      if (response?.data) {
        if (Array.isArray(response.data)) {
          console.log('Found reviewed posts:', response.data.length);
          setReviewedPosts(response.data);
        } else if (response.data.posts && Array.isArray(response.data.posts)) {
          console.log('Found reviewed posts in data.posts:', response.data.posts.length);
          setReviewedPosts(response.data.posts);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Received invalid data format from server');
        }
      } else {
        console.error('No data received from server');
        setError('No data received from server');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch review history: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (post) => {
    setSelectedPost(post);
  };

  const handleCloseDetails = () => {
    setSelectedPost(null);
  };

  const refreshHistory = () => {
    fetchReviewHistory();
  };

  // Go back to admin dashboard
  const handleGoBack = () => {
    navigate('/dashboard');
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button 
              onClick={handleGoBack}
              className="mr-4 text-blue-600 hover:text-blue-800"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold">Review History</h2>
          </div>
          <button 
            onClick={refreshHistory}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Refresh History
          </button>
        </div>
      
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded flex justify-between items-center">
            <div>{error}</div>
            <button 
              onClick={() => setError(null)} 
              className="text-red-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2">Loading review history...</p>
          </div>
        ) : (
          <>
            {reviewedPosts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded">
                <p className="text-lg text-gray-600">No review history found</p>
                <div className="mt-2 text-sm text-gray-500">
                  No posts have been approved or rejected yet.
                </div>
                <div className="mt-4 flex justify-center">
                  <button 
                    onClick={refreshHistory}
                    className="mx-2 text-blue-600 hover:underline"
                  >
                    Check again
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Business</th>
                      <th className="py-3 px-6 text-left">Author</th>
                      <th className="py-3 px-6 text-left">Reviewer</th>
                      <th className="py-3 px-6 text-left">Date Reviewed</th>
                      <th className="py-3 px-6 text-center">Status</th>
                      <th className="py-3 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm">
                    {reviewedPosts.map((post) => (
                      <tr key={post._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6 text-left">
                          <div className="font-medium">{post.businessName || post.title}</div>
                          <div className="text-xs text-gray-500">{post.industry || 'No industry'}</div>
                        </td>
                        <td className="py-3 px-6 text-left">
                          {post.createdBy?.name || post.author?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-6 text-left">
                          {post.approvedBy?.name || 'System'}
                        </td>
                        <td className="py-3 px-6 text-left">
                          {formatDate(post.updatedAt)}
                        </td>
                        <td className="py-3 px-6 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(post.status)}`}>
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-center">
                          <button
                            onClick={() => handleViewDetails(post)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Post Details</h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold">{selectedPost.businessName || selectedPost.title}</h4>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(selectedPost.status)}`}>
                  {selectedPost.status.charAt(0).toUpperCase() + selectedPost.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="font-medium">Created by:</span> {selectedPost.createdBy?.name || 'Unknown'}
                </div>
                <div>
                  <span className="font-medium">Created on:</span> {formatDate(selectedPost.createdAt)}
                </div>
                <div>
                  <span className="font-medium">Reviewed by:</span> {selectedPost.approvedBy?.name || 'Not reviewed'}
                </div>
                <div>
                  <span className="font-medium">Reviewed on:</span> {formatDate(selectedPost.updatedAt)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded mb-4">
                <h5 className="font-medium mb-2">Description</h5>
                <p className="whitespace-pre-line text-sm">{selectedPost.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Industry</h5>
                  <p className="text-sm">{selectedPost.industry || 'Not specified'}</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Investment Needed</h5>
                  <p className="text-sm">
                    {selectedPost.investmentNeeded ? 
                      `$${Number(selectedPost.investmentNeeded).toLocaleString()}` : 
                      'Not specified'}
                  </p>
                </div>
                {selectedPost.location && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Location</h5>
                    <p className="text-sm">{selectedPost.location}</p>
                  </div>
                )}
              </div>
              
              {selectedPost.status === 'rejected' && selectedPost.rejectionReason && (
                <div className="border-t pt-4 mt-4">
                  <h5 className="font-medium mb-2 text-red-700">Rejection Reason</h5>
                  <p className="text-sm bg-red-50 p-3 rounded">{selectedPost.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewHistory;