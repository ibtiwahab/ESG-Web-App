import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import API from "../../api";

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    businessName: '',
    industry: '',
    location: '',
    investmentNeeded: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const value = e.target.name === 'investmentNeeded' 
      ? e.target.value.replace(/[^0-9]/g, '')
      : e.target.value;
      
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    
    // Keep title and businessName synchronized
    if (e.target.name === 'businessName') {
      setFormData(prev => ({
        ...prev,
        title: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate required fields
    const requiredFields = ['title', 'industry', 'investmentNeeded', 'description'];
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());
    
    if (missingFields.length > 0) {
      setError(`Please complete all required fields: ${missingFields.join(', ')}`);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No auth token found. Please log in again.');
      return;
    }

    // Format the data to match the expected API format
    const postData = {
      ...formData,
      investmentNeeded: parseInt(formData.investmentNeeded, 10) || 0,
      // Ensure we send both title and businessName
      title: formData.businessName || formData.title,
      businessName: formData.businessName || formData.title
    };

    try {
      setLoading(true);
      await API.post('/posts/create', postData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMessage('Business listing created successfully! It will be reviewed by an admin.');
      // Reset form
      setFormData({
        title: '',
        businessName: '',
        industry: '',
        location: '',
        investmentNeeded: '',
        description: ''
      });
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      setError('Failed to create business listing: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Industry options
  const industries = [
    'Technology',
    'Food & Beverage',
    'Healthcare',
    'Retail',
    'Manufacturing',
    'Real Estate',
    'Finance',
    'Education',
    'Transportation',
    'Entertainment',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Create New Business Listing</h1>
            <p className="text-gray-600 mt-1">Share your investment opportunity with potential investors</p>
          </div>
          
          <div className="p-6">
            {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded border border-red-300">{error}</div>}
            {successMessage && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded border border-green-300">{successMessage}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your business name"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an industry</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City, State"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Investment Needed (PKR) *</label>
                <input
                  type="text"
                  name="investmentNeeded"
                  value={formData.investmentNeeded}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Amount in USD"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your business, the opportunity, and how the investment will be used"
                  rows="8"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className={`py-3 px-6 rounded-lg font-medium ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit Business Listing'}
                </button>
                
                <span className="text-sm text-gray-500">* Required fields</span>
              </div>
            </form>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Review Process</h3>
              <p className="text-blue-700">
                All business listings require admin approval before they become visible to investors.
                You will be notified once your listing is reviewed. This typically takes 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;