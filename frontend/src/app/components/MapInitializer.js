// src/app/components/MapInitializer.js
"use client";
import { useEffect } from 'react';

const MapInitializer = () => {
  useEffect(() => {
    const loadMapResources = async () => {
      try {
        // Load Leaflet CSS
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        leafletCSS.crossOrigin = '';
        document.head.appendChild(leafletCSS);

        // Wait for CSS to load
        await new Promise(resolve => {
          leafletCSS.onload = resolve;
        });

        // Clean up any existing Leaflet instances
        const containers = document.querySelectorAll('.leaflet-container');
        containers.forEach(container => {
          if (container._leaflet_id) {
            container._leaflet_id = null;
          }
        });

        // Trigger resize event to ensure proper map rendering
        window.dispatchEvent(new Event('resize'));
      } catch (error) {
        console.error('Error loading map resources:', error);
      }
    };

    loadMapResources();

    return () => {
      // Cleanup
      const leafletCSS = document.querySelector('link[href*="leaflet.css"]');
      if (leafletCSS) {
        leafletCSS.remove();
      }
    };
  }, []);

  return null;
};

export default MapInitializer;