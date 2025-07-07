import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Clock,
  Shield,
  Save,
  ArrowLeft,
  Settings,
  Navigation,
  AlertCircle,
  CheckCircle,
  Target,
  Crosshair,
  Map,
  Locate
} from 'lucide-react';
import { dataService } from '../services/dataService';

// Import Leaflet
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AttendanceSettingsProps {
  onBack: () => void;
}

export const AttendanceSettings: React.FC<AttendanceSettingsProps> = ({ onBack }) => {
  const [settings, setSettings] = useState({
    maxDistance: 500,
    timeWindow: { start: '06:30', end: '07:30' },
    lateThreshold: '07:15',
    preventMultipleCheckin: true,
    geofencing: {
      latitude: -6.2088,
      longitude: 106.8456,
      radius: 500
    }
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);

  // Map refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      initializeMap();
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMapMarker();
    }
  }, [settings.geofencing]);

  const loadSettings = () => {
    try {
      const systemSettings = dataService.getSettings();
      setSettings(systemSettings.attendance);
    } catch (error) {
      console.error('Error loading attendance settings:', error);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    setMapLoading(true);
    
    try {
      // Initialize map
      const map = L.map(mapRef.current, {
        center: [settings.geofencing.latitude, settings.geofencing.longitude],
        zoom: 16,
        zoomControl: true,
        attributionControl: true
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Add custom controls
      const customControl = L.Control.extend({
        options: {
          position: 'topright'
        },
        onAdd: function() {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
          container.style.backgroundColor = 'white';
          container.style.padding = '5px';
          container.style.cursor = 'pointer';
          container.innerHTML = '<div style="font-size: 12px; color: #333;">Klik pada peta untuk<br/>menentukan lokasi sekolah</div>';
          return container;
        }
      });

      map.addControl(new customControl());

      // Add click event to map
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        updateLocation(lat, lng);
        reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
      updateMapMarker();
      setMapLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapLoading(false);
    }
  };

  const updateMapMarker = () => {
    if (!mapInstanceRef.current) return;

    const { latitude, longitude, radius } = settings.geofencing;

    // Remove existing marker and circle
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }
    if (circleRef.current) {
      mapInstanceRef.current.removeLayer(circleRef.current);
    }

    // Create custom school icon
    const schoolIcon = L.divIcon({
      html: `
        <div style="
          background: #3B82F6;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
        ">
          🏫
        </div>
      `,
      className: 'custom-school-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // Add new marker
    const marker = L.marker([latitude, longitude], { 
      icon: schoolIcon,
      draggable: true 
    }).addTo(mapInstanceRef.current);

    // Add drag event to marker
    marker.on('dragend', (e: any) => {
      const { lat, lng } = e.target.getLatLng();
      updateLocation(lat, lng);
      reverseGeocode(lat, lng);
    });

    // Add radius circle
    const circle = L.circle([latitude, longitude], {
      radius: radius,
      fillColor: '#3B82F6',
      fillOpacity: 0.1,
      color: '#3B82F6',
      weight: 2,
      opacity: 0.8
    }).addTo(mapInstanceRef.current);

    markerRef.current = marker;
    circleRef.current = circle;

    // Update map view
    mapInstanceRef.current.setView([latitude, longitude], 16);
  };

  const updateLocation = (lat: number, lng: number) => {
    setSettings(prev => ({
      ...prev,
      geofencing: {
        ...prev.geofencing,
        latitude: lat,
        longitude: lng
      }
    }));
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.display_name) {
        // You could show this address in a tooltip or info panel
        console.log('Address:', data.display_name);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=id&addressdetails=1`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    updateLocation(lat, lng);
    setLocationSearch(result.display_name);
    setSearchResults([]);
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16);
    }
  };

  const getCurrentLocation = () => {
    setCurrentLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateLocation(latitude, longitude);
          reverseGeocode(latitude, longitude);
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 16);
          }
          setCurrentLocationLoading(false);
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Tidak dapat mengakses lokasi saat ini. Pastikan GPS aktif dan izin lokasi diberikan.');
          setCurrentLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      alert('Geolocation tidak didukung oleh browser ini');
      setCurrentLocationLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const systemSettings = dataService.getSettings();
      systemSettings.attendance = settings;
      dataService.saveSettings(systemSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      dataService.log('info', 'Attendance settings updated with map coordinates', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Terjadi kesalahan saat menyimpan pengaturan!');
    } finally {
      setLoading(false);
    }
  };

  const testLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const distance = calculateDistance(
            latitude,
            longitude,
            settings.geofencing.latitude,
            settings.geofencing.longitude
          );
          
          alert(`Lokasi Anda: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\nJarak dari sekolah: ${distance.toFixed(0)} meter\nStatus: ${distance <= settings.geofencing.radius ? 'Dalam radius' : 'Di luar radius'}`);
        },
        (error) => {
          alert('Tidak dapat mengakses lokasi: ' + error.message);
        }
      );
    } else {
      alert('Geolocation tidak didukung oleh browser ini');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Kembali ke Dashboard
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Pengaturan Kehadiran</h1>
                <p className="text-sm text-gray-600">Konfigurasi sistem absensi dan validasi lokasi</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {saved && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Tersimpan</span>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Interactive Map Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Map className="h-5 w-5 mr-2 text-blue-600" />
                Peta Interaktif Lokasi Sekolah
              </h2>
              <p className="text-sm text-gray-600 mt-1">Tentukan lokasi pusat sekolah dengan mengklik pada peta atau mencari alamat</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Location Search */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cari Lokasi Sekolah
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={locationSearch}
                      onChange={(e) => {
                        setLocationSearch(e.target.value);
                        searchLocation(e.target.value);
                      }}
                      placeholder="Masukkan nama sekolah atau alamat..."
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => selectSearchResult(result)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900 text-sm">{result.display_name}</div>
                          <div className="text-xs text-gray-500">
                            {result.lat}, {result.lon}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <button
                    onClick={getCurrentLocation}
                    disabled={currentLocationLoading}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {currentLocationLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Locate className="h-4 w-4 mr-2" />
                    )}
                    Lokasi Saat Ini
                  </button>
                  
                  <button
                    onClick={testLocation}
                    className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Test Lokasi
                  </button>
                </div>
              </div>

              {/* Map Container */}
              <div className="relative">
                <div 
                  ref={mapRef} 
                  className="w-full h-96 rounded-lg border border-gray-300 relative overflow-hidden"
                  style={{ minHeight: '400px' }}
                >
                  {mapLoading && (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Memuat peta...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Map Instructions */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Cara Menggunakan Peta:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Klik pada peta untuk menentukan lokasi pusat sekolah</li>
                        <li>Seret marker (🏫) untuk menyesuaikan posisi</li>
                        <li>Gunakan pencarian untuk menemukan lokasi dengan cepat</li>
                        <li>Area biru menunjukkan radius geofencing</li>
                        <li>Zoom in/out untuk melihat detail lokasi</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Coordinates Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <p className="text-lg font-mono text-gray-900">{settings.geofencing.latitude.toFixed(6)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <p className="text-lg font-mono text-gray-900">{settings.geofencing.longitude.toFixed(6)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Radius</label>
                  <p className="text-lg font-semibold text-blue-600">{settings.geofencing.radius} meter</p>
                </div>
              </div>
            </div>
          </div>

          {/* Distance & Radius Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Crosshair className="h-5 w-5 mr-2 text-green-600" />
                Pengaturan Radius & Validasi
              </h2>
              <p className="text-sm text-gray-600 mt-1">Konfigurasi jarak maksimum dan radius geofencing</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jarak Maksimum Check-in (meter)
                  </label>
                  <input
                    type="number"
                    value={settings.maxDistance}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      maxDistance: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="0"
                    max="5000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Jarak maksimum yang diizinkan dari titik pusat sekolah</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Radius Geofencing (meter)
                  </label>
                  <input
                    type="number"
                    value={settings.geofencing.radius}
                    onChange={(e) => {
                      const newRadius = parseInt(e.target.value) || 0;
                      setSettings(prev => ({
                        ...prev,
                        geofencing: { ...prev.geofencing, radius: newRadius }
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="0"
                    max="5000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Radius area yang dianggap valid untuk absensi</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Informasi Radius:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Radius saat ini: <strong>{settings.geofencing.radius} meter</strong></li>
                      <li>Area coverage: <strong>{((Math.PI * Math.pow(settings.geofencing.radius, 2)) / 10000).toFixed(2)} hektar</strong></li>
                      <li>Perubahan radius akan langsung terlihat di peta</li>
                      <li>Disarankan radius 200-1000 meter untuk area sekolah</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Time Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                Pengaturan Waktu Kehadiran
              </h2>
              <p className="text-sm text-gray-600 mt-1">Konfigurasi jam operasional dan batas waktu absensi</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Mulai Check-in
                  </label>
                  <input
                    type="time"
                    value={settings.timeWindow.start}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      timeWindow: { ...prev.timeWindow, start: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Waktu paling awal untuk check-in</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Berakhir Check-in
                  </label>
                  <input
                    type="time"
                    value={settings.timeWindow.end}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      timeWindow: { ...prev.timeWindow, end: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Waktu paling akhir untuk check-in</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batas Waktu Terlambat
                  </label>
                  <input
                    type="time"
                    value={settings.lateThreshold}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      lateThreshold: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Check-in setelah waktu ini dianggap terlambat</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-purple-600" />
                Pengaturan Keamanan
              </h2>
              <p className="text-sm text-gray-600 mt-1">Konfigurasi validasi dan pembatasan sistem absensi</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Cegah Multiple Check-in</h3>
                  <p className="text-sm text-gray-600">Mencegah guru melakukan check-in lebih dari sekali dalam satu hari</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.preventMultipleCheckin}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      preventMultipleCheckin: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
                  <div className="text-sm text-purple-800">
                    <p className="font-medium mb-1">Fitur Keamanan Aktif:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Validasi lokasi GPS real-time dengan peta interaktif</li>
                      <li>Pencatatan timestamp yang akurat</li>
                      <li>Log audit untuk semua aktivitas absensi</li>
                      <li>Deteksi anomali lokasi dan waktu</li>
                      <li>Visualisasi radius geofencing pada peta</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-600" />
                Ringkasan Pengaturan
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Lokasi Pusat Sekolah:</span>
                    <span className="text-sm font-medium">{settings.geofencing.latitude.toFixed(6)}, {settings.geofencing.longitude.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Radius Geofencing:</span>
                    <span className="text-sm font-medium">{settings.geofencing.radius} meter</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Jarak Maksimum:</span>
                    <span className="text-sm font-medium">{settings.maxDistance} meter</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Window Check-in:</span>
                    <span className="text-sm font-medium">{settings.timeWindow.start} - {settings.timeWindow.end}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Batas Terlambat:</span>
                    <span className="text-sm font-medium">{settings.lateThreshold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Multiple Check-in:</span>
                    <span className="text-sm font-medium">{settings.preventMultipleCheckin ? 'Dicegah' : 'Diizinkan'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};