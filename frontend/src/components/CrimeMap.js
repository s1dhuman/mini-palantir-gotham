import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Calendar, Shield, User } from 'lucide-react';
import { geoAPI } from '../services/api';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom crime marker icons
const createCrimeIcon = (crimeType) => {
  const colorMap = {
    'ASSAULT': '#ef4444',
    'BURGLARY': '#f97316',
    'ROBBERY': '#dc2626',
    'LARCENY': '#eab308',
    'DRUG': '#8b5cf6',
    'VANDALISM': '#06b6d4',
    'DEFAULT': '#6366f1'
  };

  const color = Object.keys(colorMap).find(key => 
    crimeType?.toUpperCase().includes(key)
  ) ? colorMap[Object.keys(colorMap).find(key => 
    crimeType?.toUpperCase().includes(key)
  )] : colorMap.DEFAULT;

  return L.divIcon({
    className: 'custom-crime-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

// Component to handle map view updates
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  
  return null;
};

const CrimeMap = ({ 
  crimes = [], 
  selectedBorough = null, 
  height = 400,
  showHeatmap = false,
  onMarkerClick = null 
}) => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([40.7831, -73.9712]); // NYC center
  const [mapZoom, setMapZoom] = useState(11);

  // Borough centers for navigation
  const boroughCenters = {
    'MANHATTAN': [40.7831, -73.9712],
    'BROOKLYN': [40.6782, -73.9442],
    'QUEENS': [40.7282, -73.7949],
    'BRONX': [40.8448, -73.8648],
    'STATEN ISLAND': [40.5795, -74.1502]
  };

  // Update map center when borough changes
  useEffect(() => {
    if (selectedBorough && boroughCenters[selectedBorough]) {
      setMapCenter(boroughCenters[selectedBorough]);
      setMapZoom(12);
    } else {
      setMapCenter([40.7831, -73.9712]);
      setMapZoom(11);
    }
  }, [selectedBorough]);

  // Load heatmap data
  useEffect(() => {
    if (showHeatmap) {
      const loadHeatmapData = async () => {
        setLoading(true);
        try {
          const data = await geoAPI.getHeatmapData(selectedBorough);
          setHeatmapData(data.heatmap_points || []);
        } catch (error) {
          console.error('Failed to load heatmap data:', error);
        } finally {
          setLoading(false);
        }
      };

      loadHeatmapData();
    }
  }, [showHeatmap, selectedBorough]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  // Create popup content for crime markers
  const createPopupContent = (crime) => (
    <div className="max-w-xs">
      <div className="flex items-center space-x-2 mb-2">
        <Shield className="w-4 h-4 text-primary-500" />
        <h3 className="font-semibold text-dark-800">
          {crime.offense_description || 'Unknown Offense'}
        </h3>
      </div>
      
      <div className="space-y-1 text-sm text-dark-600">
        <div className="flex items-center space-x-2">
          <MapPin className="w-3 h-3" />
          <span>{crime.borough || 'Unknown'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(crime.occurrence_date)}</span>
        </div>
        
        {crime.address && (
          <div className="text-xs text-dark-500 mt-1">
            {crime.address}
          </div>
        )}
        
        {crime.arrest_made && (
          <div className="inline-block bg-success-100 text-success-800 text-xs px-2 py-1 rounded mt-2">
            Arrest Made
          </div>
        )}
      </div>
      
      {onMarkerClick && (
        <button
          onClick={() => onMarkerClick(crime)}
          className="mt-2 text-xs text-primary-600 hover:text-primary-800"
        >
          View Details →
        </button>
      )}
    </div>
  );

  // Filter crimes that have valid coordinates
  const validCrimes = crimes.filter(crime => 
    crime.latitude && 
    crime.longitude && 
    !isNaN(crime.latitude) && 
    !isNaN(crime.longitude) &&
    crime.latitude >= 40.4 && crime.latitude <= 41.0 && // NYC bounds
    crime.longitude >= -74.3 && crime.longitude <= -73.7
  );

  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-4 right-4 z-10 bg-dark-800 text-white px-3 py-1 rounded-md text-sm">
          Loading map data...
        </div>
      )}

      <div className="map-container" style={{ height: `${height}px` }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          attributionControl={true}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          
          {/* Dark theme tile layer */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />

          {/* Crime markers */}
          {validCrimes.map((crime, index) => (
            <Marker
              key={crime.id || index}
              position={[crime.latitude, crime.longitude]}
              icon={createCrimeIcon(crime.offense_description)}
            >
              <Popup maxWidth={300}>
                {createPopupContent(crime)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-danger-500 rounded-full border border-white"></div>
          <span className="text-dark-300">Violent Crimes</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-warning-500 rounded-full border border-white"></div>
          <span className="text-dark-300">Property Crimes</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary-500 rounded-full border border-white"></div>
          <span className="text-dark-300">Other Offenses</span>
        </div>
        <div className="text-dark-400">
          Showing {validCrimes.length} crimes
        </div>
      </div>
    </div>
  );
};

export default CrimeMap;