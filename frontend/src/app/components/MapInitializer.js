// src/app/components/MapInitializer.js
"use client";
import { useEffect } from 'react';

const MapInitializer = () => {
  useEffect(() => {
    const loadMapResources = async () => {
      // Load Leaflet CSS
      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
      leafletCSS.crossOrigin = 'anonymous';
      document.head.appendChild(leafletCSS);

      // Load Leaflet Routing Machine CSS
      const routingCSS = document.createElement('link');
      routingCSS.rel = 'stylesheet';
      routingCSS.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
      routingCSS.crossOrigin = 'anonymous';
      document.head.appendChild(routingCSS);

      // Load Leaflet JS
      const leafletScript = document.createElement('script');
      leafletScript.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
      leafletScript.crossOrigin = 'anonymous';
      document.body.appendChild(leafletScript);

      // Load Leaflet Routing Machine JS after Leaflet is loaded
      leafletScript.onload = () => {
        const routingScript = document.createElement('script');
        routingScript.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js';
        routingScript.crossOrigin = 'anonymous';
        document.body.appendChild(routingScript);
      };
    };

    loadMapResources();
  }, []);

  return null;
};

export default MapInitializer;