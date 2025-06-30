import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Loader,
  Navigation,
  Shield
} from 'lucide-react';
import { User, AttendanceRecord, LocationConfig } from '../types';

interface AttendanceCheckInProps {
  user: User;
}

export const AttendanceCheckIn: React.FC<AttendanceCheckInProps> = ({ user }) => {
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [notes, setNotes] = useState('');

  // Konfigurasi lokasi sekolah (contoh koordinat Jakarta)
  const schoolConfig: LocationConfig = {
    schoolLatitude: -6.2088,
    schoolLongitude: 106.8456,
    radiusMeters: 500
  };

  useEffect(() => {
    loadTodayAttendance();
  }, [user.id]);

  const loadTodayAttendance = () => {
    const attendance = localStorage.getItem('attendanceRecords');
    if (attendance) {
      const records: AttendanceRecord[] = JSON.parse(attendance);
      const today = new Date().toDateString();
      const todayRecord = records.find(r => 
        r.userId === user.id && new Date(r.date).toDateString() === today
      );
      setTodayAttendance(todayRecord || null);
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Mock reverse geocoding (dalam implementasi nyata, gunakan service seperti Google Maps API)
          const mockAddress = "Jl. Sudirman No. 123, Jakarta Pusat";
          
          setCurrentLocation({
            latitude,
            longitude,
            address: mockAddress
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback ke koordinat mock untuk demo
          setCurrentLocation({
            latitude: -6.2088 + (Math.random() - 0.5) * 0.01,
            longitude: 106.8456 + (Math.random() - 0.5) * 0.01,
            address: "Lokasi simulasi - Jakarta"
          });
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      // Fallback untuk browser yang tidak mendukung geolocation
      setCurrentLocation({
        latitude: -6.2088,
        longitude: 106.8456,
        address: "Lokasi tidak tersedia"
      });
      setLocationLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
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

  const isWithinSchoolRadius = (): boolean => {
    if (!currentLocation) return false;
    
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      schoolConfig.schoolLatitude,
      schoolConfig.schoolLongitude
    );
    
    return distance <= schoolConfig.radiusMeters;
  };

  const handleCheckIn = () => {
    if (!currentLocation) {
      alert('Harap dapatkan lokasi terlebih dahulu');
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' });
    const isLate = now.getHours() > 7 || (now.getHours() === 7 && now.getMinutes() > 15);
    
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      userId: user.id,
      date: now.toISOString(),
      checkInTime: timeString,
      location: currentLocation,
      status: isLate ? 'late' : 'present',
      notes
    };

    // Save to localStorage
    const existingRecords = localStorage.getItem('attendanceRecords');
    const records: AttendanceRecord[] = existingRecords ? JSON.parse(existingRecords) : [];
    records.push(newRecord);
    localStorage.setItem('attendanceRecords', JSON.stringify(records));

    setTodayAttendance(newRecord);
    setNotes('');
    alert('Check-in berhasil!');
  };

  const handleCheckOut = () => {
    if (!todayAttendance || !currentLocation) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' });

    const updatedRecord = {
      ...todayAttendance,
      checkOutTime: timeString
    };

    // Update localStorage
    const existingRecords = localStorage.getItem('attendanceRecords');
    const records: AttendanceRecord[] = existingRecords ? JSON.parse(existingRecords) : [];
    const recordIndex = records.findIndex(r => r.id === todayAttendance.id);
    if (recordIndex !== -1) {
      records[recordIndex] = updatedRecord;
      localStorage.setItem('attendanceRecords', JSON.stringify(records));
    }

    setTodayAttendance(updatedRecord);
    alert('Check-out berhasil!');
  };

  const currentTime = new Date().toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const currentDate = new Date().toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const withinRadius = currentLocation ? isWithinSchoolRadius() : false;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sistem Kehadiran</h1>
          <p className="text-gray-600">{currentDate}</p>
        </div>

        <div className="p-6">
          {/* Current Time Display */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-8">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-blue-900 mb-2">
                {currentTime}
              </div>
              <p className="text-blue-700">Waktu Indonesia Barat (UTC+7)</p>
            </div>
          </div>

          {/* Location Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Verifikasi Lokasi</h2>
              <button
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {locationLoading ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4 mr-2" />
                )}
                {locationLoading ? 'Mengambil Lokasi...' : 'Dapatkan Lokasi'}
              </button>
            </div>

            {currentLocation && (
              <div className={`p-4 rounded-lg border-2 ${
                withinRadius 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg ${
                    withinRadius ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {withinRadius ? (
                      <Shield className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className={`flex items-center mb-2 ${
                      withinRadius ? 'text-green-800' : 'text-red-800'
                    }`}>
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="font-medium">
                        {withinRadius ? 'Dalam Area Sekolah' : 'Di Luar Area Sekolah'}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      withinRadius ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {currentLocation.address}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Koordinat: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Attendance Status */}
          {todayAttendance && (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Kehadiran Hari Ini</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">Check-in</p>
                    <p className="text-sm text-gray-600">{todayAttendance.checkInTime}</p>
                  </div>
                </div>
                {todayAttendance.checkOutTime && (
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">Check-out</p>
                      <p className="text-sm text-gray-600">{todayAttendance.checkOutTime}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  todayAttendance.status === 'present' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {todayAttendance.status === 'present' ? 'Hadir' : 'Terlambat'}
                </span>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="mb-8">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tambahkan catatan untuk kehadiran hari ini..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!todayAttendance ? (
              <button
                onClick={handleCheckIn}
                disabled={!currentLocation || !withinRadius}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Clock className="h-5 w-5 mr-2" />
                Check-in
              </button>
            ) : !todayAttendance.checkOutTime ? (
              <button
                onClick={handleCheckOut}
                disabled={!currentLocation || !withinRadius}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Clock className="h-5 w-5 mr-2" />
                Check-out
              </button>
            ) : (
              <div className="flex-1 p-3 bg-gray-100 text-gray-600 rounded-lg text-center">
                Kehadiran hari ini sudah lengkap
              </div>
            )}
          </div>

          {(!currentLocation || !withinRadius) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Persyaratan Check-in/Check-out:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Lokasi harus terdeteksi</li>
                    <li>Berada dalam radius 500m dari sekolah</li>
                    <li>GPS device harus aktif</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};