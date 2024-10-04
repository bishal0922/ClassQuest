/**
 * This is the Layout component for our application.
 * 
 * It serves as the main wrapper for all the pages and includes the sidebar navigation.
 * The sidebar contains links to different parts of the app like Home, My Schedule, Search Users, and Compare.
 * 
 * The component also handles user authentication state and adjusts the navigation items accordingly.
 * If a user is logged in, they will see more navigation options.
 * 
 * Additionally, the sidebar's visibility is responsive to the window size.
 * On larger screens, the sidebar is always visible, while on smaller screens, it can be toggled.
 * 
 * The "use client" directive at the top indicates that this component should be rendered on the client side.
 */
"use client"
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Home, Calendar, Search, BarChart2, LogOut,Compass } from 'lucide-react';
import { onAuthStateChanged, signOut } from '../lib/firebase/auth';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const pathname = usePathname();
    const router = useRouter();
    const sidebarRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged((authUser) => {
            setUser(authUser);
        });
    
        return () => unsubscribe();
    }, []);
    
    const navItems = user
        ? [
            { href: '/', label: 'Home', icon: Home },
            { href: '/schedule', label: 'My Schedule', icon: Calendar },
            { href: '/search', label: 'Search Users', icon: Search },
            { href: '/compare', label: 'Compare', icon: BarChart2 },
            { href: '/directions', label: 'Directions', icon: Compass },
          ]
        : [
            { href: '/', label: 'Home', icon: Home },
          ];
    
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
    
        window.addEventListener('resize', handleResize);
        handleResize();
    
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target) && window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-indigo-50">
            {/* Sidebar */}
            <aside ref={sidebarRef} className={`fixed inset-y-0 left-0 z-30 w-72 bg-indigo-600 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div className="flex items-center justify-between p-6 border-b border-indigo-500">
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
                            className={`flex items-center py-4 px-6 text-sm font-medium ${pathname === item.href ? 'bg-indigo-700' : 'hover:bg-indigo-500'}`}
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="absolute bottom-0 w-full p-6">
                    {user && (
                        <button onClick={handleSignOut} className="flex items-center justify-center w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-400 rounded-md transition-colors duration-200">
                            <LogOut className="mr-2 h-5 w-5" />
                            Logout
                        </button>
                    )}
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Main content area */}
            <div className="flex-1 md:ml-72">
                {/* Mobile header */}
                <header className="bg-white shadow-sm z-10 md:hidden">
                    <div className="px-4 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">ClassQuest</h1>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                            <span className="sr-only">Open sidebar</span>
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </header>

                {/* Main content */}
                <main className="h-full overflow-y-auto bg-indigo-50">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;