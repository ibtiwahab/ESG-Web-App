import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaLeaf, FaHandshake, FaGlobe } from 'react-icons/fa';
import API from "../api";

const BusinessCard = ({ post }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
      <div className="bg-blue-600 h-2"></div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.description.length > 150
            ? `${post.description.substring(0, 150)}...`
            : post.description}
        </p>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <div className="flex items-center mr-4">
            <FaLeaf className="mr-1 text-green-500" />
            <span>ESG Certified</span>
          </div>
          <div className="flex items-center">
            <FaGlobe className="mr-1 text-blue-500" />
            <span>{post.createdBy?.name || 'Business Owner'}</span>
          </div>
        </div>
        <Link
          to={`/post/${post._id}`}
          className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

const BusinessListPage = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const postsPerPage = 10;

  // Fetch all posts once
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await API.get('/posts');
        setAllPosts(res.data.posts);
        
        // Initialize with all posts
        setFilteredPosts(res.data.posts);
        setTotalPages(Math.ceil(res.data.posts.length / postsPerPage));
        setLoading(false);
      } catch (err) {
        setError('Failed to load business listings');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Apply search filter and update pagination
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Filter posts based on search term
    const filtered = allPosts.filter(post => {
      const searchLower = searchTerm.toLowerCase();
      return (
        post.title?.toLowerCase().includes(searchLower) || 
        post.description?.toLowerCase().includes(searchLower) ||
        post.createdBy?.name?.toLowerCase().includes(searchLower)
      );
    });
    
    setFilteredPosts(filtered);
    setTotalPages(Math.ceil(filtered.length / postsPerPage));
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  // Get current posts for pagination
  const getCurrentPosts = () => {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    return filteredPosts.slice(startIndex, endIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  const currentPosts = getCurrentPosts();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Discover Sustainable Businesses
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Connect with ESG-focused businesses and find your next investment opportunity
          </p>

          <form onSubmit={handleSearch} className="flex w-full max-w-lg mx-auto mb-8">
            <input
              type="text"
              placeholder="Search by business name or keywords..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
            >
              <FaSearch />
            </button>
          </form>
        </div>

        {error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8">
            <p>{error}</p>
          </div>
        ) : null}

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <FaHandshake className="mx-auto text-gray-400 text-5xl mb-4" />
            <h3 className="text-xl font-medium text-gray-500">No businesses found</h3>
            <p className="text-gray-500 mt-2">Try a different search query</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPosts.map((post) => (
                <BusinessCard key={post._id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav>
                  <ul className="flex">
                    <li>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 mx-1 rounded-md ${
                          currentPage === 1
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages).keys()].map((num) => (
                      <li key={num + 1}>
                        <button
                          onClick={() => handlePageChange(num + 1)}
                          className={`px-3 py-1 mx-1 rounded-md ${
                            currentPage === num + 1
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {num + 1}
                        </button>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 mx-1 rounded-md ${
                          currentPage === totalPages
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BusinessListPage;