"use client"
import React, { useState } from 'react';
import { useAuthContext } from '../components/AuthProvider';
import { UserPlus, UserCheck, Clock } from 'lucide-react';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthContext();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      console.log("Response received");
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
      // Optionally, set an error state here to display to the user
    } finally {
      setIsLoading(false);
    }
  };
  const handleConnect = async (userId) => {
    // Implement connection logic here
    console.log('Connecting with user:', userId);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Users</h1>
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Search
          </button>
        </div>
      </form>

      {isLoading && <p>Loading...</p>}

      {searchResults.length > 0 && (
        <ul className="divide-y divide-gray-200">
          {searchResults.map((result) => (
            <li key={result.firebaseId} className="py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{result.displayName}</p>
                <p className="text-sm text-gray-500">{result.email}</p>
              </div>
              <button
                onClick={() => handleConnect(result.firebaseId)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Connect
              </button>
            </li>
          ))}
        </ul>
      )}

      {searchResults.length === 0 && searchQuery && !isLoading && (
        <p className="text-gray-500">No users found.</p>
      )}
    </div>
  );
};

export default SearchPage;