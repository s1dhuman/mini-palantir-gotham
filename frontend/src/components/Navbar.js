import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Activity, Map, BarChart3, Menu, X } from 'lucide-react';
import { healthAPI } from '../services/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState('unknown');
  const location = useLocation();

  // Check API health status
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await healthAPI.checkHealth();
        setApiStatus('connected');
      } catch (error) {
        setApiStatus('disconnected');
      }
    };

    checkHealth();
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: Activity },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  ];

  const isActive = (path) => location.pathname === path;

  const StatusIndicator = () => (
    <div className="flex items-center space-x-2">
      <div
        className={`w-2 h-2 rounded-full ${
          apiStatus === 'connected' 
            ? 'bg-success-500 animate-pulse' 
            : apiStatus === 'disconnected'
            ? 'bg-danger-500'
            : 'bg-warning-500'
        }`}
      />
      <span className="text-xs text-dark-400">
        {apiStatus === 'connected' ? 'Connected' : 
         apiStatus === 'disconnected' ? 'Offline' : 'Checking...'}
      </span>
    </div>
  );

  return (
    <nav className="bg-dark-800 border-b border-dark-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg group-hover:shadow-glow transition-all duration-200">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold glow-text">
                  Mini Palantir Gotham
                </h1>
                <p className="text-xs text-dark-400 -mt-1">
                  Crime Intelligence Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-600 text-white shadow-glow'
                      : 'text-dark-300 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Status and Mobile menu button */}
          <div className="flex items-center space-x-4">
            <StatusIndicator />
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-dark-400 hover:text-white hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-dark-700">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-dark-800">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-300 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;