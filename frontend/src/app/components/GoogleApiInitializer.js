// src/app/components/GoogleApiInitializer.js
"use client";
import { useEffect } from 'react';
import Script from 'next/script';
import { initializeGoogleApi } from '../lib/googleCalendar';

const GoogleApiInitializer = () => {
  return (
    <>
      <Script 
        src="https://apis.google.com/js/api.js"
        strategy="afterInteractive"
        onLoad={() => {
          initializeGoogleApi().catch(console.error);
        }}
      />
    </>
  );
};

export default GoogleApiInitializer;