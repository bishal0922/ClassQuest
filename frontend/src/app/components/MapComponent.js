"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ... (previous code for createUserIcon, users, and buildings remains the same)
  const createUserIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const users = [
  { 
    id: 1, 
    name: 'Palmer', 
    icon: createUserIcon('blue'),
    schedule: [
      { start: 9 * 60, end: 10 * 60, building: 'Engineering Research Building', class: 'CSE 1310 - Introduction to Computers & Programming' },
      { start: 11 * 60, end: 12 * 30, building: 'Nedderman Hall', class: 'MATH 1426 - Calculus I' },
      { start: 14 * 60, end: 15 * 30, building: 'Science Hall', class: 'PHYS 1443 - General Technical Physics I' },
      { start: 16 * 60, end: 17 * 30, building: 'Business Building', class: 'ECON 2305 - Principles of Macroeconomics' },
      { start: 18 * 60, end: 19 * 60, building: 'University Center', class: 'ENGL 1301 - Rhetoric and Composition I' }
    ]
  },
  { 
    id: 2, 
    name: 'Sancho', 
    icon: createUserIcon('red'),
    schedule: [
      { start: 9 * 60 + 30, end: 11 * 60, building: 'Fine Arts Building', class: 'ART 1301 - Art Appreciation' },
      { start: 12 * 60, end: 13 * 30, building: 'University Center', class: 'POLS 2311 - Government of the United States' },
      { start: 15 * 60, end: 16 * 30, building: 'Nedderman Hall', class: 'CSE 1325 - Object-Oriented Programming' },
      { start: 17 * 60, end: 18 * 30, building: 'Science Hall', class: 'CHEM 1441 - General Chemistry I' },
      { start: 19 * 60 + 30, end: 21 * 60, building: 'Engineering Research Building', class: 'MAE 1351 - Introduction to Engineering Design' }
    ]
  },
];

const buildings = {
  'University Center': { lat: 32.7299, lng: -97.1135 },
  'Engineering Research Building': { lat: 32.7333, lng: -97.1147 },
  'Nedderman Hall': { lat: 32.7324, lng: -97.1134 },
  'Science Hall': { lat: 32.7305, lng: -97.1123 },
  'Fine Arts Building': { lat: 32.7289, lng: -97.1156 },
  'Business Building': { lat: 32.7282, lng: -97.1108 },
};

const MapComponent = () => {
  const [currentTime, setCurrentTime] = useState(8 * 60);
  const [userLocations, setUserLocations] = useState([]);
  const [commonFreeTime, setCommonFreeTime] = useState(null);
  const [meetingLocation, setMeetingLocation] = useState(null);

  // ... (previous useEffect for userLocations remains the same)

  useEffect(() => {
        const locations = users.map(user => {
          const currentClass = user.schedule.find(
            cls => currentTime >= cls.start && currentTime < cls.end
          );
          if (currentClass) {
            const building = buildings[currentClass.building];
            return { 
              userId: user.id, 
              name: user.name, 
              lat: building.lat, 
              lng: building.lng,
              icon: user.icon,
              class: currentClass.class,
              building: currentClass.building,
              timeStart: formatTime(currentClass.start),
              timeEnd: formatTime(currentClass.end)
            };
          }
          return { 
            userId: user.id, 
            name: user.name, 
            lat: null, 
            lng: null,
            icon: user.icon,
            class: 'Not in class',
            building: 'Unknown'
          };
        });
        setUserLocations(locations);
      }, [currentTime]);

  const handleTimeChange = (e) => {
    const newTime = Math.round(parseInt(e.target.value) / 30) * 30;
    setCurrentTime(newTime);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const findNextFreeTime = (user) => {
    const currentClassIndex = user.schedule.findIndex(
      cls => currentTime >= cls.start && currentTime < cls.end
    );
    
    if (currentClassIndex === -1) {
      const nextClass = user.schedule.find(cls => cls.start > currentTime);
      return nextClass ? formatTime(nextClass.start) : 'No more classes today';
    }
    
    const nextClass = user.schedule[currentClassIndex + 1];
    return nextClass ? formatTime(nextClass.start) : 'No more classes today';
  };

  // ... (findCommonFreeTime and handleFindMeetingTime functions remain the same)
  const findCommonFreeTime = () => {
        const [user1, user2] = users;
        let commonStart = currentTime;
        
        while (commonStart < 22 * 60) {
          const user1Busy = user1.schedule.some(cls => commonStart >= cls.start && commonStart < cls.end);
          const user2Busy = user2.schedule.some(cls => commonStart >= cls.start && commonStart < cls.end);
          
          if (!user1Busy && !user2Busy) {
            const nextClassStart = Math.min(
              ...users.flatMap(user => user.schedule
                .filter(cls => cls.start > commonStart)
                .map(cls => cls.start)
              )
            );
            
            return {
              start: formatTime(commonStart),
              end: formatTime(nextClassStart)
            };
          }
          
          commonStart += 30; // Check every 30 minutes
        }
        
        return null;
      };
    
      const handleFindMeetingTime = () => {
        const freeTime = findCommonFreeTime();
        setCommonFreeTime(freeTime);
        
        if (freeTime) {
          // For simplicity, let's choose the University Center as the meeting point
          setMeetingLocation('University Center');
        } else {
          setMeetingLocation(null);
        }
      };
     

  // Custom component to set initial map view
  const SetViewOnLoad = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(coords, 16);
    }, [map]);
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="h-[500px] w-full relative bg-indigo-50 rounded-lg shadow-md overflow-hidden">
        <MapContainer center={[32.7299, -97.1135]} zoom={15} className="h-full w-full">
          <SetViewOnLoad coords={[32.7299, -97.1135]} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {userLocations.map((user) => (
            user.lat && user.lng ? (
              <Marker 
                key={user.userId} 
                position={[user.lat, user.lng]} 
                icon={user.icon}
              >
                <Tooltip permanent direction="top" offset={[0, -20]}>
                  {user.name}
                </Tooltip>
                <Popup>
                  <div className="font-bold">{user.name}</div>
                  <div>{user.class}</div>
                  <div>{user.building}</div>
                  <div>{user.timeStart} - {user.timeEnd}</div>
                </Popup>
              </Marker>
            ) : null
          ))}
        </MapContainer>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min={8 * 60}
            max={22 * 60}
            step={30}
            value={currentTime}
            onChange={handleTimeChange}
            className="flex-grow"
          />
          <span className="font-bold text-lg min-w-[70px] text-right">{formatTime(currentTime)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          {[8, 10, 12, 14, 16, 18, 20, 22].map(hour => (
            <span key={hour}>{hour.toString().padStart(2, '0')}:00</span>
          ))}
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-2">Student Status</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {userLocations.map(user => (
            <div 
              key={user.userId} 
              className="p-3 rounded-lg bg-gray-100"
            >
              <div className="font-bold">{user.name}</div>
              <div>{user.class}</div>
              <div>{user.building}</div>
              <div>Next free time: {findNextFreeTime(users.find(u => u.id === user.userId))}</div>
            </div>
          ))}
        </div>
        <button 
          onClick={handleFindMeetingTime}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Find Common Free Time
        </button>
        {commonFreeTime && (
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <h3 className="font-bold">Common Free Time:</h3>
            <p>{commonFreeTime.start} - {commonFreeTime.end}</p>
            <p>Suggested meeting location: {meetingLocation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;