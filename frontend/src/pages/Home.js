import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  Map, 
  Search, 
  Shield, 
  TrendingUp, 
  Users,
  Database,
  Zap,
  Eye
} from 'lucide-react';
import { cachedAPI } from '../services/api';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await cachedAPI.getSummaryStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const features = [
    {
      icon: Map,
      title: "Geospatial Intelligence",
      description: "Interactive crime mapping with heatmaps and geographic clustering analysis."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time crime statistics, trends, and predictive insights for law enforcement."
    },
    {
      icon: Search,
      title: "Smart Filtering",
      description: "Advanced search and filtering capabilities across time, location, and crime types."
    },
    {
      icon: TrendingUp,
      title: "Trend Analysis",
      description: "Identify patterns, hotspots, and emerging crime trends with machine learning."
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Enterprise-grade security with role-based access control and audit trails."
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Live data ingestion and real-time dashboard updates for immediate insights."
    }
  ];

  const quickStats = [
    {
      label: "Total Crime Records",
      value: loading ? "..." : stats?.total_crimes?.toLocaleString() || "0",
      icon: Database,
      color: "text-primary-400"
    },
    {
      label: "NYC Boroughs",
      value: loading ? "..." : stats?.borough_breakdown?.length || "5",
      icon: Map,
      color: "text-success-400"
    },
    {
      label: "Crime Categories",
      value: loading ? "..." : stats?.offense_breakdown?.length || "0",
      icon: BarChart3,
      color: "text-warning-400"
    },
    {
      label: "Recent Activity (30d)",
      value: loading ? "..." : stats?.recent_crimes_30d?.toLocaleString() || "0",
      icon: TrendingUp,
      color: "text-danger-400"
    }
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 opacity-90"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-600 rounded-full opacity-10 animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-success-600 rounded-full opacity-10 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            {/* Hero Icon */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-glow-lg">
                <Eye className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Hero Text */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              <span className="glow-text">Mini Palantir</span>
              <br />
              <span className="text-white">Gotham</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-dark-300 mb-8 max-w-3xl mx-auto">
              Advanced crime intelligence platform for real-time analytics, 
              geospatial mapping, and data-driven insights for public safety.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-glow-lg transition-all duration-300 group"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="inline-flex items-center px-8 py-4 bg-dark-800 border border-dark-600 text-dark-200 font-semibold rounded-lg hover:bg-dark-700 hover:border-primary-500 transition-all duration-300">
                <Search className="mr-2 w-5 h-5" />
                <span>Explore Data</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-dark-400">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Intelligence Features
            </h2>
            <p className="text-xl text-dark-300 max-w-3xl mx-auto">
              Built with cutting-edge technology to provide law enforcement and analysts 
              with the tools they need for effective crime prevention and investigation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="stat-card group animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary-600 rounded-lg mr-4 group-hover:shadow-glow transition-all duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-dark-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-900 to-dark-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Analyze Crime Data?
          </h2>
          <p className="text-xl text-dark-300 mb-8">
            Access comprehensive crime analytics and intelligence tools powered by real NYC data.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-900 font-semibold rounded-lg hover:bg-dark-100 transition-all duration-300 group"
            >
              <BarChart3 className="mr-2 w-5 h-5" />
              <span>Open Dashboard</span>
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Search className="w-6 h-6 text-primary-500" />
              <span className="text-lg font-semibold text-white">Mini Palantir Gotham</span>
            </div>
            <p className="text-dark-400 mb-4">
              Crime Intelligence Dashboard inspired by Palantir's Gotham platform
            </p>
            <p className="text-sm text-dark-500">
              Built with React, FastAPI, and NYC Open Data • Educational Project
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;