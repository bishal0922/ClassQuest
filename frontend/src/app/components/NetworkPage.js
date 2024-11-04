"use client";

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../components/AuthProvider';
import { 
  UserPlus, UserCheck, UserX, Clock, Search as SearchIcon, 
  Users, Mail, Filter, RefreshCw 
} from 'lucide-react';

const NetworkPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, connected, pending, received
  const { user } = useAuthContext();
  
  // Connection status maps
  const [connectionStatuses, setConnectionStatuses] = useState({
    connected: new Set(),
    pending: new Set(),
    received: new Set()
  });

  useEffect(() => {
    if (user) {
      fetchUserConnections();
    }
  }, [user]);

  const fetchUserConnections = async () => {
    if (!user?.uid) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/connections?userId=${user.uid}&type=all`);
      if (!response.ok) throw new Error('Failed to fetch connections');
      
      const data = await response.json();
      setConnections(data);
      
      // Update connection status maps
      const newStatuses = {
        connected: new Set(),
        pending: new Set(),
        received: new Set()
      };
      
      data.forEach(conn => {
        const targetId = conn.targetUser.firebaseId;
        if (conn.status === 'connected') {
          newStatuses.connected.add(targetId);
        } else if (conn.status === 'pending') {
          if (conn.initiator === user.uid) {
            newStatuses.pending.add(targetId);
          } else {
            newStatuses.received.add(targetId);
          }
        }
      });

      setConnectionStatuses(newStatuses);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !user?.uid) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(searchQuery)}&currentUserId=${encodeURIComponent(user.uid)}`
      );
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data);
      setActiveTab('search');
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConnect = async (targetUserId) => {
    if (!user?.uid || !targetUserId) return;

    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: user.uid, toUserId: targetUserId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send connection request');
      }

      setConnectionStatuses(prev => ({
        ...prev,
        pending: new Set([...prev.pending, targetUserId])
      }));
      
      await fetchUserConnections(); // Refresh connections
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleAcceptRequest = async (requesterId) => {
    if (!user?.uid || !requesterId) return;

    try {
      const response = await fetch('/api/connections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, requesterId })
      });

      if (!response.ok) {
        throw new Error('Failed to accept connection');
      }

      await fetchUserConnections(); // Refresh connections
    } catch (error) {
      console.error('Error accepting connection request:', error);
    }
  };

  const handleRejectOrRemoveConnection = async (targetId) => {
    if (!user?.uid || !targetId) return;

    try {
      const response = await fetch('/api/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, targetId })
      });

      if (!response.ok) {
        throw new Error('Failed to remove connection');
      }

      await fetchUserConnections(); // Refresh connections
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  const getConnectionStatus = (userId) => {
    if (connectionStatuses.connected.has(userId)) return 'connected';
    if (connectionStatuses.pending.has(userId)) return 'pending';
    if (connectionStatuses.received.has(userId)) return 'requested';
    return 'none';
  };

  const renderActionButton = (userId) => {
    const status = getConnectionStatus(userId);
    
    switch (status) {
      case 'connected':
        return (
          <button
            onClick={() => handleRejectOrRemoveConnection(userId)}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Connected
          </button>
        );
      case 'pending':
        return (
          <button
            onClick={() => handleRejectOrRemoveConnection(userId)}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
          >
            <Clock className="mr-2 h-4 w-4" />
            Cancel Request
          </button>
        );
      case 'requested':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleAcceptRequest(userId)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Accept
            </button>
            <button
              onClick={() => handleRejectOrRemoveConnection(userId)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
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
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
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

  const getFilteredConnections = () => {
    if (activeTab === 'search') return searchResults;
    
    return connections.filter(conn => {
      switch (activeTab) {
        case 'connected':
          return conn.status === 'connected';
        case 'pending':
          return conn.status === 'pending' && conn.initiator === user.uid;
        case 'received':
          return conn.status === 'pending' && conn.initiator !== user.uid;
        default:
          return true;
      }
    });
  };

  const tabs = [
    { id: 'all', label: 'All', icon: Users },
    { id: 'connected', label: 'Connected', icon: UserCheck },
    { id: 'pending', label: 'Sent', icon: Clock },
    { id: 'received', label: 'Received', icon: UserPlus },
    { id: 'search', label: 'Search Results', icon: SearchIcon },
  ];

  const filteredConnections = getFilteredConnections();

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Network</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchUserConnections}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
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
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isVisible = id !== 'search' || (id === 'search' && searchResults.length > 0);
            if (!isVisible) return null;

            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`
                  mr-2 h-5 w-5
                  ${activeTab === id
                    ? 'text-indigo-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                  }
                `}
                />
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredConnections.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredConnections.map((connection) => {
              const userData = connection.targetUser || connection;
              return (
                <li key={userData.firebaseId} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-800 font-medium">
                            {getInitials(userData.displayName)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h2 className="text-sm font-medium text-gray-900">
                          {userData.displayName}
                        </h2>
                        <div className="flex items-center mt-1">
                          <Mail className="h-4 w-4 text-gray-400 mr-1" />
                          <p className="text-sm text-gray-500">
                            {userData.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      {renderActionButton(userData.firebaseId)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {activeTab === 'search' ? 
            searchQuery ? 'No users found matching your search' : 'Search for users above' :
            activeTab === 'connected' ? 'No connections yet' :
            activeTab === 'pending' ? 'No pending requests sent' :
            activeTab === 'received' ? 'No pending requests received' :
            'No users found'
          }
        </div>
      )}
    </div>
  );
};

export default NetworkPage;