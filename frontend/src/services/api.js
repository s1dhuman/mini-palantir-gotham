/**
 * API Service for Mini Palantir Gotham
 * Handles all communication with the FastAPI backend
 */

import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and auth
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    
    // Handle different error types
    if (error.response?.status === 404) {
      throw new Error('Resource not found');
    } else if (error.response?.status === 500) {
      throw new Error('Server error - please try again later');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please check your connection');
    } else if (!error.response) {
      throw new Error('Network error - please check your connection');
    }
    
    throw error;
  }
);

/**
 * Health and System API calls
 */
export const healthAPI = {
  // Check if API is running
  checkHealth: async () => {
    const response = await api.get('/');
    return response.data;
  },

  // Get detailed health status
  getHealthStatus: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

/**
 * Crime Data API calls
 */
export const crimeAPI = {
  // Get crimes with optional filters
  getCrimes: async (params = {}) => {
    const response = await api.get('/crimes', { params });
    return response.data;
  },

  // Get specific crime by ID
  getCrimeById: async (id) => {
    const response = await api.get(`/crimes/${id}`);
    return response.data;
  },

  // Get crimes with advanced filtering
  getFilteredCrimes: async ({
    skip = 0,
    limit = 100,
    borough = null,
    offense = null,
    startDate = null,
    endDate = null,
    boundingBox = null
  } = {}) => {
    const params = {
      skip,
      limit,
      ...(borough && { borough }),
      ...(offense && { offense }),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
      ...(boundingBox && {
        lat_min: boundingBox.latMin,
        lat_max: boundingBox.latMax,
        lng_min: boundingBox.lngMin,
        lng_max: boundingBox.lngMax,
      }),
    };

    const response = await api.get('/crimes', { params });
    return response.data;
  },
};

/**
 * Analytics and Statistics API calls
 */
export const analyticsAPI = {
  // Get overall crime summary statistics
  getSummaryStats: async () => {
    const response = await api.get('/stats/summary');
    return response.data;
  },

  // Get borough-specific statistics
  getBoroughStats: async () => {
    const response = await api.get('/stats/boroughs');
    return response.data;
  },

  // Get crime timeline data
  getTimelineStats: async (days = 30) => {
    const response = await api.get('/stats/timeline', {
      params: { days }
    });
    return response.data;
  },
};

/**
 * Geographic Data API calls
 */
export const geoAPI = {
  // Get heatmap data for mapping
  getHeatmapData: async (borough = null) => {
    const params = {};
    if (borough) params.borough = borough;
    
    const response = await api.get('/geo/heatmap', { params });
    return response.data;
  },
};

/**
 * Utility functions for data processing
 */
export const dataUtils = {
  // Format date for API calls
  formatDate: (date) => {
    if (!date) return null;
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  },

  // Process crime data for charts
  processCrimeDataForCharts: (crimes) => {
    if (!crimes || !Array.isArray(crimes)) return [];
    
    return crimes.map(crime => ({
      ...crime,
      date: new Date(crime.occurrence_date),
      formattedDate: new Date(crime.occurrence_date).toLocaleDateString(),
    }));
  },

  // Group crimes by borough
  groupCrimesByBorough: (crimes) => {
    if (!crimes || !Array.isArray(crimes)) return {};
    
    return crimes.reduce((acc, crime) => {
      const borough = crime.borough || 'Unknown';
      if (!acc[borough]) acc[borough] = [];
      acc[borough].push(crime);
      return acc;
    }, {});
  },

  // Group crimes by offense type
  groupCrimesByOffense: (crimes) => {
    if (!crimes || !Array.isArray(crimes)) return {};
    
    return crimes.reduce((acc, crime) => {
      const offense = crime.offense_description || 'Unknown';
      if (!acc[offense]) acc[offense] = 0;
      acc[offense]++;
      return acc;
    }, {});
  },

  // Calculate crime statistics
  calculateCrimeStats: (crimes) => {
    if (!crimes || !Array.isArray(crimes)) {
      return {
        total: 0,
        byBorough: {},
        byOffense: {},
        arrestRate: 0,
      };
    }

    const arrestCount = crimes.filter(crime => crime.arrest_made).length;
    const arrestRate = crimes.length > 0 ? (arrestCount / crimes.length) * 100 : 0;

    return {
      total: crimes.length,
      byBorough: dataUtils.groupCrimesByBorough(crimes),
      byOffense: dataUtils.groupCrimesByOffense(crimes),
      arrestRate: Math.round(arrestRate * 10) / 10, // Round to 1 decimal
      arrestCount,
    };
  },
};

/**
 * Cache management for API responses
 */
class APICache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes TTL
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new APICache();

/**
 * Cached API calls (for frequently accessed data)
 */
export const cachedAPI = {
  getSummaryStats: async () => {
    const cacheKey = 'summary_stats';
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached summary stats');
      return cached;
    }

    const data = await analyticsAPI.getSummaryStats();
    apiCache.set(cacheKey, data);
    return data;
  },

  getBoroughStats: async () => {
    const cacheKey = 'borough_stats';
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached borough stats');
      return cached;
    }

    const data = await analyticsAPI.getBoroughStats();
    apiCache.set(cacheKey, data);
    return data;
  },
};

// Export the configured axios instance for custom requests
export default api;