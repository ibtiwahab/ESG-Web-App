import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaEnvelope, FaUser, FaMapMarkerAlt, FaDollarSign, FaBookmark } from 'react-icons/fa';
import API from '../api';
import AuthContext from '../context/AuthContext';

const PostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interested, setInterested] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Use AuthContext instead of managing auth state locally
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        // Fixed endpoint: removed leading 'api' since it's already in the baseURL in API.js
        const res = await API.get(`/posts/${id}`);
        setPost(res.data);
        
        // Only check interest and saved status if authenticated as investor
        if (isAuthenticated && user?.role === 'investor') {
          // Check if business is already in user's interests
          try {
            const interestsRes = await API.get('/investor/interests');
            const isInterested = interestsRes.data.some(interest => 
              interest.businessId === id || interest._id === id
            );
            setInterested(isInterested);
          } catch (err) {
            console.error('Failed to check interest status', err);
          }
          
          // Check if business is already saved
          try {
            const savedRes = await API.get('/investor/saved');
            const isSavedBusiness = savedRes.data.some(business => 
              business._id === id || business.businessId === id
            );
            setIsSaved(isSavedBusiness);
          } catch (err) {
            console.error('Failed to check saved status', err);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching business details:', err);
        setError('Failed to load business details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id, isAuthenticated, user]);

  const handleInterestSubmit = async () => {
    try {
      await API.post('/investor/interests', {
        businessId: id,
        message: '' // Optional message field, empty for now
      });
      setInterested(true);
    } catch (err) {
      console.error('Failed to submit interest', err);
      setError('Failed to submit your interest. Please try again.');
    }
  };
  
  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        // Remove from saved
        await API.delete(`/investor/saved/${id}`);
      } else {
        // Add to saved
        await API.post('/investor/saved', { businessId: id });
      }
      setIsSaved(!isSaved);
    } catch (err) {
      console.error('Failed to update saved status', err);
      setError('Failed to update saved status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-700">{error || 'Business details not found'}</p>
            <Link to="/businesses" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Back to Businesses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and is an investor
  const isInvestor = isAuthenticated && user?.role === 'investor';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-500">/</span>
                  <Link to="/businesses" className="text-gray-700 hover:text-blue-600">Businesses</Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <span className="mx-2 text-gray-500">/</span>
                  <span className="text-gray-500">{post.businessName}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Action buttons at top - only show if user is authenticated as investor */}
        {isInvestor && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleSaveToggle}
              className={`flex items-center px-4 py-2 rounded mr-2 ${
                isSaved 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <FaBookmark className="mr-2" />
              {isSaved ? 'Saved' : 'Save for Later'}
            </button>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative">
            <div className="h-64 bg-gradient-to-r from-blue-500 to-green-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-4xl font-bold text-white px-4 text-center">{post.businessName || post.title}</h1>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.industry && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {post.industry}
                </span>
              )}
              {post.businessStage && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {post.businessStage}
                </span>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Business Overview</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">{post.description}</p>
            </div>
          </div>
        </div>

        {/* Essential Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Investment Required */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaDollarSign className="mr-2 text-green-600" /> Investment Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Investment Needed</p>
                <p className="text-lg font-semibold">PKR {post.investmentNeeded?.toLocaleString() || 'Not specified'}</p>
              </div>
              {post.fundingUse && (
                <div>
                  <p className="text-sm text-gray-500">Use of Funds</p>
                  <p className="text-base">{post.fundingUse}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-600" /> Location
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-gray-500" />
                <div>
                  <p className="font-medium">{post.location || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaEnvelope className="mr-2 text-red-600" /> Posted By
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <FaUser className="mr-3 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Contact Person</p>
                <p className="font-medium">{post.createdBy?.name || post.contactName || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaEnvelope className="mr-3 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{post.createdBy?.email || post.contactEmail || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interest Button - only show if user is authenticated as investor */}
        {isInvestor && (
          <div className="text-center">
            {interested ? (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                <p className="font-medium">Your interest has been submitted!</p>
                <p className="text-sm mt-1">The business owner will contact you soon.</p>
              </div>
            ) : (
              <button
                onClick={handleInterestSubmit}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
              >
                I'm Interested
              </button>
            )}
          </div>
        )}

        {/* Login/Register prompt for non-authenticated users */}
        {!isAuthenticated && (
          <div className="text-center bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
            <h3 className="text-xl font-medium text-blue-800 mb-2">Interested in this business?</h3>
            <p className="text-gray-700 mb-4">Sign in or register as an investor to save this business or express interest.</p>
            <div className="flex justify-center space-x-4">
              <Link to="/login" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200">
                Sign In
              </Link>
              <Link to="/register" className="px-6 py-2 bg-white border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition duration-200">
                Register
              </Link>
            </div>
          </div>
        )}

        {/* Message for authenticated but non-investor users */}
        {isAuthenticated && user?.role !== 'investor' && (
          <div className="text-center bg-yellow-50 p-6 rounded-lg shadow-sm border border-yellow-100">
            <h3 className="text-xl font-medium text-yellow-800 mb-2">Investor Features Unavailable</h3>
            <p className="text-gray-700">You need to be registered as an investor to save businesses or express interest.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;