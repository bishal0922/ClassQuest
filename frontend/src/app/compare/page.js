// src/app/compare/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../components/AuthProvider';
import { Users, ChevronRight, Calendar, Search, Clock, AlertTriangle, Users2, MapPin, Sun, Moon, Cloud } from 'lucide-react';
import RestrictedFeatureModal from '../components/RestrictedFeatureModal';

// Utility Components
const TimeOverview = ({ schedule, colorScheme }) => {
  const totalClasses = Object.values(schedule || {}).flat().length;
  const averageClassesPerDay = totalClasses / 5;

  const getTimeDistribution = () => {
    const distribution = { morning: 0, afternoon: 0, evening: 0 };
    
    Object.values(schedule || {}).flat().forEach(event => {
      const hour = parseInt(event.startTime.split(':')[0]);
      const period = event.startTime.split(' ')[1];
      const time = period === 'PM' && hour !== 12 ? hour + 12 : hour;
      
      if (time < 12) distribution.morning++;
      else if (time < 17) distribution.afternoon++;
      else distribution.evening++;
    });

    return distribution;
  };

  const timeDistribution = getTimeDistribution();

  return (
    <div className={`rounded-lg p-4 ${colorScheme} bg-opacity-10`}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium mb-1">Classes per Week</div>
          <div className="text-2xl font-bold">{totalClasses}</div>
          <div className="text-sm text-gray-500">
            ~{averageClassesPerDay.toFixed(1)} per day
          </div>
        </div>
        <div>
          <div className="text-sm font-medium mb-2">Time Distribution</div>
          <div className="space-y-1">
            <div className="flex items-center text-xs">
              <Sun className="w-4 h-4 mr-1" />
              <div className="flex-1">Morning</div>
              <div>{timeDistribution.morning}</div>
            </div>
            <div className="flex items-center text-xs">
              <Cloud className="w-4 h-4 mr-1" />
              <div className="flex-1">Afternoon</div>
              <div>{timeDistribution.afternoon}</div>
            </div>
            <div className="flex items-center text-xs">
              <Moon className="w-4 h-4 mr-1" />
              <div className="flex-1">Evening</div>
              <div>{timeDistribution.evening}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DayColumn = ({ day, schedule, colorScheme }) => {
  const [clickedEvent, setClickedEvent] = useState(null);

  const getEventHeight = (startTime, endTime) => {
    const timeToMinutes = (timeStr) => {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes;
      if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
      if (period === 'AM' && hours === 12) totalMinutes = minutes;
      return totalMinutes;
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    return ((endMinutes - startMinutes) / (14 * 60)) * 100;
  };

  const getEventPosition = (startTime) => {
    const [timeValue, period] = startTime.split(' ');
    const [hours, minutes] = timeValue.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
    if (period === 'AM' && hours === 12) totalMinutes = minutes;
    
    const startOfDay = 8 * 60;
    const dayLength = 14 * 60;
    
    return ((totalMinutes - startOfDay) / dayLength) * 100;
  };

  return (
    <div className="flex-1">
      <div className="text-sm font-medium text-gray-900 mb-2">{day}</div>
      <div className="relative h-64 bg-gray-50 rounded-lg overflow-hidden">
        {schedule?.map((event, index) => {
          const height = getEventHeight(event.startTime, event.endTime);
          const top = getEventPosition(event.startTime);
          const isSmallEvent = height < 15;

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: `${Math.max(0, Math.min(100, top))}%`,
                left: '4px',
                right: '4px',
                height: `${Math.max(4, Math.min(100 - top, height))}%`,
                zIndex: clickedEvent === index ? 30 : 10
              }}
            >
              <div
                onClick={() => setClickedEvent(clickedEvent === index ? null : index)}
                className={`${colorScheme} rounded-md p-2 h-full cursor-pointer relative`}
              >
                {isSmallEvent ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
                  </div>
                ) : (
                  <div>
                    <div className="text-xs font-medium text-white truncate">
                      {event.className}
                    </div>
                    {height >= 25 && (
                      <>
                        <div className="text-xs text-white/90 truncate">
                          {event.location}
                        </div>
                        <div className="text-xs text-white/90 truncate">
                          {event.startTime} - {event.endTime}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Simple popup when clicked */}
                {clickedEvent === index && (
                  <div className="absolute left-0 right-0 -bottom-12 bg-gray-900 text-white p-2 rounded shadow-lg z-40 text-xs">
                    {event.className}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// Schedule Comparison View
const CompareSchedulesView = ({ mySchedule, friendSchedule, friendName, onBack }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const checkTimeOverlap = (class1, class2) => {
    const getMinutes = (timeStr) => {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes;
      if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
      if (period === 'AM' && hours === 12) totalMinutes = minutes;
      return totalMinutes;
    };

    const start1 = getMinutes(class1.startTime);
    const end1 = getMinutes(class1.endTime);
    const start2 = getMinutes(class2.startTime);
    const end2 = getMinutes(class2.endTime);

    return (start1 < end2 && end1 > start2);
  };

  const findOverlaps = () => {
    let overlaps = [];
    days.forEach(day => {
      const myClasses = mySchedule[day] || [];
      const friendClasses = friendSchedule[day] || [];
      
      myClasses.forEach(myClass => {
        friendClasses.forEach(friendClass => {
          if (checkTimeOverlap(myClass, friendClass)) {
            overlaps.push({
              day,
              myClass,
              friendClass
            });
          }
        });
      });
    });
    return overlaps;
  };

  const overlaps = findOverlaps();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Schedule Comparison</h2>
        <button
          onClick={onBack}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
        >
          Back to Friends
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Your Schedule */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <h3 className="text-lg font-semibold">Your Schedule</h3>
          </div>
          <TimeOverview 
            schedule={mySchedule} 
            colorScheme="text-indigo-600 bg-indigo-50"
          />
          <div className="grid grid-cols-5 gap-4 mt-4">
            {days.map(day => (
              <DayColumn
                key={day}
                day={day}
                schedule={mySchedule[day]}
                colorScheme="bg-indigo-500 hover:bg-indigo-600"
              />
            ))}
          </div>
        </div>

        {/* Friend's Schedule */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <h3 className="text-lg font-semibold">{friendName}'s Schedule</h3>
          </div>
          <TimeOverview 
            schedule={friendSchedule} 
            colorScheme="text-emerald-600 bg-emerald-50"
          />
          <div className="grid grid-cols-5 gap-4 mt-4">
            {days.map(day => (
              <DayColumn
                key={day}
                day={day}
                schedule={friendSchedule[day]}
                colorScheme="bg-emerald-500 hover:bg-emerald-600"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Analysis */}
      {overlaps.length > 0 && (
        <div className="bg-red-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-3">
            Schedule Conflicts ({overlaps.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overlaps.map((overlap, index) => (
              <div key={index} className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-sm font-medium text-red-800">
                  {overlap.day}
                </div>
                <div className="text-sm text-red-600">
                  {overlap.myClass.className} overlaps with {overlap.friendClass.className}
                </div>
                <div className="text-xs text-red-500">
                  {overlap.myClass.startTime} - {overlap.myClass.endTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
const ComparePage = () => {
  const [connections, setConnections] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [mySchedule, setMySchedule] = useState(null);
  const [friendSchedule, setFriendSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isGuestMode } = useAuthContext();

  useEffect(() => {
    if (user && !isGuestMode) {
      fetchConnections();
      fetchMySchedule();
    }
  }, [user]);

  const fetchConnections = async () => {
    try {
      const response = await fetch(`/api/connections?userId=${user.uid}&type=connected`);
      if (!response.ok) throw new Error('Failed to fetch connections');
      const data = await response.json();
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMySchedule = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getUserSchedule',
          data: { firebaseId: user.uid }
        })
      });
      const data = await response.json();
      setMySchedule(data.schedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const fetchFriendSchedule = async (friendId) => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getUserSchedule',
          data: { firebaseId: friendId }
        })
      });
      const data = await response.json();
      setFriendSchedule(data.schedule);
    } catch (error) {
      console.error('Error fetching friend schedule:', error);
    }
  };

  const handleFriendSelect = async (friend) => {
    setSelectedFriend(friend);
    await fetchFriendSchedule(friend.targetUser.firebaseId);
  };

  if (isGuestMode) {
    return <RestrictedFeatureModal isOpen={true} onClose={() => {}} featureName="Schedule Comparison" />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (selectedFriend && friendSchedule) {
    return (
      <CompareSchedulesView
        mySchedule={mySchedule}
        friendSchedule={friendSchedule}
        friendName={selectedFriend.targetUser.displayName}
        onBack={() => setSelectedFriend(null)}
      />
    );
  }

  const filteredConnections = connections.filter(conn => 
    conn.targetUser.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.targetUser.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Inside ComparePage component, after all the logic and state declarations

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {isGuestMode ? (
        <RestrictedFeatureModal isOpen={true} onClose={() => {}} featureName="Schedule Comparison" />
      ) : isLoading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : selectedFriend && friendSchedule ? (
        <CompareSchedulesView
          mySchedule={mySchedule}
          friendSchedule={friendSchedule}
          friendName={selectedFriend.targetUser.displayName}
          onBack={() => setSelectedFriend(null)}
        />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Compare Schedules</h1>
            <div className="text-sm text-gray-500">
              {connections.length} {connections.length === 1 ? 'friend' : 'friends'} available
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search friends by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {connections.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No Connections Yet</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Connect with other students to compare schedules and find common free time.
                </p>
              </div>
            ) : filteredConnections.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No Results Found</h3>
                <p className="text-sm text-gray-500">
                  No friends match your search for "{searchQuery}"
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredConnections.map((connection) => (
                  <li key={connection._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center min-w-0">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-800 font-medium">
                              {connection.targetUser.displayName[0]?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {connection.targetUser.displayName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {connection.targetUser.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleFriendSelect(connection)}
                        className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Compare Schedule
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );

}

  export default ComparePage;