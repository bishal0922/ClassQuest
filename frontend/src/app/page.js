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
import { Sun, Wind, Droplets, Calendar, LogIn, UserPlus, MapPin, User } from 'lucide-react';

const Home = () => {
  const { user, loading, setGuestMode } = useAuthContext();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState('');
  const [weather, setWeather] = useState(null);

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

  if (loading) {
    return <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }

  const handleGuestMode = () => {
    setGuestMode(true);
    router.push('/schedule');
  };

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
        <div className="bg-indigo-600 text-white p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to ClassQuest</h1>
          <p className="text-indigo-100 text-lg">Effortlessly sync schedules with your UTA friends and colleagues.</p>
        </div>
        <div className="p-6 md:p-8">
          {user ? (
            <>
              <p className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
                Hello, {user.displayName || user.email}!
              </p>
              <p className="text-md md:text-lg text-gray-600 mb-4 flex items-center">
                <MapPin className="mr-2 text-indigo-500" size={18} />
                Arlington, TX | {currentTime}
              </p>
              {weather && (
                <div className="bg-indigo-50 rounded-lg p-4 md:p-6 mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-indigo-700 mb-3">Current Weather</h2>
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Sun className="text-yellow-500 mr-2" size={24} />
                      <div>
                        <p className="font-medium">{(weather.temperature_2m * 9/5 + 32).toFixed(1)}°F</p>
                        <p className="text-xs md:text-sm text-gray-500">Temperature</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Wind className="text-blue-500 mr-2" size={24} />
                      <div>
                        <p className="font-medium">{weather.wind_speed_10m} km/h</p>
                        <p className="text-xs md:text-sm text-gray-500">Wind Speed</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Droplets className="text-blue-300 mr-2" size={24} />
                      <div>
                        <p className="font-medium">{weather.relative_humidity_2m}%</p>
                        <p className="text-xs md:text-sm text-gray-500">Humidity</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <button 
                onClick={() => router.push('/schedule')}
                className="w-full flex items-center justify-center px-4 py-2 md:py-3 border border-transparent text-sm md:text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <Calendar className="mr-2" size={20} />
                View My Schedule
              </button>
            </>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;