import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Shield,
  Save,
  ArrowLeft,
  Settings,
  Navigation,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { dataService } from '../services/dataService';

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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const systemSettings = dataService.getSettings();
      setSettings(systemSettings.attendance);
    } catch (error) {
      console.error('Error loading attendance settings:', error);
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
      dataService.log('info', 'Attendance settings updated', settings);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Location Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Pengaturan Lokasi & Geofencing
              </h2>
              <p className="text-sm text-gray-600 mt-1">Konfigurasi validasi lokasi untuk check-in/check-out</p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      geofencing: { ...prev.geofencing, radius: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="5000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Radius area yang dianggap valid untuk absensi</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude Pusat Sekolah
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={settings.geofencing.latitude}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      geofencing: { ...prev.geofencing, latitude: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude Pusat Sekolah
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={settings.geofencing.longitude}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      geofencing: { ...prev.geofencing, longitude: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Navigation className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">Test Lokasi Saat Ini</span>
                </div>
                <button
                  onClick={testLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Test Lokasi
                </button>
              </div>
            </div>
          </div>

          {/* Time Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-green-600" />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Check-in setelah waktu ini dianggap terlambat</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Catatan Pengaturan Waktu:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Waktu menggunakan format 24 jam (HH:MM)</li>
                      <li>Pastikan batas terlambat berada di antara waktu mulai dan berakhir</li>
                      <li>Sistem akan otomatis menolak check-in di luar window waktu</li>
                    </ul>
                  </div>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Fitur Keamanan Aktif:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Validasi lokasi GPS real-time</li>
                      <li>Pencatatan timestamp yang akurat</li>
                      <li>Log audit untuk semua aktivitas absensi</li>
                      <li>Deteksi anomali lokasi dan waktu</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Settings */}
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
                    <span className="text-sm text-gray-600">Jarak Maksimum:</span>
                    <span className="text-sm font-medium">{settings.maxDistance} meter</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Radius Geofencing:</span>
                    <span className="text-sm font-medium">{settings.geofencing.radius} meter</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Window Check-in:</span>
                    <span className="text-sm font-medium">{settings.timeWindow.start} - {settings.timeWindow.end}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Batas Terlambat:</span>
                    <span className="text-sm font-medium">{settings.lateThreshold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Koordinat Sekolah:</span>
                    <span className="text-sm font-medium">{settings.geofencing.latitude.toFixed(6)}, {settings.geofencing.longitude.toFixed(6)}</span>
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