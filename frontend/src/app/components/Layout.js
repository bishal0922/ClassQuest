"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);  // Sidebar toggle state
    const pathname = usePathname();
  
    const navItems = [
      { href: '/', label: 'Home' },
      { href: '/schedule', label: 'My Schedule' },
      { href: '/search', label: 'Search Users' },
      { href: '/compare', label: 'Compare' },
    ];
  
    // Dynamic title based on the current route
    const getPageTitle = () => {
      const currentItem = navItems.find((item) => item.href === pathname);
      return currentItem ? currentItem.label : 'ScheduleSync';
    };
  
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-20 w-64 bg-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <div className="p-4">
            <h2 className="text-2xl font-semibold text-gray-800">ScheduleSync</h2>
          </div>
          <nav className="mt-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 px-4 text-gray-700 hover:bg-gray-200 ${pathname === item.href ? 'bg-gray-200' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
  
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden md:pl-64">
          {/* Header */}
          <header className="bg-white shadow-sm z-10">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              {/* Dynamic Page Title */}
              {/* Sidebar toggle button (Visible only on smaller screens) */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
              >
                <span className="sr-only">Toggle sidebar</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </header>
  
          {/* Main content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  };

export default Layout;
