// pages/api/directions.js (or app/api/directions/route.js for App Router)

import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTESERVICE_API_KEY; // Use server-side environment variable
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
  }

  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start}&end=${end}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching directions:', error);
    return NextResponse.json({ error: 'Unable to fetch directions' }, { status: 500 });
  }
}