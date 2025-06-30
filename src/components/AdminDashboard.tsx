import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Search,
  MapPin,
  BarChart3,
  Settings,
  ArrowLeft,
  Activity,
  Shield,
  Database,
  Zap,
  Target,
  Award,
  Bell,
  RefreshCw,
  BookOpen,
  School,
  UserCheck
} from 'lucide-react';
import { AttendanceRecord, TeachingLog, User, SystemMetrics } from '../types';
import { AttendanceSettings } from './AttendanceSettings';
import { ClassManagement } from './ClassManagement';
import { ScheduleConfiguration } from './ScheduleConfiguration';
import { SchoolProfile } from './SchoolProfile';
import { UserManagement } from './UserManagement';
import { AcademicSettings } from './AcademicSettings';
import { dataService } from '../services/dataService';

export const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'attendance-settings' | 'class-management' | 'schedule-config' | 'school-profile' | 'user-management' | 'academic-settings'>('dashboard');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [teachingLogs, setTeachingLogs] = useState<TeachingLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'late' | 'absent'>('all');
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadSystemMetrics();
    loadAlerts();
    
    // Set up real-time data updates
    const handleDataUpdate = () => {
      loadData();
      loadSystemMetrics();
    };
    
    dataService.subscribe('attendanceUpdated', handleDataUpdate);
    dataService.subscribe('usersUpdated', handleDataUpdate);
    dataService.subscribe('teachingLogsUpdated', handleDataUpdate);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (currentView === 'dashboard') {
        loadData();
        loadSystemMetrics();
      }
    }, 30000);
    
    return () => {
      dataService.unsubscribe('attendanceUpdated', handleDataUpdate);
      dataService.unsubscribe('usersUpdated', handleDataUpdate);
      dataService.unsubscribe('teachingLogsUpdated', handleDataUpdate);
      clearInterval(interval);
    };
  }, [currentView]);

  const loadData = () => {
    try {
      const attendance = dataService.getAttendanceRecords();
      const logs = dataService.getTeachingLogs();
      const userData = dataService.getUsers();
      
      setAttendanceRecords(attendance);
      setTeachingLogs(logs);
      setUsers(userData);
    } catch (error) {
      console.error('Error loading data:', error);
      dataService.log('error', 'Failed to load dashboard data', { error: error.message });
    }
  };

  const loadSystemMetrics = () => {
    try {
      const health = dataService.getSystemHealth();
      const attendanceStats = dataService.getAttendanceStats({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      });
      
      setSystemMetrics({
        ...health,
        attendanceStats,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading system metrics:', error);
    }
  };

  const loadAlerts = () => {
    // Generate system alerts based on current data
    const newAlerts = [];
    
    // Check attendance rate
    const todayAttendance = getAttendanceStats();
    if (todayAttendance.attendanceRate < 80) {
      newAlerts.push({
        id: 'low-attendance',
        type: 'warning',
        title: 'Tingkat Kehadiran Rendah',
        message: `Kehadiran hari ini hanya ${todayAttendance.attendanceRate.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check system health
    if (systemMetrics?.status === 'warning') {
      newAlerts.push({
        id: 'system-warning',
        type: 'warning',
        title: 'Peringatan Sistem',
        message: 'Sistem memerlukan perhatian',
        timestamp: new Date().toISOString()
      });
    }
    
    setAlerts(newAlerts);
  };

  const getAttendanceStats = () => {
    const teachers = users.filter(u => u.role === 'teacher');
    const today = new Date().toDateString();
    const todayRecords = attendanceRecords.filter(record => 
      new Date(record.date).toDateString() === today
    );

    const totalTeachers = teachers.length;
    const presentCount = todayRecords.filter(record => record.status === 'present').length;
    const lateCount = todayRecords.filter(record => record.status === 'late').length;
    const absentCount = totalTeachers - todayRecords.length;

    return {
      total: totalTeachers,
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      attendanceRate: totalTeachers > 0 ? ((presentCount + lateCount) / totalTeachers * 100) : 0,
      punctualityRate: totalTeachers > 0 ? (presentCount / totalTeachers * 100) : 0
    };
  };

  const getFilteredRecords = () => {
    let filtered = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date).toDateString();
      const selectedDateStr = new Date(selectedDate).toDateString();
      return recordDate === selectedDateStr;
    });

    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(record => {
        const teacher = users.find(t => t.id === record.userId);
        return teacher?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               teacher?.nip.includes(searchTerm);
      });
    }

    return filtered;
  };

  const exportToCSV = () => {
    try {
      setLoading(true);
      const csvData = dataService.exportData('attendance', 'csv', {
        start: selectedDate,
        end: selectedDate
      });
      
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-report-${selectedDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      dataService.log('info', 'Attendance data exported', { date: selectedDate, format: 'csv' });
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Terjadi kesalahan saat mengekspor data!');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    loadData();
    loadSystemMetrics();
    loadAlerts();
    setTimeout(() => setLoading(false), 1000);
  };

  const getTeachingStats = () => {
    const today = new Date().toDateString();
    const todayLogs = teachingLogs.filter(log => 
      new Date(log.date).toDateString() === today
    );
    
    const totalSessions = todayLogs.length;
    const totalStudents = todayLogs.reduce((acc, log) => acc + log.totalStudents, 0);
    const totalAttendance = todayLogs.reduce((acc, log) => acc + log.attendance, 0);
    
    return {
      sessions: totalSessions,
      averageClassSize: totalSessions > 0 ? totalStudents / totalSessions : 0,
      studentAttendanceRate: totalStudents > 0 ? (totalAttendance / totalStudents * 100) : 0
    };
  };

  const getDepartmentStats = () => {
    const teachers = users.filter(u => u.role === 'teacher');
    const departments: { [key: string]: { count: number; attendance: number } } = {};
    
    teachers.forEach(teacher => {
      if (!departments[teacher.department]) {
        departments[teacher.department] = { count: 0, attendance: 0 };
      }
      departments[teacher.department].count++;
      
      const teacherAttendance = attendanceRecords.filter(r => 
        r.userId === teacher.id && 
        new Date(r.date).toDateString() === new Date().toDateString()
      );
      
      if (teacherAttendance.length > 0) {
        departments[teacher.department].attendance++;
      }
    });
    
    return Object.entries(departments).map(([name, data]) => ({
      name,
      teachers: data.count,
      present: data.attendance,
      rate: data.count > 0 ? (data.attendance / data.count * 100) : 0
    }));
  };

  // Render different views based on currentView
  if (currentView === 'attendance-settings') {
    return <AttendanceSettings onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'class-management') {
    return <ClassManagement onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'schedule-config') {
    return <ScheduleConfiguration onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'school-profile') {
    return <SchoolProfile onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'user-management') {
    return <UserManagement onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'academic-settings') {
    return <AcademicSettings onBack={() => setCurrentView('dashboard')} />;
  }

  const stats = getAttendanceStats();
  const teachingStats = getTeachingStats();
  const departmentStats = getDepartmentStats();
  const filteredRecords = getFilteredRecords();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
          <p className="text-sm text-gray-600">Sistem Manajemen Kehadiran</p>
        </div>
        
        <nav className="mt-6">
          <div className="px-3">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              Dashboard
            </button>
            
            <button
              onClick={() => setCurrentView('attendance-settings')}
              className={`w-full flex items-center px-3 py-2 mt-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'attendance-settings'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <UserCheck className="h-5 w-5 mr-3" />
              Pengaturan Kehadiran
            </button>
            
            <button
              onClick={() => setCurrentView('class-management')}
              className={`w-full flex items-center px-3 py-2 mt-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'class-management'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="h-5 w-5 mr-3" />
              Manajemen Kelas
            </button>
            
            <button
              onClick={() => setCurrentView('schedule-config')}
              className={`w-full flex items-center px-3 py-2 mt-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'schedule-config'
                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-5 w-5 mr-3" />
              Konfigurasi Jadwal
            </button>
            
            <button
              onClick={() => setCurrentView('school-profile')}
              className={`w-full flex items-center px-3 py-2 mt-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'school-profile'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <School className="h-5 w-5 mr-3" />
              Profil Sekolah
            </button>
            
            <button
              onClick={() => setCurrentView('user-management')}
              className={`w-full flex items-center px-3 py-2 mt-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'user-management'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="h-5 w-5 mr-3" />
              Manajemen Pengguna
            </button>
            
            <button
              onClick={() => setCurrentView('academic-settings')}
              className={`w-full flex items-center px-3 py-2 mt-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'academic-settings'
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="h-5 w-5 mr-3" />
              Pengaturan Akademik
            </button>
          </div>
          
          <div className="mt-8 px-3">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Sistem
            </h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                <Database className="h-4 w-4 mr-3" />
                <span>Status: </span>
                <span className={`ml-1 font-medium ${
                  systemMetrics?.status === 'healthy' ? 'text-green-600' :
                  systemMetrics?.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {systemMetrics?.status === 'healthy' ? 'Sehat' :
                   systemMetrics?.status === 'warning' ? 'Peringatan' : 'Kritis'}
                </span>
              </div>
              <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                <Activity className="h-4 w-4 mr-3" />
                <span>Pengguna Aktif: {systemMetrics?.metrics?.activeUsers || 0}</span>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Administrator</h1>
              <p className="text-gray-600">Monitoring kehadiran dan aktivitas guru secara real-time</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="mb-8">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border-l-4 mb-4 ${
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  alert.type === 'error' ? 'bg-red-50 border-red-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <div className="flex items-center">
                    <AlertTriangle className={`h-5 w-5 mr-2 ${
                      alert.type === 'warning' ? 'text-yellow-600' :
                      alert.type === 'error' ? 'text-red-600' :
                      'text-blue-600'
                    }`} />
                    <div>
                      <h3 className="font-medium text-gray-900">{alert.title}</h3>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Guru</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-xs text-gray-500">Aktif: {users.filter(u => u.role === 'teacher' && (u.status || 'active') === 'active').length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Kehadiran Hari Ini</p>
                  <p className="text-2xl font-bold text-green-600">{stats.attendanceRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">{stats.present + stats.late} dari {stats.total} guru</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ketepatan Waktu</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.punctualityRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">{stats.present} tepat waktu</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sesi Mengajar</p>
                  <p className="text-2xl font-bold text-purple-600">{teachingStats.sessions}</p>
                  <p className="text-xs text-gray-500">Hari ini</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Attendance Rate Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Tingkat Kehadiran
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-blue-600"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${stats.attendanceRate}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">
                          {stats.attendanceRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600">Kehadiran Hari Ini</p>
                    <div className="flex justify-center gap-4 mt-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span>Hadir: {stats.present}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <span>Terlambat: {stats.late}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span>Tidak Hadir: {stats.absent}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Statistik Departemen</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {departmentStats.map((dept) => (
                    <div key={dept.name} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900">{dept.name}</h4>
                        <span className="text-sm font-medium text-blue-600">
                          {dept.rate.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${dept.rate}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{dept.present}/{dept.teachers} hadir</span>
                        <span>{dept.teachers} guru</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Teaching Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sesi Mengajar Hari Ini</p>
                  <p className="text-2xl font-bold text-indigo-600">{teachingStats.sessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-teal-50 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rata-rata Ukuran Kelas</p>
                  <p className="text-2xl font-bold text-teal-600">{teachingStats.averageClassSize.toFixed(0)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-rose-50 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-rose-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Kehadiran Siswa</p>
                  <p className="text-2xl font-bold text-rose-600">{teachingStats.studentAttendanceRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">Data Kehadiran Detail</h2>
                <div className="text-sm text-gray-500">
                  Terakhir diperbarui: {systemMetrics?.lastUpdated ? 
                    new Date(systemMetrics.lastUpdated).toLocaleTimeString('id-ID') : 'Tidak diketahui'}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-b border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Semua Status</option>
                    <option value="present">Hadir</option>
                    <option value="late">Terlambat</option>
                    <option value="absent">Tidak Hadir</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cari Guru
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Nama atau NIP..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guru
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokasi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Tidak ada data kehadiran untuk tanggal yang dipilih
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => {
                      const teacher = users.find(t => t.id === record.userId);
                      return (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {teacher?.name || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {teacher?.nip} • {teacher?.department}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.checkInTime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.checkOutTime || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              record.status === 'present'
                                ? 'bg-green-100 text-green-800'
                                : record.status === 'late'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {record.status === 'present' ? 'Hadir' : 
                               record.status === 'late' ? 'Terlambat' : 'Tidak Hadir'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="truncate max-w-xs">
                                {record.location.address}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};