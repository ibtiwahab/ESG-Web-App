import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from "../../api";
import { AuthContext } from '../../context/AuthContext';

const PendingPosts = () => {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    // Debug log for authentication troubleshooting
    console.log('Auth context user:', user);
    
    if (loading) {
      checkAuthAndFetchPosts();
    }
  }, [user]); // Re-run effect when user state changes

  const checkAuthAndFetchPosts = async () => {
    try {
      // Ensure we wait for the auth context to be fully loaded
      if (!user) {
        console.log('User context not loaded yet, waiting...');
        return; // Exit and wait for user context to update
      }
      
      // Debug: Check user object structure
      console.log('User object structure:', JSON.stringify(user, null, 2));
      
      // Generate a JWT token from user object if it doesn't exist
      // This is needed because the token is missing in your user object
      let token = user.token || user.accessToken || (user.auth && user.auth.token);
      
      if (!token) {
        console.log('No token found in user object, generating from user data...');
        // Generate a pseudo-token using the user ID and role
        // This should be replaced with proper token generation from your backend
        token = `${user._id}.${Date.now()}.${user.role || 'role'}`;
        console.log('Generated temporary token for API calls');
      }
      
      // Store token in sessionStorage as backup (if allowed by your security policy)
      try {
        sessionStorage.setItem('authToken', token);
        console.log('Token stored in session storage');
      } catch (storageErr) {
        console.warn('Could not store token in session storage:', storageErr);
      }
      
      // Check if user has admin privileges
      const hasAdminPrivileges = checkAdminPrivileges(user);
      
      if (!hasAdminPrivileges) {
        console.error('Access denied: User does not have admin privileges', user);
        setError('You do not have permission to access this page');
        setLoading(false);
        return;
      }
      
      console.log('User has admin privileges, proceeding to fetch posts');
      await fetchPendingPosts(token);
    } catch (err) {
      console.error('Auth check error:', err);
      setError('Authentication error: ' + err.message);
      setLoading(false);
    }
  };

  // Helper function to check admin privileges across different user structures
  const checkAdminPrivileges = (userObj) => {
    if (!userObj) return false;
    
    // Handle multiple possible user role structures
    return (
      // Check for roles array (new format)
      (Array.isArray(userObj.roles) && 
        (userObj.roles.includes('admin') || userObj.roles.includes('superadmin'))) ||
      // Check for single role property (old format)
      (userObj.role === 'admin' || userObj.role === 'superadmin') ||
      // Check for role within user.auth object
      (userObj.auth && userObj.auth.role && 
        (userObj.auth.role === 'admin' || userObj.auth.role === 'superadmin')) ||
      // Check for isAdmin flag
      (userObj.isAdmin === true) ||
      // Check for admin flag
      (userObj.admin === true) ||
      // Check for type field
      (userObj.type === 'admin' || userObj.type === 'superadmin')
    );
  };

  const fetchPendingPosts = async (authToken) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use provided token or try to retrieve from context or session storage
      const token = authToken || 
                   (user && (user.token || user.accessToken)) || 
                   sessionStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Debug log
      console.log('Token found, attempting to fetch pending posts');
      
      // Use the exact API endpoint structure from your routes file
      const endpoints = [
        // Primary endpoint based on your routes file
        '/posts/admin/pending'
      ];
      
      // Generate possible endpoint variations (helps with potential proxy configurations)
      const alternatePaths = [
        '/posts/admin/pending',
        '/admin/pending'
      ];
      
      alternatePaths.forEach(path => {
        endpoints.push(path);
        endpoints.push(`/${path}`);
      });
      
      let response = null;
      let lastError = null;
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          // Debug: Log the request endpoint that will be used
          console.log(`Making request to endpoint: ${endpoint}`);
          console.log('With headers:', { Authorization: `Bearer ${token.substring(0, 10)}...` });
          
          const fullUrl = endpoint.startsWith('/') ? 
                         `${window.location.origin}${endpoint}` : 
                         `${window.location.origin}/${endpoint}`;
          console.log(`Full URL being used: ${fullUrl}`);
          
          response = await API.get(endpoint, {
            headers: { 
              Authorization: `Bearer ${token}`,
              // Add any additional headers that might be required
              'Content-Type': 'application/json'
            },
            // Add baseURL dynamically if needed
            ...(endpoint.startsWith('/') ? {} : { baseURL: window.location.origin })
          });
          console.log(`Success with endpoint: ${endpoint}`);
          break; // Exit loop if successful
        } catch (err) {
          console.log(`Failed with endpoint ${endpoint}:`, err.message);
          lastError = err;
          
          // If we get a 401 Unauthorized, the token might be invalid
          if (err.response && err.response.status === 401) {
            console.error('Authentication token appears to be invalid or expired');
          }
        }
      }
      
      // If all endpoints failed
      if (!response) {
        throw lastError || new Error('Failed to fetch pending posts from all attempted endpoints');
      }
      
      // Log for debugging
      console.log('Pending posts response:', response);
      
      // Check if the response data is valid
      if (response?.data) {
        // Handle different response formats
        if (Array.isArray(response.data)) {
          console.log('Found pending posts:', response.data.length);
          setPendingPosts(response.data);
        } else if (response.data.posts && Array.isArray(response.data.posts)) {
          console.log('Found pending posts in data.posts:', response.data.posts.length);
          setPendingPosts(response.data.posts);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log('Found pending posts in data.data:', response.data.data.length);
          setPendingPosts(response.data.data);
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
      setError('Failed to fetch pending posts: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (post) => {
    setSelectedPost(post);
    setRejectionReason('');
    setReviewStatus('');
  };

  const handleCloseReview = () => {
    setSelectedPost(null);
    setRejectionReason('');
    setReviewStatus('');
  };

  const handleReviewSubmit = async (status) => {
    try {
      // Get token from all possible sources
      const token = user?.token || 
                   user?.accessToken || 
                   (user?.auth && user.auth.token) || 
                   sessionStorage.getItem('authToken');
                   
      if (!token) {
        setError('Authentication error. Please log in again.');
        return;
      }
      
      setReviewStatus('processing');
      
      const reviewData = { status };
      if (status === 'rejected') {
        if (!rejectionReason.trim()) {
          setError('Please provide a reason for rejection');
          setReviewStatus(''); // Reset status
          return;
        }
        reviewData.rejectionReason = rejectionReason;
      }
      
      // Try all possible endpoint patterns based on your routes file
      const endpoints = [
        `/posts/admin/review/${selectedPost._id}`,
        `/posts/admin/review/${selectedPost._id}`
      ];
      
      let success = false;
      let errorMessages = [];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to update post with endpoint: ${endpoint}`);
          // Try different HTTP methods if PUT doesn't work
          let response;
          
          try {
            response = await API.put(endpoint, reviewData, {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              // Add baseURL dynamically if needed
              ...(endpoint.startsWith('/') ? {} : { baseURL: window.location.origin })
            });
          } catch (putError) {
            console.log(`PUT failed: ${putError.message}, trying PATCH: ${endpoint}`);
            response = await API.patch(endpoint, reviewData, {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              // Add baseURL dynamically if needed
              ...(endpoint.startsWith('/') ? {} : { baseURL: window.location.origin })
            });
          }
          
          console.log(`Success with endpoint: ${endpoint}`, response);
          success = true;
          break;
        } catch (error) {
          errorMessages.push(`${endpoint}: ${error.message}`);
          console.log(`Update endpoint failed: ${endpoint}`, error.message);
        }
      }
      
      if (success) {
        setReviewStatus('success');
        setTimeout(() => {
          handleCloseReview();
          fetchPendingPosts(token); // Refresh pending posts list
        }, 1000);
      } else {
        throw new Error(`All update attempts failed: ${errorMessages.join(' | ')}`);
      }
    } catch (err) {
      setReviewStatus('error');
      setError('Failed to review post: ' + (err.response?.data?.message || err.message));
    }
  };

  const refreshPosts = () => {
    fetchPendingPosts();
  };

  // Go back to admin dashboard
  const handleGoBack = () => {
    navigate('/dashboard/admin');
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

  // Manual login function for emergencies
  const handleManualAuthentication = () => {
    try {
      // Prompt for token
      const manualToken = prompt("Please enter your authentication token:");
      if (manualToken) {
        // Store token and retry
        sessionStorage.setItem('authToken', manualToken);
        fetchPendingPosts(manualToken);
      }
    } catch (err) {
      console.error("Manual authentication failed:", err);
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
            <h2 className="text-2xl font-bold">Pending Posts</h2>
          </div>
          <button 
            onClick={refreshPosts}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Refresh Posts
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
          <p className="mt-2">Loading pending posts...</p>
        </div>
      ) : (
        <>
          {error && error.includes('authentication') && (
            <div className="mb-4 text-center">
              <button
                onClick={handleManualAuthentication}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Manual Authentication
              </button>
            </div>
          )}
          
          {pendingPosts.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded">
              <p className="text-lg text-gray-600">No pending posts to review</p>
              <div className="mt-2 text-sm text-gray-500">
                Check if business owners have submitted posts that need review.
              </div>
              <div className="mt-4 flex justify-center">
                <button 
                  onClick={refreshPosts}
                  className="mx-2 text-blue-600 hover:underline"
                >
                  Check again
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingPosts.map((post) => (
                <div key={post._id} className="border rounded p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium mb-2 truncate">{post.businessName || post.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-3">{post.description}</p>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>By: {post.createdBy?.name || post.author?.name || 'Unknown'}</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  {post.industry && (
                    <div className="text-sm text-gray-500 mb-2">
                      Industry: {post.industry}
                    </div>
                  )}
                  {post.investmentNeeded && (
                    <div className="text-sm text-gray-500 mb-4">
                      Investment: ${Number(post.investmentNeeded).toLocaleString()}
                    </div>
                  )}
                  <button
                    onClick={() => handleOpenReview(post)}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Review Post
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Review Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Review Post</h3>
              <button
                onClick={handleCloseReview}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">{selectedPost.businessName || selectedPost.title}</h4>
              <div className="text-sm text-gray-600 mb-2">
                <span>Posted by: {selectedPost.createdBy?.name || 'Unknown'} ({selectedPost.createdBy?.email || 'No email'})</span>
                <span className="mx-2">|</span>
                <span>Date: {formatDate(selectedPost.createdAt)}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded mt-2">
                <p className="whitespace-pre-line">{selectedPost.description}</p>
              </div>
              
              {/* Industry and investment details */}
              <div className="mt-4 grid grid-cols-2 gap-4">
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
            </div>
            
            {reviewStatus === 'success' ? (
              <div className="p-4 bg-green-100 text-green-700 rounded text-center">
                Post has been successfully {selectedPost.status === 'approved' ? 'approved' : 'rejected'}!
              </div>
            ) : reviewStatus === 'error' ? (
              <div className="p-4 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason (required if rejecting):
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2 border rounded"
                    rows="3"
                    placeholder="Explain why this post is being rejected..."
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => handleReviewSubmit('approved')}
                    disabled={reviewStatus === 'processing'}
                    className={`py-2 px-4 rounded ${
                      reviewStatus === 'processing'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReviewSubmit('rejected')}
                    disabled={reviewStatus === 'processing' || !rejectionReason.trim()}
                    className={`py-2 px-4 rounded ${
                      reviewStatus === 'processing' || !rejectionReason.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default PendingPosts;