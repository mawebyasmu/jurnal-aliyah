import React, { useState, useEffect } from 'react';
import {
  Settings,
  MapPin,
  Clock,
  Users,
  Calendar,
  School,
  UserCheck,
  BookOpen,
  BarChart3,
  Database,
  Shield,
  Save,
  Plus,
  Edit3,
  Trash2,
  Upload,
  Download,
  ChevronRight,
  ChevronDown,
  X,
  ArrowLeft
} from 'lucide-react';

interface AdminSettingsProps {
  onBack: () => void;
}

interface SettingsData {
  attendance: {
    maxDistance: number;
    timeWindow: { start: string; end: string };
    lateThreshold: string;
    preventMultipleCheckin: boolean;
    geofencing: {
      latitude: number;
      longitude: number;
      radius: number;
    };
  };
  school: {
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    mission: string;
    vision: string;
    academicYear: string;
    branches: Array<{
      id: string;
      name: string;
      address: string;
    }>;
  };
  schedule: {
    schoolHours: { start: string; end: string };
    breakPeriods: Array<{
      id: string;
      name: string;
      start: string;
      end: string;
    }>;
    holidays: Array<{
      id: string;
      name: string;
      date: string;
      type: 'holiday' | 'event' | 'exam';
    }>;
  };
  system: {
    backupFrequency: string;
    dataRetention: number;
    mobileAppEnabled: boolean;
    twoFactorAuth: boolean;
  };
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('attendance');
  const [expandedSections, setExpandedSections] = useState<string[]>(['attendance']);
  const [settings, setSettings] = useState<SettingsData>({
    attendance: {
      maxDistance: 500,
      timeWindow: { start: '06:30', end: '07:30' },
      lateThreshold: '07:15',
      preventMultipleCheckin: true,
      geofencing: {
        latitude: -6.2088,
        longitude: 106.8456,
        radius: 500
      }
    },
    school: {
      name: 'SMA Negeri 1 Jakarta',
      logo: '',
      address: 'Jl. Sudirman No. 123, Jakarta Pusat',
      phone: '021-12345678',
      email: 'info@sman1jakarta.sch.id',
      mission: 'Mencerdaskan kehidupan bangsa melalui pendidikan berkualitas',
      vision: 'Menjadi sekolah unggulan yang menghasilkan lulusan berkarakter',
      academicYear: '2024/2025',
      branches: []
    },
    schedule: {
      schoolHours: { start: '07:00', end: '15:30' },
      breakPeriods: [
        { id: '1', name: 'Istirahat 1', start: '09:30', end: '09:45' },
        { id: '2', name: 'Istirahat 2', start: '12:00', end: '12:30' }
      ],
      holidays: []
    },
    system: {
      backupFrequency: 'daily',
      dataRetention: 365,
      mobileAppEnabled: true,
      twoFactorAuth: false
    }
  });

  const [classes, setClasses] = useState([
    { id: '1', name: 'XII IPA 1', capacity: 36, room: 'R.12', teacher: 'Dr. Sarah Wijaya' },
    { id: '2', name: 'XII IPA 2', capacity: 35, room: 'R.13', teacher: 'Prof. Budi Santoso' },
    { id: '3', name: 'XII IPS 1', capacity: 34, room: 'R.15', teacher: 'Dra. Siti Nurhaliza' }
  ]);

  const [teachers, setTeachers] = useState([
    { id: '1', name: 'Dr. Sarah Wijaya', email: 'sarah.wijaya@sekolah.sch.id', subjects: ['Matematika', 'Statistika'] },
    { id: '2', name: 'Prof. Budi Santoso', email: 'budi.santoso@sekolah.sch.id', subjects: ['Fisika', 'Kimia'] },
    { id: '3', name: 'Dra. Siti Nurhaliza', email: 'siti.nurhaliza@sekolah.sch.id', subjects: ['Bahasa Indonesia', 'Sastra'] }
  ]);

  const [subjects, setSubjects] = useState([
    { id: '1', name: 'Matematika', code: 'MTK', credits: 4 },
    { id: '2', name: 'Fisika', code: 'FIS', credits: 3 },
    { id: '3', name: 'Kimia', code: 'KIM', credits: 3 },
    { id: '4', name: 'Bahasa Indonesia', code: 'BIN', credits: 4 }
  ]);

  const [showModal, setShowModal] = useState<string | null>(null);

