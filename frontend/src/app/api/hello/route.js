// This file is located at src/app/api/hello/route.js
// To render this on localhost:3000/hello, follow these steps:

// 1. Ensure your Next.js application is running. You can start the development server by running `npm run dev` on classquest/frontend
// 2. Open your web browser and navigate to http://localhost:3000/hello.
// 3. You should see the text "Hello, World!" displayed on the page.

import { NextResponse } from "next/server";

export function GET(request) {
    return new NextResponse('Hello, World!', {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
