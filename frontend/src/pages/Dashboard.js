import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  Filter, 
  Search, 
  Download, 
  RefreshCw, 
  MapPin,
  TrendingUp,
  AlertTriangle,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import CrimeMap from '../components/CrimeMap';
import { crimeAPI, analyticsAPI, dataUtils } from '../services/api';

const Dashboard = () => {
  // State management
  const [crimes, setCrimes] = useState([]);
  const [filteredCrimes, setFilteredCrimes] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    borough: '',
    offense: '',
    startDate: '',
    endDate: '',
    limit: 500
  });

  // UI states
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [crimes, filters]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load multiple data sources in parallel
      const [crimeData, statsData, timelineData] = await Promise.all([
        crimeAPI.getFilteredCrimes({ limit: 500 }),
        analyticsAPI.getSummaryStats(),
        analyticsAPI.getTimelineStats(30)
      ]);

      setCrimes(crimeData.data || []);
      setSummaryStats(statsData);
      setTimelineData(timelineData.timeline || []);

    } catch (err) {
      console.error('Dashboard data loading failed:', err);
      setError('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...crimes];

    // Apply borough filter
    if (filters.borough) {
      filtered = filtered.filter(crime => 
        crime.borough?.toLowerCase().includes(filters.borough.toLowerCase())
      );
    }

    // Apply offense filter
    if (filters.offense) {
      filtered = filtered.filter(crime =>
        crime.offense_description?.toLowerCase().includes(filters.offense.toLowerCase())
      );
    }

    // Apply date filters
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(crime => {
        const crimeDate = new Date(crime.occurrence_date);
        return crimeDate >= startDate;
      });
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter(crime => {
        const crimeDate = new Date(crime.occurrence_date);
        return crimeDate <= endDate;
      });
    }

    setFilteredCrimes(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const clearFilters = () => {
    setFilters({
      borough: '',
      offense: '',
      startDate: '',
      endDate: '',
      limit: 500
    });
  };

  // Calculate statistics for filtered data
  const stats = dataUtils.calculateCrimeStats(filteredCrimes);

  // Prepare chart data
  const boroughChartData = Object.entries(stats.byBorough).map(([borough, crimes]) => ({
    borough,
    count: Array.isArray(crimes) ? crimes.length : 0
  })).sort((a, b) => b.count - a.count);

  const offenseChartData = Object.entries(stats.byOffense)
    .map(([offense, count]) => ({ offense: offense.substring(0, 20), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Colors for charts
  const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-300">Loading crime intelligence dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Dashboard Error</h2>
          <p className="text-dark-300 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Crime Intelligence Dashboard
              </h1>
              <p className="text-dark-300">
                Real-time crime analytics and insights for NYC
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button className="btn-primary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-white">Filters</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Borough
                </label>
                <select
                  value={filters.borough}
                  onChange={(e) => handleFilterChange('borough', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">All Boroughs</option>
                  <option value="MANHATTAN">Manhattan</option>
                  <option value="BROOKLYN">Brooklyn</option>
                  <option value="QUEENS">Queens</option>
                  <option value="BRONX">Bronx</option>
                  <option value="STATEN ISLAND">Staten Island</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Crime Type
                </label>
                <input
                  type="text"
                  placeholder="Search offense..."
                  value={filters.offense}
                  onChange={(e) => handleFilterChange('offense', e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={clearFilters}
                  className="btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400">Total Crimes</p>
                <p className="text-2xl font-bold text-white">
                  {stats.total.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary-500" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400">Arrest Rate</p>
                <p className="text-2xl font-bold text-white">
                  {stats.arrestRate}%
                </p>
              </div>
              <Users className="w-8 h-8 text-success-500" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400">Top Borough</p>
                <p className="text-2xl font-bold text-white">
                  {boroughChartData[0]?.borough || 'N/A'}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-warning-500" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400">Active Filters</p>
                <p className="text-2xl font-bold text-white">
                  {Object.values(filters).filter(v => v).length}
                </p>
              </div>
              <Filter className="w-8 h-8 text-danger-500" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Crime Map */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-white">Crime Map</h3>
              <p className="text-sm text-dark-400">
                Geographic distribution of crimes
              </p>
            </div>
            <div className="card-body">
              <CrimeMap 
                crimes={filteredCrimes.slice(0, 200)} // Limit for performance
                selectedBorough={filters.borough}
                height={400}
              />
            </div>
          </div>

          {/* Borough Distribution */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-white">Crimes by Borough</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={boroughChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis 
                    dataKey="borough" 
                    tick={{ fill: '#cbd5e1', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#334155', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#f1f5f9'
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Offenses */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-white">Top Crime Types</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={offenseChartData.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    label={({ offense, percent }) => 
                      `${offense}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {offenseChartData.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#334155', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#f1f5f9'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-white">Crime Timeline (30 Days)</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#cbd5e1', fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#334155', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#f1f5f9'
                    }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Recent Crime Events</h3>
            <p className="text-sm text-dark-400">
              Showing {filteredCrimes.length} of {crimes.length} crimes
            </p>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Offense</th>
                    <th>Borough</th>
                    <th>Precinct</th>
                    <th>Status</th>
                    <th>Arrest</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCrimes.slice(0, 50).map((crime, index) => (
                    <tr key={crime.id || index}>
                      <td className="text-sm">
                        {crime.occurrence_date 
                          ? new Date(crime.occurrence_date).toLocaleDateString()
                          : 'Unknown'
                        }
                      </td>
                      <td className="font-medium">
                        {crime.offense_description || 'Unknown'}
                      </td>
                      <td>{crime.borough || 'Unknown'}</td>
                      <td>{crime.precinct || 'N/A'}</td>
                      <td>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          crime.status === 'COMPLETED' ? 'bg-success-100 text-success-800' :
                          crime.status === 'OPEN' ? 'bg-warning-100 text-warning-800' :
                          'bg-dark-100 text-dark-800'
                        }`}>
                          {crime.status || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        {crime.arrest_made ? (
                          <span className="text-success-400">✓</span>
                        ) : (
                          <span className="text-dark-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;