import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { User, AttendanceRecord, ClassSchedule } from '../types';

interface DashboardProps {
  user: User;
  onNavigate: (view: 'dashboard' | 'attendance' | 'journal' | 'admin') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<ClassSchedule[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Load today's attendance
    const attendance = localStorage.getItem('attendanceRecords');
    if (attendance) {
      const records: AttendanceRecord[] = JSON.parse(attendance);
      const today = new Date().toDateString();
      const todayRecord = records.find(r => 
        r.userId === user.id && new Date(r.date).toDateString() === today
      );
      setTodayAttendance(todayRecord || null);
    }

    // Mock schedule for today
    const mockSchedule: ClassSchedule[] = [
      { id: '1', subject: 'Matematika', class: 'XII IPA 1', time: '07:00-08:30', day: 'Senin', room: 'R.12' },
      { id: '2', subject: 'Matematika', class: 'XII IPA 2', time: '08:30-10:00', day: 'Senin', room: 'R.13' },
      { id: '3', subject: 'Statistika', class: 'XII IPS 1', time: '10:15-11:45', day: 'Senin', room: 'R.15' },
    ];
    setTodaySchedule(mockSchedule);

    return () => clearInterval(timer);
  }, [user.id]);

  const timeString = currentTime.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const dateString = currentTime.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getAttendanceStatus = () => {
    if (!todayAttendance) {
      return { text: 'Belum Absen', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: AlertCircle };
    }
    
    if (todayAttendance.status === 'present') {
      return { text: 'Hadir', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle };
    }
    
    return { text: 'Terlambat', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle };
  };

  const attendanceStatus = getAttendanceStatus();
  const StatusIcon = attendanceStatus.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Selamat datang, {user.name}
            </h1>
            <p className="text-blue-100 mb-4 md:mb-0">
              {dateString}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl md:text-4xl font-mono font-bold mb-1">
              {timeString}
            </div>
            <p className="text-blue-200 text-sm">WIB (UTC+7)</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className={`${attendanceStatus.bg} p-3 rounded-lg`}>
              <StatusIcon className={`h-6 w-6 ${attendanceStatus.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Status Kehadiran</p>
              <p className={`text-lg font-bold ${attendanceStatus.color}`}>
                {attendanceStatus.text}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-purple-50 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jadwal Hari Ini</p>
              <p className="text-lg font-bold text-purple-600">{todaySchedule.length} Kelas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-green-50 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jurnal Minggu Ini</p>
              <p className="text-lg font-bold text-green-600">12 Entry</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-orange-50 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kehadiran Bulan Ini</p>
              <p className="text-lg font-bold text-orange-600">98%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Jadwal Mengajar Hari Ini
              </h2>
            </div>
            <div className="p-6">
              {todaySchedule.length > 0 ? (
                <div className="space-y-4">
                  {todaySchedule.map((schedule) => (
                    <div key={schedule.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{schedule.subject}</h3>
                          <span className="text-sm font-medium text-blue-600">{schedule.time}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          <span className="mr-4">{schedule.class}</span>
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{schedule.room}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada jadwal mengajar hari ini</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Aksi Cepat</h2>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={() => onNavigate('attendance')}
                className="w-full flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <Clock className="h-6 w-6 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="font-semibold text-blue-900">Absen Kehadiran</p>
                  <p className="text-sm text-blue-600">Check-in/Check-out harian</p>
                </div>
              </button>

              <button
                onClick={() => onNavigate('journal')}
                className="w-full flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
              >
                <BookOpen className="h-6 w-6 text-green-600 mr-3" />
                <div className="text-left">
                  <p className="font-semibold text-green-900">Jurnal Mengajar</p>
                  <p className="text-sm text-green-600">Catat aktivitas mengajar</p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Aktivitas Terbaru</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Check-in berhasil</p>
                    <p className="text-xs text-gray-500">Hari ini, 07:15 WIB</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Jurnal mengajar ditambahkan</p>
                    <p className="text-xs text-gray-500">Kemarin, 16:30 WIB</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Laporan bulanan tersedia</p>
                    <p className="text-xs text-gray-500">2 hari yang lalu</p>
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