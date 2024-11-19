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
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Calendar,
  Search,
  BarChart2,
  LogOut,
  Users,
  Compass,
  AlertTriangle,
  Map,
  GitBranchIcon,
  Mail,
} from "lucide-react";
import { useAuthContext } from "./AuthProvider";
import { Toaster, toast } from "react-hot-toast";
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { user, isGuestMode, setGuestMode, signOut, loading } =
    useAuthContext();
  const pathname = usePathname();
  const router = useRouter();
  const sidebarRef = useRef(null);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/schedule", label: "My Schedule", icon: Calendar },
    { href: "/network", label: "Friends", icon: Users },
    { href: "/compare", label: "Compare", icon: BarChart2 },
    { href: "/directions", label: "Directions", icon: Compass },
    { href: "/map", label: "Map", icon: Map, requiresAuth: true }, // Added requiresAuth flag
  ];

  const handleNavigation = (href, requiresAuth) => {
    if (requiresAuth && isGuestMode) {
      toast.error(
        <div className="flex flex-col">
          <span className="font-medium">Access Restricted</span>
          <span className="text-sm">
            Please sign in to access the map feature
          </span>
        </div>,
        {
          duration: 3000,
          position: "top-center",
          className: "bg-white",
          icon: "🔒",
          style: {
            border: "1px solid #E2E8F0",
            padding: "16px",
            color: "#1F2937",
          },
        }
      );
      router.push("/");
      setSidebarOpen(false);
      return;
    }
    router.push(href);
    setSidebarOpen(false);
  };

  useEffect(() => {
    // After initial authentication check is complete
    if (!loading) {
      setIsInitialLoad(false);

      // Redirect to home if not authenticated and not in guest mode
      const isProtectedRoute = [
        "/schedule",
        "/search",
        "/compare",
        "/directions",
        "/map",
      ].includes(pathname);
      if (isProtectedRoute && !user && !isGuestMode) {
        router.push("/");
      }
    }
  }, [loading, user, isGuestMode, pathname, router]);

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  const handleClickOutside = (event) => {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target) &&
      window.innerWidth < 768
    ) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Show loading state during initial load
  if (isInitialLoad) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const showSidebar = user || isGuestMode;

  return (
    <div className="flex h-screen overflow-hidden bg-indigo-50">
      {/* Add Toaster component */}
      <Toaster />

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {showSidebar && (
        <aside
          ref={sidebarRef}
          className={`fixed inset-y-0 left-0 w-72 bg-indigo-600 text-white flex flex-col transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition-transform duration-300 ease-in-out z-50`}
          style={{ isolation: "isolate" }}
        >
          <div className="flex items-center justify-between p-6 border-b border-indigo-500">
            <h2 className="text-2xl font-bold">ClassQuest</h2>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden">
              <X size={24} />
            </button>
          </div>
          <nav className="flex-grow mt-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href, item.requiresAuth)}
                className={`flex w-full items-center py-4 px-6 text-sm font-medium ${
                  pathname === item.href
                    ? "bg-indigo-700"
                    : "hover:bg-indigo-500"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Add GitHub and Contact icons */}
          <div className="flex justify-around p-6 border-t border-indigo-500">
            <div className="flex flex-col items-center">
              <a
                href="https://github.com/bishal0922/classquest"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitBranchIcon className="h-6 w-6 text-white hover:text-gray-300" />
              </a>
              <span className="text-xs text-white mt-1">Source</span>
            </div>
            <div className="flex flex-col items-center">
              <a href="mailto:classquestdevs@gmail.com">
                <Mail className="h-6 w-6 text-white hover:text-gray-300" />
              </a>
              <span className="text-xs text-white mt-1">Contact Team 3</span>
            </div>
          </div>

          {isGuestMode && (
            <div className="px-6 py-4 bg-indigo-700">
              <div className="flex items-center text-yellow-300 mb-2">
                <AlertTriangle className="mr-2" size={20} />
                <span className="font-semibold">Guest Mode</span>
              </div>
              <p className="text-xs text-indigo-200">
                Your data won't be saved. Sign up for full access!
              </p>
            </div>
          )}
          <div className="p-6">
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-400 rounded-md transition-colors duration-200"
            >
              <LogOut className="mr-2 h-5 w-5" />
              {isGuestMode ? "Exit Guest Mode" : "Logout"}
            </button>
          </div>
        </aside>
      )}

      {/* Main content area */}
      <div
        className={`flex-1 flex flex-col ${
          showSidebar ? "md:ml-72" : ""
        } relative`}
      >
        {showSidebar && (
          <header className="bg-white shadow-sm md:hidden relative z-40">
            <div className="px-4 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                ClassQuest
              </h1>
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </header>
        )}

        {isGuestMode && (
          <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-3 text-yellow-800 md:hidden relative z-30">
            <div className="flex items-center">
              <AlertTriangle className="mr-2" size={20} />
              <span className="font-semibold">Guest Mode</span>
            </div>
            <p className="text-sm mt-1">
              Your data won't be saved. Sign up for full access!
            </p>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-indigo-50 relative">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