  const menuSections = [
    {
      id: 'attendance',
      title: 'Pengaturan Kehadiran',
      icon: UserCheck,
      color: 'blue',
      subsections: [
        { id: 'distance', title: 'Jarak Maksimum Check-in' },
        { id: 'timewindow', title: 'Waktu Kehadiran' },
        { id: 'geofencing', title: 'Batas Geografis' },
        { id: 'late', title: 'Ambang Batas Terlambat' }
      ]
    },
    {
      id: 'classes',
      title: 'Manajemen Kelas',
      icon: Users,
      color: 'green',
      subsections: [
        { id: 'classlist', title: 'Daftar Kelas' },
        { id: 'assignments', title: 'Penugasan Guru' },
        { id: 'schedules', title: 'Jadwal Kelas' },
        { id: 'capacity', title: 'Kapasitas Siswa' }
      ]
    },
    {
      id: 'schedule',
      title: 'Konfigurasi Jadwal',
      icon: Calendar,
      color: 'purple',
      subsections: [
        { id: 'academic', title: 'Kalender Akademik' },
        { id: 'schoolhours', title: 'Jam Sekolah' },
        { id: 'breaks', title: 'Waktu Istirahat' },
        { id: 'holidays', title: 'Hari Libur & Acara' }
      ]
    },
    {
      id: 'school',
      title: 'Profil Sekolah',
      icon: School,
      color: 'indigo',
      subsections: [
        { id: 'basic', title: 'Informasi Dasar' },
        { id: 'contact', title: 'Kontak & Alamat' },
        { id: 'mission', title: 'Visi & Misi' },
        { id: 'branches', title: 'Cabang/Kampus' }
      ]
    },
    {
      id: 'users',
      title: 'Manajemen Pengguna',
      icon: Users,
      color: 'orange',
      subsections: [
        { id: 'teachers', title: 'Akun Guru' },
        { id: 'students', title: 'Data Siswa' },
        { id: 'parents', title: 'Akses Orang Tua' },
        { id: 'staff', title: 'Staf Administrasi' }
      ]
    },
    {
      id: 'academic',
      title: 'Pengaturan Akademik',
      icon: BookOpen,
      color: 'teal',
      subsections: [
        { id: 'periods', title: 'Periode Penilaian' },
        { id: 'subjects', title: 'Mata Pelajaran' },
        { id: 'teaching', title: 'Beban Mengajar' },
        { id: 'curriculum', title: 'Kurikulum' }
      ]
    },
    {
      id: 'reports',
      title: 'Laporan & Analitik',
      icon: BarChart3,
      color: 'yellow',
      subsections: [
        { id: 'templates', title: 'Template Laporan' },
        { id: 'analytics', title: 'Analisis Statistik' },
        { id: 'export', title: 'Format Export' },
        { id: 'dashboard', title: 'Konfigurasi Dashboard' }
      ]
    },
    {
      id: 'system',
      title: 'Pengaturan Sistem',
      icon: Settings,
      color: 'gray',
      subsections: [
        { id: 'backup', title: 'Backup & Restore' },
        { id: 'security', title: 'Keamanan' },
        { id: 'integration', title: 'Integrasi' },
        { id: 'mobile', title: 'Aplikasi Mobile' }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSave = () => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    alert('Pengaturan berhasil disimpan!');
  };

  const renderAttendanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-blue-600" />
          Pengaturan Jarak & Lokasi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jarak Maksimum Check-in (meter)
            </label>
            <input
              type="number"
              value={settings.attendance.maxDistance}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                attendance: { ...prev.attendance, maxDistance: parseInt(e.target.value) }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Radius Geofencing (meter)
            </label>
            <input
              type="number"
              value={settings.attendance.geofencing.radius}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                attendance: {
                  ...prev.attendance,
                  geofencing: { ...prev.attendance.geofencing, radius: parseInt(e.target.value) }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-600" />
          Pengaturan Waktu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waktu Mulai Check-in
            </label>
            <input
              type="time"
              value={settings.attendance.timeWindow.start}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                attendance: {
                  ...prev.attendance,
                  timeWindow: { ...prev.attendance.timeWindow, start: e.target.value }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waktu Berakhir Check-in
            </label>
            <input
              type="time"
              value={settings.attendance.timeWindow.end}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                attendance: {
                  ...prev.attendance,
                  timeWindow: { ...prev.attendance.timeWindow, end: e.target.value }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batas Waktu Terlambat
            </label>
            <input
              type="time"
              value={settings.attendance.lateThreshold}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                attendance: { ...prev.attendance, lateThreshold: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-blue-600" />
          Pengaturan Keamanan
        </h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.attendance.preventMultipleCheckin}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                attendance: { ...prev.attendance, preventMultipleCheckin: e.target.checked }
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Cegah multiple check-in dalam satu hari
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderClassManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-600" />
            Daftar Kelas
          </h3>
          <button
            onClick={() => setShowModal('addClass')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kelas
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kelas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kapasitas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruangan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wali Kelas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{cls.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cls.capacity} siswa</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cls.room}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cls.teacher}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-green-600" />
            Mata Pelajaran
          </h3>
          <button
            onClick={() => setShowModal('addSubject')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Mata Pelajaran
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{subject.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{subject.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{subject.credits}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSchoolProfile = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <School className="h-5 w-5 mr-2 text-indigo-600" />
          Informasi Dasar Sekolah
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Sekolah
            </label>
            <input
              type="text"
              value={settings.school.name}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                school: { ...prev.school, name: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun Akademik
            </label>
            <input
              type="text"
              value={settings.school.academicYear}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                school: { ...prev.school, academicYear: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alamat
            </label>
            <textarea
              value={settings.school.address}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                school: { ...prev.school, address: e.target.value }
              }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon
            </label>
            <input
              type="tel"
              value={settings.school.phone}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                school: { ...prev.school, phone: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.school.email}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                school: { ...prev.school, email: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Visi & Misi
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visi
            </label>
            <textarea
              value={settings.school.vision}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                school: { ...prev.school, vision: e.target.value }
              }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Misi
            </label>
            <textarea
              value={settings.school.mission}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                school: { ...prev.school, mission: e.target.value }
              }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-gray-600" />
          Backup & Keamanan Data
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frekuensi Backup
            </label>
            <select
              value={settings.system.backupFrequency}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                system: { ...prev.system, backupFrequency: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retensi Data (hari)
            </label>
            <input
              type="number"
              value={settings.system.dataRetention}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                system: { ...prev.system, dataRetention: parseInt(e.target.value) }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.system.twoFactorAuth}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                system: { ...prev.system, twoFactorAuth: e.target.checked }
              }))}
              className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Aktifkan autentikasi dua faktor
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.system.mobileAppEnabled}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                system: { ...prev.system, mobileAppEnabled: e.target.checked }
              }))}
              className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Aktifkan akses aplikasi mobile
            </span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Download className="h-5 w-5 mr-2 text-gray-600" />
          Export & Import Data
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export Semua Data
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'attendance':
        return renderAttendanceSettings();
      case 'classes':
        return renderClassManagement();
      case 'school':
        return renderSchoolProfile();
      case 'system':
        return renderSystemSettings();
      default:
        return (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Pengaturan</h3>
            <p className="text-gray-500">Pilih kategori pengaturan dari menu sebelah kiri</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Pengaturan Sistem</h2>
          <p className="text-sm text-gray-600">Konfigurasi sistem kehadiran</p>
        </div>
        
        <nav className="mt-6">
          <div className="px-3 space-y-2">
            {menuSections.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSections.includes(section.id);
              const isActive = activeSection === section.id;
              
              return (
                <div key={section.id}>
                  <button
                    onClick={() => {
                      setActiveSection(section.id);
                      toggleSection(section.id);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? `bg-${section.color}-50 text-${section.color}-700 border border-${section.color}-200`
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`h-5 w-5 mr-3 ${isActive ? `text-${section.color}-600` : 'text-gray-500'}`} />
                      <span className="font-medium text-sm">{section.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {isExpanded && section.subsections && (
                    <div className="ml-8 mt-2 space-y-1">
                      {section.subsections.map((subsection) => (
                        <button
                          key={subsection.id}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          {subsection.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {menuSections.find(s => s.id === activeSection)?.title || 'Pengaturan'}
              </h1>
              <p className="text-gray-600">Kelola konfigurasi dan pengaturan sistem</p>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Simpan Pengaturan
            </button>
          </div>

          {renderContent()}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {showModal === 'addClass' ? 'Tambah Kelas Baru' : 'Tambah Mata Pelajaran'}
              </h3>
              <button
                onClick={() => setShowModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Form untuk menambah {showModal === 'addClass' ? 'kelas' : 'mata pelajaran'} baru akan ditampilkan di sini.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(null)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Simpan
                </button>
                <button
                  onClick={() => setShowModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};