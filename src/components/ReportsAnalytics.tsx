import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Clock,
  FileText,
  Filter,
  RefreshCw,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  Target,
  Award,
  BookOpen,
  MapPin,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { User, AttendanceRecord, TeachingLog } from '../types';

interface ReportsAnalyticsProps {
  onBack: () => void;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({ onBack }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedReport, setSelectedReport] = useState<'attendance' | 'teaching' | 'performance' | 'overview'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');

  useEffect(() => {
    generateReport();
  }, [dateRange, selectedReport, selectedDepartment, selectedTeacher]);

  const generateReport = async () => {
    setLoading(true);
    
    try {
      const attendanceStats = dataService.getAttendanceStats(dateRange);
      const users = dataService.getUsers().filter(u => u.role === 'teacher');
      const teachingLogs = dataService.getTeachingLogs();
      const systemHealth = dataService.getSystemHealth();
      
      // Filter by department if selected
      let filteredUsers = users;
      if (selectedDepartment !== 'all') {
        filteredUsers = users.filter(u => u.department === selectedDepartment);
      }
      
      // Filter by teacher if selected
      if (selectedTeacher !== 'all') {
        filteredUsers = users.filter(u => u.id === selectedTeacher);
      }
      
      // Calculate comprehensive statistics
      const dailyStats = calculateDailyStats(attendanceStats.records, filteredUsers);
      const teacherPerformance = calculateTeacherPerformance(filteredUsers, attendanceStats.records, teachingLogs);
      const departmentStats = calculateDepartmentStats(users, attendanceStats.records);
      const teachingStats = calculateTeachingStats(teachingLogs, filteredUsers);
      const trendAnalysis = calculateTrendAnalysis(attendanceStats.records, teachingLogs);
      
      setStats({
        ...attendanceStats,
        dailyStats,
        teacherPerformance,
        departmentStats,
        teachingStats,
        trendAnalysis,
        systemHealth,
        totalTeachingHours: teachingLogs.length * 2,
        averageClassSize: teachingLogs.reduce((acc, log) => acc + log.totalStudents, 0) / teachingLogs.length || 0,
        punctualityRate: calculatePunctualityRate(attendanceStats.records),
        engagementScore: calculateEngagementScore(teachingLogs),
        performanceGrade: calculatePerformanceGrade(attendanceStats, teachingLogs)
      });
    } catch (error) {
      console.error('Error generating report:', error);
      dataService.log('error', 'Report generation failed', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyStats = (records: AttendanceRecord[], users: User[]) => {
    const dailyData: { [key: string]: { present: number; late: number; absent: number; total: number } } = {};
    
    // Initialize all days in range
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) { // Exclude weekends
        const dateStr = d.toISOString().split('T')[0];
        dailyData[dateStr] = { present: 0, late: 0, absent: 0, total: users.length };
      }
    }
    
    // Fill with actual data
    records.forEach(record => {
      const date = new Date(record.date).toISOString().split('T')[0];
      if (dailyData[date]) {
        dailyData[date][record.status]++;
      }
    });
    
    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data,
      attendanceRate: data.total > 0 ? ((data.present + data.late) / data.total * 100) : 0,
      punctualityRate: data.total > 0 ? (data.present / data.total * 100) : 0
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const calculateTeacherPerformance = (users: User[], records: AttendanceRecord[], teachingLogs: TeachingLog[]) => {
    return users.map(user => {
      const userRecords = records.filter(r => r.userId === user.id);
      const userLogs = teachingLogs.filter(l => l.userId === user.id);
      
      const presentCount = userRecords.filter(r => r.status === 'present').length;
      const lateCount = userRecords.filter(r => r.status === 'late').length;
      const totalRecords = userRecords.length;
      
      const avgClassSize = userLogs.length > 0 ? 
        userLogs.reduce((acc, log) => acc + log.totalStudents, 0) / userLogs.length : 0;
      
      const avgAttendanceRate = userLogs.length > 0 ?
        userLogs.reduce((acc, log) => acc + (log.attendance / log.totalStudents * 100), 0) / userLogs.length : 0;
      
      return {
        id: user.id,
        name: user.name,
        department: user.department,
        attendanceRate: totalRecords > 0 ? ((presentCount + lateCount) / totalRecords * 100) : 0,
        punctualityRate: totalRecords > 0 ? (presentCount / totalRecords * 100) : 0,
        teachingSessions: userLogs.length,
        averageClassSize: avgClassSize,
        studentAttendanceRate: avgAttendanceRate,
        performanceScore: calculateIndividualPerformanceScore(userRecords, userLogs),
        subjects: user.subjects,
        status: user.status || 'active'
      };
    });
  };

  const calculateDepartmentStats = (users: User[], records: AttendanceRecord[]) => {
    const departments: { [key: string]: { 
      teachers: number; 
      present: number; 
      late: number; 
      total: number;
      subjects: Set<string>;
    } } = {};
    
    users.forEach(user => {
      if (!departments[user.department]) {
        departments[user.department] = { 
          teachers: 0, 
          present: 0, 
          late: 0, 
          total: 0,
          subjects: new Set()
        };
      }
      departments[user.department].teachers++;
      user.subjects.forEach(subject => departments[user.department].subjects.add(subject));
      
      const userRecords = records.filter(r => r.userId === user.id);
      departments[user.department].present += userRecords.filter(r => r.status === 'present').length;
      departments[user.department].late += userRecords.filter(r => r.status === 'late').length;
      departments[user.department].total += userRecords.length;
    });
    
    return Object.entries(departments).map(([name, data]) => ({
      name,
      teachers: data.teachers,
      subjects: Array.from(data.subjects),
      attendanceRate: data.total > 0 ? ((data.present + data.late) / data.total * 100) : 0,
      punctualityRate: data.total > 0 ? (data.present / data.total * 100) : 0,
      totalSessions: data.total
    }));
  };

  const calculateTeachingStats = (teachingLogs: TeachingLog[], users: User[]) => {
    const totalSessions = teachingLogs.length;
    const totalStudents = teachingLogs.reduce((acc, log) => acc + log.totalStudents, 0);
    const totalAttendance = teachingLogs.reduce((acc, log) => acc + log.attendance, 0);
    
    const subjectStats: { [key: string]: { sessions: number; students: number; attendance: number } } = {};
    
    teachingLogs.forEach(log => {
      if (!subjectStats[log.subject]) {
        subjectStats[log.subject] = { sessions: 0, students: 0, attendance: 0 };
      }
      subjectStats[log.subject].sessions++;
      subjectStats[log.subject].students += log.totalStudents;
      subjectStats[log.subject].attendance += log.attendance;
    });
    
    return {
      totalSessions,
      averageClassSize: totalSessions > 0 ? totalStudents / totalSessions : 0,
      overallStudentAttendance: totalStudents > 0 ? (totalAttendance / totalStudents * 100) : 0,
      subjectBreakdown: Object.entries(subjectStats).map(([subject, data]) => ({
        subject,
        sessions: data.sessions,
        averageSize: data.sessions > 0 ? data.students / data.sessions : 0,
        attendanceRate: data.students > 0 ? (data.attendance / data.students * 100) : 0
      }))
    };
  };

  const calculateTrendAnalysis = (records: AttendanceRecord[], teachingLogs: TeachingLog[]) => {
    const weeklyData: { [key: string]: { attendance: number; teaching: number } } = {};
    
    // Group by week
    records.forEach(record => {
      const date = new Date(record.date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { attendance: 0, teaching: 0 };
      }
      if (record.status === 'present' || record.status === 'late') {
        weeklyData[weekKey].attendance++;
      }
    });
    
    teachingLogs.forEach(log => {
      const date = new Date(log.date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { attendance: 0, teaching: 0 };
      }
      weeklyData[weekKey].teaching++;
    });
    
    return Object.entries(weeklyData)
      .map(([week, data]) => ({ week, ...data }))
      .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());
  };

  const calculatePunctualityRate = (records: AttendanceRecord[]) => {
    const totalRecords = records.length;
    const punctualRecords = records.filter(r => r.status === 'present').length;
    return totalRecords > 0 ? (punctualRecords / totalRecords * 100) : 0;
  };

  const calculateEngagementScore = (teachingLogs: TeachingLog[]) => {
    if (teachingLogs.length === 0) return 0;
    
    const avgAttendance = teachingLogs.reduce((acc, log) => 
      acc + (log.attendance / log.totalStudents), 0) / teachingLogs.length;
    
    const homeworkRate = teachingLogs.filter(log => log.homework && log.homework.trim()).length / teachingLogs.length;
    
    return (avgAttendance * 0.7 + homeworkRate * 0.3) * 100;
  };

  const calculatePerformanceGrade = (attendanceStats: any, teachingLogs: TeachingLog[]) => {
    const attendanceScore = attendanceStats.attendanceRate || 0;
    const teachingScore = teachingLogs.length > 0 ? 
      teachingLogs.reduce((acc, log) => acc + (log.attendance / log.totalStudents * 100), 0) / teachingLogs.length : 0;
    
    const overallScore = (attendanceScore * 0.6 + teachingScore * 0.4);
    
    if (overallScore >= 90) return { grade: 'A', color: 'green', label: 'Excellent' };
    if (overallScore >= 80) return { grade: 'B', color: 'blue', label: 'Good' };
    if (overallScore >= 70) return { grade: 'C', color: 'yellow', label: 'Fair' };
    if (overallScore >= 60) return { grade: 'D', color: 'orange', label: 'Needs Improvement' };
    return { grade: 'F', color: 'red', label: 'Poor' };
  };

  const calculateIndividualPerformanceScore = (records: AttendanceRecord[], logs: TeachingLog[]) => {
    const attendanceRate = records.length > 0 ? 
      (records.filter(r => r.status === 'present' || r.status === 'late').length / records.length * 100) : 0;
    
    const teachingQuality = logs.length > 0 ?
      logs.reduce((acc, log) => acc + (log.attendance / log.totalStudents * 100), 0) / logs.length : 0;
    
    return (attendanceRate * 0.5 + teachingQuality * 0.5);
  };

  const exportReport = (format: 'csv' | 'json' | 'excel') => {
    try {
      const reportData = {
        dateRange,
        generatedAt: new Date().toISOString(),
        reportType: selectedReport,
        filters: {
          department: selectedDepartment,
          teacher: selectedTeacher
        },
        summary: {
          totalTeachers: stats?.total || 0,
          attendanceRate: stats?.attendanceRate || 0,
          punctualityRate: stats?.punctualityRate || 0,
          totalSessions: stats?.totalTeachingHours || 0,
          performanceGrade: stats?.performanceGrade
        },
        dailyStats: stats?.dailyStats || [],
        teacherPerformance: stats?.teacherPerformance || [],
        departmentStats: stats?.departmentStats || [],
        teachingStats: stats?.teachingStats || {},
        trendAnalysis: stats?.trendAnalysis || []
      };

      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        content = JSON.stringify(reportData, null, 2);
        filename = `report-${selectedReport}-${dateRange.start}-to-${dateRange.end}.json`;
        mimeType = 'application/json';
      } else if (format === 'excel') {
        // For Excel, we'll use CSV format with enhanced structure
        const csvData = convertToExcelCSV(reportData);
        content = csvData;
        filename = `report-${selectedReport}-${dateRange.start}-to-${dateRange.end}.csv`;
        mimeType = 'text/csv';
      } else {
        // Standard CSV format
        const csvHeaders = ['Date', 'Present', 'Late', 'Absent', 'Total', 'Attendance Rate'];
        const csvRows = stats?.dailyStats?.map((day: any) => 
          [day.date, day.present, day.late, day.absent, day.total, `${day.attendanceRate.toFixed(1)}%`].join(',')
        ) || [];
        content = [csvHeaders.join(','), ...csvRows].join('\n');
        filename = `report-${selectedReport}-${dateRange.start}-to-${dateRange.end}.csv`;
        mimeType = 'text/csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      dataService.log('info', `Report exported: ${selectedReport}`, { 
        format, 
        dateRange, 
        filters: { department: selectedDepartment, teacher: selectedTeacher }
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Terjadi kesalahan saat mengekspor laporan!');
    }
  };

  const convertToExcelCSV = (data: any): string => {
    const sections = [
      'LAPORAN KEHADIRAN DAN KINERJA GURU',
      `Periode: ${data.dateRange.start} - ${data.dateRange.end}`,
      `Dibuat: ${new Date(data.generatedAt).toLocaleString('id-ID')}`,
      '',
      'RINGKASAN',
      `Total Guru,${data.summary.totalTeachers}`,
      `Tingkat Kehadiran,${data.summary.attendanceRate.toFixed(1)}%`,
      `Tingkat Ketepatan,${data.summary.punctualityRate.toFixed(1)}%`,
      `Grade Kinerja,${data.summary.performanceGrade?.grade || 'N/A'}`,
      '',
      'DATA HARIAN',
      'Tanggal,Hadir,Terlambat,Tidak Hadir,Total,Tingkat Kehadiran',
      ...data.dailyStats.map((day: any) => 
        `${day.date},${day.present},${day.late},${day.absent},${day.total},${day.attendanceRate.toFixed(1)}%`
      ),
      '',
      'KINERJA GURU',
      'Nama,Departemen,Kehadiran,Ketepatan,Sesi Mengajar,Skor Kinerja',
      ...data.teacherPerformance.map((teacher: any) => 
        `${teacher.name},${teacher.department},${teacher.attendanceRate.toFixed(1)}%,${teacher.punctualityRate.toFixed(1)}%,${teacher.teachingSessions},${teacher.performanceScore.toFixed(1)}`
      )
    ];
    
    return sections.join('\n');
  };

  const getDepartments = () => {
    const users = dataService.getUsers().filter(u => u.role === 'teacher');
    return [...new Set(users.map(u => u.department))];
  };

  const getTeachers = () => {
    const users = dataService.getUsers().filter(u => u.role === 'teacher');
    if (selectedDepartment !== 'all') {
      return users.filter(u => u.department === selectedDepartment);
    }
    return users;
  };

  const renderOverviewReport = () => (
    <div className="space-y-8">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tingkat Kehadiran</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.attendanceRate?.toFixed(1) || 0}%</p>
              <p className="text-sm text-gray-500 mt-1">Target: 95%</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min((stats?.attendanceRate || 0), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tingkat Ketepatan</p>
              <p className="text-3xl font-bold text-green-600">{stats?.punctualityRate?.toFixed(1) || 0}%</p>
              <p className="text-sm text-gray-500 mt-1">Target: 90%</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${Math.min((stats?.punctualityRate || 0), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Skor Engagement</p>
              <p className="text-3xl font-bold text-purple-600">{stats?.engagementScore?.toFixed(1) || 0}%</p>
              <p className="text-sm text-gray-500 mt-1">Target: 85%</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${Math.min((stats?.engagementScore || 0), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Grade Kinerja</p>
              <p className={`text-3xl font-bold text-${stats?.performanceGrade?.color || 'gray'}-600`}>
                {stats?.performanceGrade?.grade || 'N/A'}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stats?.performanceGrade?.label || 'No Data'}</p>
            </div>
            <div className={`bg-${stats?.performanceGrade?.color || 'gray'}-50 p-3 rounded-lg`}>
              <Award className="h-8 w-8 text-${stats?.performanceGrade?.color || 'gray'}-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Trend Analysis Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Tren Kehadiran Mingguan
          </h3>
        </div>
        <div className="p-6">
          {stats?.trendAnalysis?.length > 0 ? (
            <div className="space-y-4">
              {stats.trendAnalysis.slice(-8).map((week: any, index: number) => (
                <div key={week.week} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600">
                    Minggu {index + 1}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="flex h-8 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium" 
                        style={{ width: `${Math.max((week.attendance / 20) * 100, 5)}%` }}
                      >
                        {week.attendance > 0 && week.attendance}
                      </div>
                      <div 
                        className="bg-green-500 flex items-center justify-center text-white text-xs font-medium" 
                        style={{ width: `${Math.max((week.teaching / 50) * 100, 5)}%` }}
                      >
                        {week.teaching > 0 && week.teaching}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 w-32">
                    <div>Kehadiran: {week.attendance}</div>
                    <div>Mengajar: {week.teaching}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data tren untuk periode yang dipilih
            </div>
          )}
        </div>
      </div>

      {/* Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-600" />
              Kinerja Departemen
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats?.departmentStats?.map((dept: any) => (
                <div key={dept.name} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{dept.name}</h4>
                    <span className="text-sm font-medium text-blue-600">
                      {dept.attendanceRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${dept.attendanceRate}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{dept.teachers} guru</span>
                    <span>{dept.subjects.length} mata pelajaran</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Statistik Mengajar
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats?.teachingStats?.totalSessions || 0}</p>
                <p className="text-sm text-gray-600">Total Sesi</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats?.teachingStats?.averageClassSize?.toFixed(1) || 0}</p>
                <p className="text-sm text-gray-600">Rata-rata Kelas</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {stats?.teachingStats?.subjectBreakdown?.slice(0, 5).map((subject: any) => (
                <div key={subject.subject} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{subject.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{subject.sessions} sesi</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${subject.attendanceRate}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-10">{subject.attendanceRate.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAttendanceReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Guru</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tingkat Kehadiran</p>
              <p className="text-2xl font-bold text-green-600">{stats?.attendanceRate?.toFixed(1) || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tingkat Ketepatan</p>
              <p className="text-2xl font-bold text-yellow-600">{stats?.punctualityRate?.toFixed(1) || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-purple-50 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Jam Mengajar</p>
              <p className="text-2xl font-bold text-purple-600">{stats?.totalTeachingHours || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Attendance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Kehadiran Harian
          </h3>
        </div>
        <div className="p-6">
          {stats?.dailyStats?.length > 0 ? (
            <div className="space-y-4">
              {stats.dailyStats.slice(-14).map((day: any, index: number) => (
                <div key={day.date} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('id-ID', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="flex h-6 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${(day.present / day.total) * 100}%` }}
                        title={`Hadir: ${day.present}`}
                      ></div>
                      <div 
                        className="bg-yellow-500" 
                        style={{ width: `${(day.late / day.total) * 100}%` }}
                        title={`Terlambat: ${day.late}`}
                      ></div>
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${(day.absent / day.total) * 100}%` }}
                        title={`Tidak Hadir: ${day.absent}`}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 w-20 text-right">
                    {day.attendanceRate.toFixed(0)}%
                  
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data untuk periode yang dipilih
            </div>
          )}
        </div>
      </div>

      {/* Teacher Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Performa Individual Guru
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departemen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kehadiran</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ketepatan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesi Mengajar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats?.teacherPerformance?.map((teacher: any) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{teacher.department}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${teacher.attendanceRate}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-600">{teacher.attendanceRate.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${teacher.punctualityRate}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-600">{teacher.punctualityRate.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{teacher.teachingSessions}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      teacher.performanceScore >= 90 ? 'bg-green-100 text-green-800' :
                      teacher.performanceScore >= 80 ? 'bg-blue-100 text-blue-800' :
                      teacher.performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {teacher.performanceScore.toFixed(0)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
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
                <h1 className="text-xl font-semibold text-gray-900">Laporan & Analitik</h1>
                <p className="text-sm text-gray-600">Analisis komprehensif data kehadiran dan performa guru</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => exportReport('csv')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </button>
              <button
                onClick={() => exportReport('excel')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </button>
              <button
                onClick={() => exportReport('json')}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Laporan
              </label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="overview">Overview</option>
                <option value="attendance">Laporan Kehadiran</option>
                <option value="teaching">Laporan Mengajar</option>
                <option value="performance">Laporan Performa</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departemen
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Departemen</option>
                {getDepartments().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generateReport}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Memuat...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Memuat laporan...</span>
          </div>
        ) : (
          <>
            {selectedReport === 'overview' && renderOverviewReport()}
            {selectedReport === 'attendance' && renderAttendanceReport()}
            {selectedReport === 'teaching' && renderAttendanceReport()}
            {selectedReport === 'performance' && renderAttendanceReport()}
          </>
        )}
      </div>
    </div>
  );
};