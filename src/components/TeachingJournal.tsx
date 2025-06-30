import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Calendar,
  Clock,
  Users,
  FileText,
  Save,
  Edit3,
  Trash2
} from 'lucide-react';
import { User, TeachingLog, ClassSchedule } from '../types';

interface TeachingJournalProps {
  user: User;
}

export const TeachingJournal: React.FC<TeachingJournalProps> = ({ user }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState<TeachingLog | null>(null);
  const [teachingLogs, setTeachingLogs] = useState<TeachingLog[]>([]);
  const [schedules] = useState<ClassSchedule[]>([
    { id: '1', subject: 'Matematika', class: 'XII IPA 1', time: '07:00-08:30', day: 'Senin', room: 'R.12' },
    { id: '2', subject: 'Matematika', class: 'XII IPA 2', time: '08:30-10:00', day: 'Senin', room: 'R.13' },
    { id: '3', subject: 'Statistika', class: 'XII IPS 1', time: '10:15-11:45', day: 'Senin', room: 'R.15' },
  ]);

  const [formData, setFormData] = useState({
    scheduleId: '',
    subject: '',
    class: '',
    topic: '',
    materials: '',
    attendance: 0,
    totalStudents: 0,
    notes: '',
    homework: ''
  });

  useEffect(() => {
    loadTeachingLogs();
  }, [user.id]);

  const loadTeachingLogs = () => {
    const logs = localStorage.getItem('teachingLogs');
    if (logs) {
      const allLogs: TeachingLog[] = JSON.parse(logs);
      const userLogs = allLogs.filter(log => log.userId === user.id);
      setTeachingLogs(userLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  const handleScheduleChange = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      setFormData(prev => ({
        ...prev,
        scheduleId,
        subject: schedule.subject,
        class: schedule.class
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date();
    const logData: TeachingLog = {
      id: editingLog ? editingLog.id : Date.now().toString(),
      userId: user.id,
      date: now.toISOString(),
      scheduleId: formData.scheduleId,
      subject: formData.subject,
      class: formData.class,
      topic: formData.topic,
      materials: formData.materials,
      attendance: formData.attendance,
      totalStudents: formData.totalStudents,
      notes: formData.notes,
      homework: formData.homework,
      createdAt: editingLog ? editingLog.createdAt : now.toISOString()
    };

    const existingLogs = localStorage.getItem('teachingLogs');
    let logs: TeachingLog[] = existingLogs ? JSON.parse(existingLogs) : [];

    if (editingLog) {
      const index = logs.findIndex(log => log.id === editingLog.id);
      if (index !== -1) {
        logs[index] = logData;
      }
    } else {
      logs.push(logData);
    }

    localStorage.setItem('teachingLogs', JSON.stringify(logs));
    loadTeachingLogs();
    resetForm();
    alert(editingLog ? 'Jurnal berhasil diperbarui!' : 'Jurnal berhasil disimpan!');
  };

  const handleEdit = (log: TeachingLog) => {
    setEditingLog(log);
    setFormData({
      scheduleId: log.scheduleId,
      subject: log.subject,
      class: log.class,
      topic: log.topic,
      materials: log.materials,
      attendance: log.attendance,
      totalStudents: log.totalStudents,
      notes: log.notes,
      homework: log.homework || ''
    });
    setShowForm(true);
  };

  const handleDelete = (logId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
      const existingLogs = localStorage.getItem('teachingLogs');
      if (existingLogs) {
        const logs: TeachingLog[] = JSON.parse(existingLogs);
        const filteredLogs = logs.filter(log => log.id !== logId);
        localStorage.setItem('teachingLogs', JSON.stringify(filteredLogs));
        loadTeachingLogs();
        alert('Jurnal berhasil dihapus!');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      scheduleId: '',
      subject: '',
      class: '',
      topic: '',
      materials: '',
      attendance: 0,
      totalStudents: 0,
      notes: '',
      homework: ''
    });
    setShowForm(false);
    setEditingLog(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Jurnal Mengajar</h1>
          <p className="text-gray-600">Kelola dan dokumentasikan aktivitas mengajar Anda</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Jurnal
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLog ? 'Edit Jurnal Mengajar' : 'Tambah Jurnal Mengajar'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jadwal Kelas
                  </label>
                  <select
                    value={formData.scheduleId}
                    onChange={(e) => handleScheduleChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih jadwal kelas</option>
                    {schedules.map((schedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        {schedule.subject} - {schedule.class} ({schedule.time})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mata pelajaran"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kelas
                  </label>
                  <input
                    type="text"
                    value={formData.class}
                    onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nama kelas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topik Pembelajaran
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Topik yang diajarkan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Siswa Hadir
                  </label>
                  <input
                    type="number"
                    value={formData.attendance}
                    onChange={(e) => setFormData(prev => ({ ...prev, attendance: parseInt(e.target.value) || 0 }))}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jumlah siswa hadir"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Siswa
                  </label>
                  <input
                    type="number"
                    value={formData.totalStudents}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalStudents: parseInt(e.target.value) || 0 }))}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Total siswa di kelas"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Materi Pembelajaran
                </label>
                <textarea
                  value={formData.materials}
                  onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Deskripsi materi yang diajarkan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tugas/PR (Opsional)
                </label>
                <textarea
                  value={formData.homework}
                  onChange={(e) => setFormData(prev => ({ ...prev, homework: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tugas yang diberikan kepada siswa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Tambahan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Catatan, kendala, atau hal penting lainnya"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingLog ? 'Perbarui Jurnal' : 'Simpan Jurnal'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Journal List */}
      <div className="space-y-6">
        {teachingLogs.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Jurnal</h3>
            <p className="text-gray-500 mb-4">Mulai dokumentasikan aktivitas mengajar Anda</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jurnal Pertama
            </button>
          </div>
        ) : (
          teachingLogs.map((log) => (
            <div key={log.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {log.subject} - {log.class}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(log.date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(log.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {log.attendance}/{log.totalStudents} siswa
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <button
                      onClick={() => handleEdit(log)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Topik Pembelajaran:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{log.topic}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Materi:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{log.materials}</p>
                  </div>

                  {log.homework && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Tugas/PR:</h4>
                      <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                        {log.homework}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Catatan:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{log.notes}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Kehadiran: {((log.attendance / log.totalStudents) * 100).toFixed(1)}%
                    </span>
                    <span className="text-gray-500">
                      Dibuat: {new Date(log.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};