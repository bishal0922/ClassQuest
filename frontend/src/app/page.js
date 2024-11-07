/**
 * This file is responsible for rendering the home page of our application.
 * 
 * The home page displays a welcome message, the current time, and weather information.
 * 
 * The useAuthContext hook is used to get the current user's authentication status.
 * 
 * The useEffect hook is used to set up a timer to update the current time every minute
 * and to fetch the current weather information when the component mounts.
 * 
 * The component returns a JSX structure that includes a loading spinner if the authentication
 * status is still being determined, and the main content of the home page otherwise.
 */
"use client"

import React, { useEffect, useState } from 'react';
import { useAuthContext } from './components/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  Sun, Wind, Droplets, Calendar, LogIn, UserPlus, 
  MapPin, User, Clock, BookOpen, Users, Bell,
  CalendarClock, ChevronRight, AlertTriangle
} from 'lucide-react';
import { getUserSchedule } from './lib/userModel';

const DashboardCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
    {children}
  </div>
);

const UpcomingEvent = ({ event, isNext }) => (
  <div className={`p-3 rounded-lg ${isNext ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-gray-50'}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${isNext ? 'bg-indigo-100' : 'bg-gray-100'}`}>
          <BookOpen className={`h-5 w-5 ${isNext ? 'text-indigo-600' : 'text-gray-600'}`} />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{event.className}</h3>
          <p className="text-sm text-gray-500">{event.location}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-medium ${isNext ? 'text-indigo-600' : 'text-gray-600'}`}>{event.startTime}</p>
        <p className="text-sm text-gray-500">{event.dayOfWeek}</p>
      </div>
    </div>
  </div>
);

const MockDataIndicator = ({ children }) => (
  <div className="group relative">
    {children}
    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
      Demo data
    </div>
  </div>
);

const QuickStat = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center space-x-3">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const Home = () => {
  const { user, loading, setGuestMode } = useAuthContext();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState('');
  const [weather, setWeather] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    }, 60000);

    setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));

    const fetchWeather = async () => {
      try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=32.7357&longitude=-97.1081&current=temperature_2m,wind_speed_10m,relative_humidity_2m&hourly=temperature_2m,wind_speed_10m,relative_humidity_2m');
        const data = await response.json();
        setWeather(data.current);
      } catch (error) {
        console.error('Error fetching weather:', error);
        setWeather(null);
      }
    };

    fetchWeather();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (user) {
        try {
          const userSchedule = await getUserSchedule(user.uid);
          setSchedule(userSchedule);
          
          // Process upcoming events
          const events = [];
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const today = new Date();
          const currentDay = days[today.getDay()];
          const currentTime = today.getHours() * 60 + today.getMinutes();

          // Add today's remaining events
          if (userSchedule[currentDay]) {
            userSchedule[currentDay].forEach(event => {
              const [hours, minutes] = event.startTime.split(':')[0].split(' ')[0].split(':');
              const period = event.startTime.split(' ')[1];
              let eventTime = parseInt(hours) * 60 + parseInt(minutes);
              if (period === 'PM' && hours !== '12') eventTime += 12 * 60;
              if (period === 'AM' && hours === '12') eventTime -= 12 * 60;
              
              if (eventTime > currentTime) {
                events.push({
                  ...event,
                  dayOfWeek: currentDay,
                  timeInMinutes: eventTime
                });
              }
            });
          }

          // Add next days' events
          let nextDay = today.getDay() + 1;
          while (events.length < 5 && nextDay < 7) {
            const nextDayName = days[nextDay];
            if (userSchedule[nextDayName]) {
              userSchedule[nextDayName].forEach(event => {
                events.push({
                  ...event,
                  dayOfWeek: nextDayName,
                  timeInMinutes: -1 // Sort after today's events
                });
              });
            }
            nextDay++;
          }

          // Sort events
          events.sort((a, b) => a.timeInMinutes - b.timeInMinutes);
          setUpcomingEvents(events.slice(0, 5));
        } catch (error) {
          console.error('Error fetching schedule:', error);
        }
      }
    };

    fetchSchedule();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleGuestMode = () => {
    setGuestMode(true);
    router.push('/schedule');
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
          <div className="bg-indigo-600 text-white p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to ClassQuest</h1>
            <p className="text-indigo-100 text-lg">Effortlessly sync schedules with your UTA friends and colleagues.</p>
          </div>
          <div className="p-6 md:p-8">
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button 
                  onClick={() => router.push('/login')}
                  className="flex-1 flex items-center justify-center px-4 py-2 md:py-3 border border-transparent text-sm md:text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <LogIn className="mr-2" size={20} />
                  Login
                </button>
                <button 
                  onClick={() => router.push('/signup')}
                  className="flex-1 flex items-center justify-center px-4 py-2 md:py-3 border border-indigo-600 text-sm md:text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <UserPlus className="mr-2" size={20} />
                  Sign up
                </button>
              </div>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              <button 
                onClick={handleGuestMode}
                className="w-full flex items-center justify-center px-4 py-2 md:py-3 border border-gray-300 text-sm md:text-base font-medium rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                <User className="mr-2" size={20} />
                Explore as Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.displayName || user.email.split('@')[0]}!
          </h1>
          <p className="text-gray-500 flex items-center mt-1">
            <MapPin className="mr-1 h-4 w-4" />
            Arlington, TX | {currentTime}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push('/schedule')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Calendar className="mr-2 h-4 w-4" />
            View Schedule
          </button>
          <button
            onClick={() => router.push('/network')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Users className="mr-2 h-4 w-4" />
            Find Friends
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickStat
  icon={BookOpen}
  label="Classes Today"
  value={schedule?.[Object.keys(schedule)[new Date().getDay() - 1]]?.length || 0}
  color="bg-indigo-500"
/>
<QuickStat
  icon={CalendarClock}
  label="Upcoming Events"
  value={upcomingEvents.length}
  color="bg-emerald-500"
/>
<MockDataIndicator>
  <QuickStat
    icon={Users}
    label="Connections"
    value="5"
    color="bg-violet-500"
  />
</MockDataIndicator>
          </div>

          {/* Upcoming Schedule */}
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Schedule</h2>
              <button 
                onClick={() => router.push('/schedule')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <UpcomingEvent 
                    key={`${event.dayOfWeek}-${event.startTime}-${event.className}`}
                    event={event}
                    isNext={index === 0}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No upcoming events</p>
                </div>
              )}
            </div>
          </DashboardCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Weather Card */}
          {weather && (
            <DashboardCard>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Weather</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Sun className="text-yellow-500 h-8 w-8 mr-3" />
                    <div>
                      <p className="text-2xl font-semibold">{(weather.temperature_2m * 9/5 + 32).toFixed(1)}°F</p>
                      <p className="text-sm text-gray-500">Temperature</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Wind className="text-blue-500 h-6 w-6 mr-2" />
                      <div>
                        <p className="font-medium">{weather.wind_speed_10m} km/h</p>
                        <p className="text-xs text-gray-500">Wind Speed</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center">
                    <Droplets className="text-blue-500 h-6 w-6 mr-2" />
                      <div>
                        <p className="font-medium">{weather.relative_humidity_2m}%</p>
                        <p className="text-xs text-gray-500">Humidity</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DashboardCard>
          )}

          {/* Quick Actions */}
          <DashboardCard>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/directions')}
                className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span className="ml-3 font-medium">Get Directions</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              
              {/* <button
                onClick={() => router.push('/directions')}
                className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="ml-3 font-medium">Campus Map</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button> */}


              {/* <button
                onClick={() => router.push('/compare')}
                className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <Users className="h-5 w-5 text-violet-600" />
                  </div>
                  <span className="ml-3 font-medium">Compare Schedules</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button> */}
            </div>
          </DashboardCard>

          {/* Calendar Integration Status */}
          <DashboardCard>
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold text-gray-900">Calendar Status</h2>
    <MockDataIndicator>
      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
    </MockDataIndicator>
  </div>
  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
    <div className="flex items-center">
      <div className="p-2 bg-white rounded-lg">
        <Calendar className="h-5 w-5 text-green-600" />
      </div>
      <MockDataIndicator>
        <div className="ml-3">
          <p className="font-medium text-green-900">Google Calendar</p>
          <p className="text-sm text-green-700">Last synced: 2 hours ago</p>
        </div>
      </MockDataIndicator>
    </div>
    <button
      onClick={() => router.push('/schedule')}
      className="text-sm font-medium text-green-700 hover:text-green-800"
    >
      Sync Now
    </button>
  </div>
</DashboardCard>

          {/* Notifications */}
          <DashboardCard>
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
    <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
      View All
    </button>
  </div>
  <MockDataIndicator>
    <div className="space-y-3">
      <div className="flex items-start p-3 rounded-lg hover:bg-gray-50">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Bell className="h-4 w-4 text-blue-600" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">New connection request</p>
          <p className="text-sm text-gray-500">John Smith wants to connect</p>
          <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
        </div>
      </div>
      <div className="flex items-start p-3 rounded-lg hover:bg-gray-50">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">Schedule Update</p>
          <p className="text-sm text-gray-500">CSE 1325 location changed</p>
          <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
        </div>
      </div>
    </div>
  </MockDataIndicator>
</DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default Home;