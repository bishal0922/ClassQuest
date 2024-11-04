// src/app/components/Directions.js
"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Copy, Share2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Dynamic imports
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

const campusLocations = {
  "University Center": { lat: 32.731897244210096, lng: -97.11099924904617 },
  "Engineering Research Building": { lat: 32.73333702123698, lng: -97.1131164068711 },
  "Nedderman Hall": { lat: 32.7337022755903, lng: -97.11320930029531 },
  "Science Hall": { lat: 32.73069739397386, lng: -97.11408697583421 },
  "Fine Arts Building": { lat: 32.73115901946225, lng: -97.11505612711379 },
  "Business Building": { lat: 32.72973107711824, lng: -97.11059611788998 },
  "Pickard Hall": { lat: 32.72883603501483, lng: -97.11150948387406 },
  "Trimble Hall": { lat: 32.72968750021006, lng: -97.1118692700786 },
  "Central Library": { lat: 32.72970189356928, lng: -97.11289479815662 },
  "School of Social Work & Smart Hospital": { lat: 32.72757544279192, lng: -97.11161184398559 },
  "Science and Engineering Innovation and Research Building": { lat: 32.728097017859994, lng: -97.11295741128033 },
  "Life Science Building": { lat: 32.728814833798204, lng: -97.11262716039163 },
  "Chemistry and Physics Building": { lat: 32.73044779599053, lng: -97.11158711348065 },
  "College Hall": { lat: 32.73083589291949, lng: -97.11152920983065 },
  "Ransom Hall": { lat: 32.73086276937136, lng: -97.11218334034128 },
  "Carlisle Hall": { lat: 32.73070120816642, lng: -97.11256379892923 },
  "Preston Hall": { lat: 32.730898109204986, lng: -97.11291103173684 },
  "Woolf Hall": { lat: 32.731516147192394, lng: -97.11264540501935 },
  "Engineering Lab Building": { lat: 32.732370933591596, lng: -97.11268774362576 },
  "GeoScience Building": { lat: 32.73159862153079, lng: -97.11388575761299 },
  "University Hall": { lat: 32.72906000641466, lng: -97.11398422045163 },
  "Texas Hall": { lat: 32.729718769054436, lng: -97.11554118233005 },
  "College of Architecture Planning and Public Affairs": { lat: 32.731359108616104, lng: -97.11615933618393 },
  "Nanotech Building": { lat: 32.73244492955757, lng: -97.1155722647836 },
  "Maverick Activities Center": { lat: 32.73193506383788, lng: -97.1173917746016 },
  "Physical Education Building": { lat: 32.73093693862163, lng: -97.11767824475697 },
  "The Commons": { lat: 32.73281523014235, lng: -97.1170317234299 },
  "College Park Center": { lat: 32.7306690798948, lng: -97.10804432529538 },
  "UTA Bookstore": { lat: 32.73340801478887, lng: -97.10945663456641 }
};

const Directions = () => {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [directions, setDirections] = useState([]);
  const [route, setRoute] = useState([]);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMapReady(true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        const containers = document.querySelectorAll('.leaflet-container');
        containers.forEach(container => {
          if (container._leaflet_id) {
            container._leaflet_id = null;
          }
        });
      }
    };
  }, []);

  useEffect(() => {
    if (startPoint && endPoint) {
      fetchDirections();
    }
  }, [startPoint, endPoint]);

  const handleLocationSelect = (location, isStart) => {
    const coords = campusLocations[location];
    if (isStart) {
      setStartPoint({ ...coords, name: location });
    } else {
      setEndPoint({ ...coords, name: location });
    }
  };

  const fetchDirections = async () => {
    try {
      const response = await fetch(
        `/api/directions?start=${startPoint.lng},${startPoint.lat}&end=${endPoint.lng},${endPoint.lat}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const routeCoordinates = data.features[0].geometry.coordinates.map(
          (coord) => [coord[1], coord[0]]
        );
        setRoute(routeCoordinates);

        const steps = data.features[0].properties.segments[0].steps;
        const formattedDirections = steps.map((step) => step.instruction);
        setDirections([
          `Start at ${startPoint.name}`,
          ...formattedDirections,
          `Arrive at ${endPoint.name}`,
        ]);
      } else {
        setError("No route found. Please try different locations.");
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
      setError("Unable to fetch directions. Please try again later.");
      setDirections([]);
      setRoute([]);
    }
  };

  const copyDirections = () => {
    const directionsText = directions.join("\n");
    navigator.clipboard
      .writeText(directionsText)
      .then(() => alert("Directions copied to clipboard!"))
      .catch((err) => console.error("Failed to copy directions: ", err));
  };

  const shareDirections = () => {
    if (navigator.share) {
      const shareText = `Directions from ${startPoint.name} to ${
        endPoint.name
      } at UTA Campus:\n\n${directions.join("\n")}`;

      navigator
        .share({
          title: "UTA Campus Directions",
          text: shareText,
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.log("Error sharing:", error));
    } else {
      alert(
        "Sharing is not supported on this device. You can copy the directions instead."
      );
      copyDirections();
    }
  };

  if (error) {
    return <div className="text-red-500 font-bold">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">UTA Campus Directions</h1>
      <div className="flex flex-col md:flex-row mb-4 space-y-4 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/2">
          <label className="block mb-2">Start Point:</label>
          <select
            className="w-full p-2 border rounded"
            onChange={(e) => handleLocationSelect(e.target.value, true)}
          >
            <option value="">Select start point</option>
            {Object.keys(campusLocations).map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-1/2">
          <label className="block mb-2">End Point:</label>
          <select
            className="w-full p-2 border rounded"
            onChange={(e) => handleLocationSelect(e.target.value, false)}
          >
            <option value="">Select end point</option>
            {Object.keys(campusLocations).map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>

      {mapReady && (
        <div className="h-[500px] relative overflow-hidden rounded-lg shadow-lg mb-4">
          <MapContainer
            center={[32.7299, -97.1135]}
            zoom={16}
            className="h-full w-full"
            whenReady={() => {
              window.dispatchEvent(new Event('resize'));
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {startPoint && (
              <Marker position={[startPoint.lat, startPoint.lng]}>
                <Popup>Start: {startPoint.name}</Popup>
              </Marker>
            )}
            {endPoint && (
              <Marker position={[endPoint.lat, endPoint.lng]}>
                <Popup>End: {endPoint.name}</Popup>
              </Marker>
            )}
            {route.length > 0 && <Polyline positions={route} color="blue" />}
          </MapContainer>
        </div>
      )}

      {directions.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h2 className="text-xl font-bold mb-2 md:mb-0">Directions:</h2>
            <div className="flex space-x-2">
              <button
                onClick={copyDirections}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors inline-flex items-center"
              >
                <Copy className="mr-2" size={18} /> Copy
              </button>
              <button
                onClick={shareDirections}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors inline-flex items-center"
              >
                <Share2 className="mr-2" size={18} /> Share
              </button>
            </div>
          </div>
          <ol className="list-decimal list-inside">
            {directions.map((step, index) => (
              <li key={index} className="mb-2">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default Directions;