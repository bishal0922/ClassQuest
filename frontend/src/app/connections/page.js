// app/connections/page.js
"use client"
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../components/AuthProvider';
import { UserCheck, UserX, Clock, Users, UserPlus, Mail } from 'lucide-react';
import { format } from 'date-fns';

const ConnectionsPage = () => {
  const [activeTab, setActiveTab] = useState('connected');
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      fetchConnections(activeTab);
    }
  }, [user, activeTab]);

  const fetchConnections = async (type) => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/connections?userId=${user.uid}&type=${type}`);
      if (!response.ok) throw new Error('Failed to fetch connections');
      
      const data = await response.json();
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requesterId) => {
    try {
      const response = await fetch('/api/connections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid, requesterId })
      });

      if (!response.ok) throw new Error('Failed to accept connection');
      
      // Refresh connections list
      fetchConnections(activeTab);
    } catch (error) {
      console.error('Error accepting connection:', error);
    }
  };

  const handleRejectOrRemoveConnection = async (targetId) => {
    try {
      const response = await fetch('/api/connections', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid, targetId })
      });

      if (!response.ok) throw new Error('Failed to remove connection');
      
      // Refresh connections list
      fetchConnections(activeTab);
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  const tabs = [
    { id: 'connected', label: 'Connected', icon: Users },
    { id: 'received', label: 'Requests Received', icon: UserPlus },
    { id: 'sent', label: 'Requests Sent', icon: Clock }
  ];

  const renderConnectionActions = (connection) => {
    switch (activeTab) {
      case 'connected':
        return (
          <button
            onClick={() => handleRejectOrRemoveConnection(connection.targetUser.firebaseId)}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
          >
            <UserX className="mr-2 h-4 w-4" />
            Remove
          </button>
        );
      case 'received':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleAcceptRequest(connection.targetUser.firebaseId)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Accept
            </button>
            <button
              onClick={() => handleRejectOrRemoveConnection(connection.targetUser.firebaseId)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
            >
              <UserX className="mr-2 h-4 w-4" />
              Reject
            </button>
          </div>
        );
      case 'sent':
        return (
          <button
            onClick={() => handleRejectOrRemoveConnection(connection.targetUser.firebaseId)}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
          >
            <UserX className="mr-2 h-4 w-4" />
            Cancel
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Connections</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(({ id, label, icon: Icon }) => (
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
          ))}
        </nav>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : connections.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {connections.map((connection) => (
              <li key={connection._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-800 font-medium">
                          {connection.targetUser.displayName[0]?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-sm font-medium text-gray-900">
                        {connection.targetUser.displayName}
                      </h2>
                      <div className="flex items-center mt-1">
                        <Mail className="h-4 w-4 text-gray-400 mr-1" />
                        <p className="text-sm text-gray-500">
                          {connection.targetUser.email}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(connection.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div>
                    {renderConnectionActions(connection)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {activeTab === 'connected' && 'No connections yet'}
          {activeTab === 'received' && 'No pending requests received'}
          {activeTab === 'sent' && 'No pending requests sent'}
        </div>
      )}
    </div>
  );
};

export default ConnectionsPage;