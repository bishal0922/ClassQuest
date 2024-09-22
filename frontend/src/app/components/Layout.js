"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Calendar, Search, BarChart2, LogOut } from 'lucide-react';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/schedule', label: 'My Schedule', icon: Calendar },
        { href: '/search', label: 'Search Users', icon: Search },
        { href: '/compare', label: 'Compare', icon: BarChart2 },
    ];

    const getPageTitle = () => {
        const currentItem = navItems.find((item) => item.href === pathname);
        return currentItem ? currentItem.label : 'ScheduleSync';
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-20 w-64 bg-indigo-700 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div className="flex items-center justify-between p-4 border-b border-indigo-600">
                    <h2 className="text-2xl font-bold">ClassQuest</h2>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden">
                        <X size={24} />
                    </button>
                </div>
                <nav className="mt-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center py-3 px-4 text-sm font-medium ${pathname === item.href ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="absolute bottom-0 w-full p-4">
                    <button className="flex items-center justify-center w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors duration-200">
                        <LogOut className="mr-2 h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col md:ml-64">
                {/* Header */}
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h1>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
                        >
                            <span className="sr-only">Open sidebar</span>
                            <Menu className="h-6 w-6" />
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