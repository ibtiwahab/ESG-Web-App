import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBookmark, FaEnvelope, FaBuilding, FaChartLine } from 'react-icons/fa';
import API from "../../api";

const InvestorDashboard = () => {
  const [savedBusinesses, setSavedBusinesses] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fixed API paths - removed duplicate 'api'
        const savedRes = await API.get('/investor/saved');
        const interestsRes = await API.get('/investor/interests');
        
        setSavedBusinesses(savedRes.data || []);
        setInterests(interestsRes.data || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load your investor data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const removeFromSaved = async (id) => {
    if (window.confirm('Remove this business from your saved list?')) {
      try {
        // Fixed API path
        await API.delete(`/investor/saved/${id}`);
        setSavedBusinesses(savedBusinesses.filter(business => business._id !== id));
      } catch (err) {
        setError('Failed to update saved businesses');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Investor Dashboard</h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaBookmark className="text-blue-600 text-xl" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 ml-3">Saved Businesses</h2>
            </div>
            <p className="text-3xl font-bold text-gray-800">{savedBusinesses.length}</p>
            <p className="text-gray-500 mt-1">Businesses you're tracking</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <FaEnvelope className="text-green-600 text-xl" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 ml-3">Active Interests</h2>
            </div>
            <p className="text-3xl font-bold text-gray-800">{interests.length}</p>
            <p className="text-gray-500 mt-1">Businesses you've contacted</p>
          </div>
        </div>

        {/* Saved Businesses */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Saved Businesses</h2>
                <p className="text-gray-600 mt-1">Businesses you're interested in</p>
              </div>
              <Link to="/businesses" className="text-blue-600 hover:underline">
                Browse More Businesses
              </Link>
            </div>
          </div>

          {savedBusinesses.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">You haven't saved any businesses yet.</p>
              <Link 
                to="/businesses" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Explore Businesses
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
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Saved
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {savedBusinesses.map(business => (
                    <tr key={business._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{business.businessName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{business.industry}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${business.investmentNeeded?.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{business.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(business.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => removeFromSaved(business._id)} 
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Investment Interests */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Your Investment Interests</h2>
            <p className="text-gray-600 mt-1">Businesses you've contacted</p>
          </div>

          {interests.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">You haven't expressed interest in any businesses yet.</p>
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
                      Contact
                    </th>
                    
                    
                   
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {interests.map(interest => (
                    <tr key={interest._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{interest.businessName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{interest.industry}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{interest.contactName}</div>
                        <div className="text-sm text-gray-500">{interest.contactEmail}</div>
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

export default InvestorDashboard;