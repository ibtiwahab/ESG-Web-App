import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaHandshake, FaLeaf } from 'react-icons/fa';

const HomePage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-500 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Connecting Sustainable Businesses with Impact Investors
            </h1>
            <p className="text-xl mb-8">
              ESG Connect helps mission-driven businesses find the right investors to scale their impact.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/businesses"
                className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium"
              >
                Browse Businesses
              </Link>
              <Link
                to="/register"
                className="bg-transparent hover:bg-white hover:text-blue-600 border-2 border-white px-6 py-3 rounded-md font-medium"
              >
                Join Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            How ESG Connect Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-green-500 mb-4">
                <FaLeaf size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-2">Showcase Your Impact</h3>
              <p className="text-gray-600">
                Create your business profile highlighting your environmental, social, and governance practices.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-blue-500 mb-4">
                <FaHandshake size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-2">Connect with Investors</h3>
              <p className="text-gray-600">
                Get discovered by investors who share your values and are looking for responsible investments.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-purple-500 mb-4">
                <FaChartLine size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-2">Grow Your Impact</h3>
              <p className="text-gray-600">
                Secure funding to scale your sustainable business and create lasting positive change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 italic mb-4">
                "ESG Connect helped us find investors who truly understood our mission. We've secured funding that allows us to expand our sustainable packaging solutions globally."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold">Sarah Johnson</h4>
                  <p className="text-gray-500">CEO, GreenPack Solutions</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 italic mb-4">
                "As an impact investor, I've discovered incredible opportunities through ESG Connect that align with my values while delivering strong financial returns."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold">Michael Chen</h4>
                  <p className="text-gray-500">Founder, Sustainable Growth Fund</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make an Impact?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of sustainable businesses and impact investors today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium"
            >
              Create Account
            </Link>
            <Link
              to="/businesses"
              className="bg-transparent hover:bg-white hover:text-blue-600 border-2 border-white px-6 py-3 rounded-md font-medium"
            >
              Browse Businesses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
