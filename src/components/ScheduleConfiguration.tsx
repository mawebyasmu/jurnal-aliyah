import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  ArrowLeft,
  Coffee,
  BookOpen,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { dataService } from '../services/dataService';

interface ScheduleConfigurationProps {
  onBack: () => void;
}

interface BreakPeriod {
  id: string;
  name: string;
  start: string;
  end: string;
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'holiday' | 'event' | 'exam';
}

export const ScheduleConfiguration: React.FC<ScheduleConfigurationProps> = ({ onBack }) => {
  const [settings, setSettings] = useState({
    schoolHours: { start: '07:00', end: '15:30' },
    breakPeriods: [] as BreakPeriod[],
    holidays: [] as Holiday[]
  });
  const [activeTab, setActiveTab] = useState<'hours' | 'breaks' | 'holidays'>('hours');
  const [showModal, setShowModal] = useState<'break' | 'holiday' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [breakForm, setBreakForm] = useState({
    name: '',
    start: '',
    end: ''
  });

  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    type: 'holiday' as 'holiday' | 'event' | 'exam'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const systemSettings = dataService.getSettings();
      setSettings(systemSettings.schedule);
    } catch (error) {
      console.error('Error loading schedule settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const systemSettings = dataService.getSettings();
      systemSettings.schedule = settings;
      dataService.saveSettings(systemSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      dataService.log('info', 'Schedule settings updated', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Terjadi kesalahan saat menyimpan pengaturan!');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBreak = () => {
    setBreakForm({ name: '', start: '', end: '' });
    setEditingItem(null);
    setShowModal('break');
  };

  const handleEditBreak = (breakPeriod: BreakPeriod) => {
    setBreakForm({
      name: breakPeriod.name,
      start: breakPeriod.start,
      end: breakPeriod.end
    });
    setEditingItem(breakPeriod);
    setShowModal('break');
  };

  const handleDeleteBreak = (breakId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus periode istirahat ini?')) {
      setSettings(prev => ({
        ...prev,
        breakPeriods: prev.breakPeriods.filter(b => b.id !== breakId)
      }));
    }
  };

  const handleSubmitBreak = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      setSettings(prev => ({
        ...prev,
        breakPeriods: prev.breakPeriods.map(b => 
          b.id === editingItem.id 
            ? { ...b, ...breakForm }
            : b
        )
      }));
    } else {
      const newBreak: BreakPeriod = {
        id: Date.now().toString(),
        ...breakForm
      };
      setSettings(prev => ({
        ...prev,
        breakPeriods: [...prev.breakPeriods, newBreak]
      }));
    }
    
    setShowModal(null);
    setEditingItem(null);
  };

  const handleAddHoliday = () => {
    setHolidayForm({ name: '', date: '', type: 'holiday' });
    setEditingItem(null);
    setShowModal('holiday');
  };

  const handleEditHoliday = (holiday: Holiday) => {
    setHolidayForm({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type
    });
    setEditingItem(holiday);
    setShowModal('holiday');
  };

  const handleDeleteHoliday = (holidayId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus hari libur/acara ini?')) {
      setSettings(prev => ({
        ...prev,
        holidays: prev.holidays.filter(h => h.id !== holidayId)
      }));
    }
  };

  const handleSubmitHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      setSettings(prev => ({
        ...prev,
        holidays: prev.holidays.map(h => 
          h.id === editingItem.id 
            ? { ...h, ...holidayForm }
            : h
        )
      }));
    } else {
      const newHoliday: Holiday = {
        id: Date.now().toString(),
        ...holidayForm
      };
      setSettings(prev => ({
        ...prev,
        holidays: [...prev.holidays, newHoliday]
      }));
    }
    
    setShowModal(null);
    setEditingItem(null);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'holiday': return 'Hari Libur';
      case 'event': return 'Acara';
      case 'exam': return 'Ujian';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'holiday': return 'bg-red-100 text-red-800';
      case 'event': return 'bg-blue-100 text-blue-800';
      case 'exam': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                <h1 className="text-xl font-semibold text-gray-900">Konfigurasi Jadwal</h1>
                <p className="text-sm text-gray-600">Kelola jam sekolah, istirahat, dan kalender akademik</p>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('hours')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'hours'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="h-4 w-4 inline mr-2" />
                Jam Sekolah
              </button>
              <button
                onClick={() => setActiveTab('breaks')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'breaks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Coffee className="h-4 w-4 inline mr-2" />
                Waktu Istirahat
              </button>
              <button
                onClick={() => setActiveTab('holidays')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'holidays'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Kalender Akademik
              </button>
            </nav>
          </div>
        </div>

        {/* School Hours Tab */}
        {activeTab === 'hours' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Jam Operasional Sekolah
              </h2>
              <p className="text-sm text-gray-600 mt-1">Tentukan jam buka dan tutup sekolah</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam Mulai Sekolah
                  </label>
                  <input
                    type="time"
                    value={settings.schoolHours.start}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      schoolHours: { ...prev.schoolHours, start: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Waktu dimulainya aktivitas sekolah</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam Selesai Sekolah
                  </label>
                  <input
                    type="time"
                    value={settings.schoolHours.end}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      schoolHours: { ...prev.schoolHours, end: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Waktu berakhirnya aktivitas sekolah</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Informasi Jam Sekolah:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Durasi sekolah: {(() => {
                        const start = new Date(`2000-01-01T${settings.schoolHours.start}`);
                        const end = new Date(`2000-01-01T${settings.schoolHours.end}`);
                        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                        return `${diff.toFixed(1)} jam`;
                      })()}</li>
                      <li>Jam ini akan digunakan sebagai referensi untuk jadwal pelajaran</li>
                      <li>Pastikan jam sekolah sesuai dengan kebijakan institusi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Break Periods Tab */}
        {activeTab === 'breaks' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Coffee className="h-5 w-5 mr-2 text-green-600" />
                  Periode Istirahat
                </h2>
                <p className="text-sm text-gray-600 mt-1">Kelola waktu istirahat dan jeda antar pelajaran</p>
              </div>
              <button
                onClick={handleAddBreak}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Istirahat
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu Mulai</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu Selesai</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {settings.breakPeriods.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Belum ada periode istirahat yang dikonfigurasi
                      </td>
                    </tr>
                  ) : (
                    settings.breakPeriods.map((breakPeriod) => {
                      const start = new Date(`2000-01-01T${breakPeriod.start}`);
                      const end = new Date(`2000-01-01T${breakPeriod.end}`);
                      const duration = (end.getTime() - start.getTime()) / (1000 * 60);
                      
                      return (
                        <tr key={breakPeriod.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {breakPeriod.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {breakPeriod.start}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {breakPeriod.end}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {duration} menit
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditBreak(breakPeriod)}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBreak(breakPeriod.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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
        )}

        {/* Holidays Tab */}
        {activeTab === 'holidays' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Kalender Akademik
                </h2>
                <p className="text-sm text-gray-600 mt-1">Kelola hari libur, acara, dan jadwal ujian</p>
              </div>
              <button
                onClick={handleAddHoliday}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Acara
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hari</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {settings.holidays.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Belum ada acara atau hari libur yang dikonfigurasi
                      </td>
                    </tr>
                  ) : (
                    settings.holidays
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((holiday) => (
                        <tr key={holiday.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {holiday.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(holiday.date).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(holiday.type)}`}>
                              {getTypeLabel(holiday.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(holiday.date).toLocaleDateString('id-ID', { weekday: 'long' })}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditHoliday(holiday)}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteHoliday(holiday.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Break Period Modal */}
      {showModal === 'break' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit Periode Istirahat' : 'Tambah Periode Istirahat'}
                </h2>
                <button
                  onClick={() => setShowModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitBreak} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Periode *
                </label>
                <input
                  type="text"
                  value={breakForm.name}
                  onChange={(e) => setBreakForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Contoh: Istirahat 1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Mulai *
                  </label>
                  <input
                    type="time"
                    value={breakForm.start}
                    onChange={(e) => setBreakForm(prev => ({ ...prev, start: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Selesai *
                  </label>
                  <input
                    type="time"
                    value={breakForm.end}
                    onChange={(e) => setBreakForm(prev => ({ ...prev, end: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingItem ? 'Perbarui' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Holiday Modal */}
      {showModal === 'holiday' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit Acara' : 'Tambah Acara/Hari Libur'}
                </h2>
                <button
                  onClick={() => setShowModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitHoliday} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Acara *
                </label>
                <input
                  type="text"
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Contoh: Hari Kemerdekaan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal *
                </label>
                <input
                  type="date"
                  value={holidayForm.date}
                  onChange={(e) => setHolidayForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis *
                </label>
                <select
                  value={holidayForm.type}
                  onChange={(e) => setHolidayForm(prev => ({ ...prev, type: e.target.value as any }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="holiday">Hari Libur</option>
                  <option value="event">Acara</option>
                  <option value="exam">Ujian</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingItem ? 'Perbarui' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};