"use client"
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../components/AuthProvider';
import { UserPlus, UserCheck, UserX, Clock, Search as SearchIcon } from 'lucide-react';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState(new Set());
  const [pendingConnections, setPendingConnections] = useState(new Set());
  const [pendingRequests, setPendingRequests] = useState(new Set());
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      fetchUserConnections();
    }
  }, [user]);

  const fetchUserConnections = async () => {
    if (!user?.uid) return;

    try {
      const response = await fetch(`/api/connections?userId=${user.uid}&type=all`);
      if (!response.ok) throw new Error('Failed to fetch connections');
      
      const data = await response.json();
      
      // Process the data to separate different types of connections
      const connected = new Set();
      const pending = new Set();
      const requests = new Set();
      
      data.forEach(conn => {
        const targetId = conn.targetUser.firebaseId;
        if (conn.status === 'connected') {
          connected.add(targetId);
        } else if (conn.status === 'pending') {
          if (conn.initiator === user.uid) {
            pending.add(targetId);
          } else {
            requests.add(targetId);
          }
        }
      });

      setConnections(connected);
      setPendingConnections(pending);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !user?.uid) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(searchQuery)}&currentUserId=${encodeURIComponent(user.uid)}`
      );
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      // Remove duplicates and current user
      const uniqueResults = data.reduce((acc, curr) => {
        if (!acc.some(item => item.email === curr.email) && curr.firebaseId !== user.uid) {
          acc.push(curr);
        }
        return acc;
      }, []);
      
      setSearchResults(uniqueResults);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (targetUserId) => {
    if (!user?.uid || !targetUserId) return;

    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fromUserId: user.uid, toUserId: targetUserId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send connection request');
      }

      // Immediately update the UI
      setPendingConnections(prev => new Set([...prev, targetUserId]));
      
      // Update the search results to reflect the new pending status
      setSearchResults(prev => 
        prev.map(result => 
          result.firebaseId === targetUserId ? { ...result, pending: true } : result
        )
      );
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleAcceptRequest = async (requesterId) => {
    if (!user?.uid || !requesterId) return;

    try {
      const response = await fetch('/api/connections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid, requesterId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept connection');
      }

      // Update local state immediately
      setPendingRequests(prev => {
        const newRequests = new Set(prev);
        newRequests.delete(requesterId);
        return newRequests;
      });
      setConnections(prev => new Set([...prev, requesterId]));

      // Update search results if necessary
      setSearchResults(prev =>
        prev.map(result =>
          result.firebaseId === requesterId ? { ...result, connected: true } : result
        )
      );
    } catch (error) {
      console.error('Error accepting connection request:', error);
    }
  };

  const handleRejectRequest = async (requesterId) => {
    if (!user?.uid || !requesterId) return;

    try {
      const response = await fetch('/api/connections', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid, requesterId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject connection');
      }

      // Update local state
      setPendingRequests(prev => {
        const newRequests = new Set(prev);
        newRequests.delete(requesterId);
        return newRequests;
      });

      // Update search results if necessary
      setSearchResults(prev =>
        prev.map(result =>
          result.firebaseId === requesterId ? { ...result, requested: false } : result
        )
      );
    } catch (error) {
      console.error('Error rejecting connection request:', error);
    }
  };

  const getConnectionStatus = (userId) => {
    if (connections.has(userId)) return 'connected';
    if (pendingConnections.has(userId)) return 'pending';
    if (pendingRequests.has(userId)) return 'requested';
    return 'none';
  };

  const renderConnectionButton = (userId) => {
    const status = getConnectionStatus(userId);
    
    switch (status) {
      case 'connected':
        return (
          <button disabled className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100">
            <UserCheck className="mr-2 h-4 w-4" />
            Connected
          </button>
        );
      case 'pending':
        return (
          <button disabled className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100">
            <Clock className="mr-2 h-4 w-4" />
            Pending
          </button>
        );
      case 'requested':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleAcceptRequest(userId)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Accept
            </button>
            <button
              onClick={() => handleRejectRequest(userId)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <UserX className="mr-2 h-4 w-4" />
              Reject
            </button>
          </div>
        );
      default:
        return (
          <button
            onClick={() => handleConnect(userId)}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Connect
          </button>
        );
    }
  };

  const getInitials = (displayName) => {
    if (!displayName) return '?';
    return displayName.split(' ').map(n => n[0]?.toUpperCase()).join('');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Search Users</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            Connected
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
            Pending
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            Available
          </span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <div className="flex-grow relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {searchResults.map((result) => (
              <li key={result.firebaseId} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-800 font-medium">
                            {getInitials(result.displayName)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{result.displayName}</p>
                        <p className="text-sm text-gray-500">{result.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    {renderConnectionButton(result.firebaseId)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchResults.length === 0 && searchQuery && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No users found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;