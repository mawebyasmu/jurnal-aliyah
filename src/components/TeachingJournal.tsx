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
  Trash2,
  UserCheck,
  UserX,
  Heart,
  FileX,
  AlertCircle,
  CheckCircle,
  Search,
  Filter
} from 'lucide-react';
import { User, TeachingLog, ClassSchedule, Student, StudentAttendance } from '../types';
import { dataService } from '../services/dataService';

interface TeachingJournalProps {
  user: User;
}

export const TeachingJournal: React.FC<TeachingJournalProps> = ({ user }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState<TeachingLog | null>(null);
  const [teachingLogs, setTeachingLogs] = useState<TeachingLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [schedules] = useState<ClassSchedule[]>([
    { id: '1', subject: 'Matematika', class: 'XII IPA 1', time: '07:00-08:30', day: 'Senin', room: 'R.12' },
    { id: '2', subject: 'Matematika', class: 'XII IPA 2', time: '08:30-10:00', day: 'Senin', room: 'R.13' },
    { id: '3', subject: 'Statistika', class: 'XII IPS 1', time: '10:15-11:45', day: 'Senin', room: 'R.15' },
  ]);

  const [formData, setFormData] = useState({
    scheduleId: '',
    subject: '',
    class: '',
    classId: '',
    topic: '',
    materials: '',
    attendance: 0,
    totalStudents: 0,
    notes: '',
    homework: ''
  });

  const [studentAttendance, setStudentAttendance] = useState<{ [key: string]: { status: 'present' | 'sick' | 'permission' | 'absent'; arrivalTime?: string; notes?: string } }>({});
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedClassStudents, setSelectedClassStudents] = useState<Student[]>([]);
  const [attendanceSearch, setAttendanceSearch] = useState('');

  useEffect(() => {
    loadTeachingLogs();
    loadStudents();
    loadClasses();
  }, [user.id]);

  const loadTeachingLogs = () => {
    const logs = dataService.getTeachingLogs();
    const userLogs = logs.filter(log => log.userId === user.id);
    setTeachingLogs(userLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const loadStudents = () => {
    const studentData = dataService.getStudents();
    setStudents(studentData);
  };

  const loadClasses = () => {
    const classData = dataService.getClasses();
    setClasses(classData);
  };

  const handleScheduleChange = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      // Find class by name
      const classData = classes.find(c => c.name === schedule.class);
      const classStudents = students.filter(s => s.classId === classData?.id && s.status === 'active');
      
      setFormData(prev => ({
        ...prev,
        scheduleId,
        subject: schedule.subject,
        class: schedule.class,
        classId: classData?.id || '',
        totalStudents: classStudents.length
      }));
      
      setSelectedClassStudents(classStudents);
      
      // Initialize attendance for all students as present
      const initialAttendance: { [key: string]: { status: 'present' | 'sick' | 'permission' | 'absent'; arrivalTime?: string; notes?: string } } = {};
      classStudents.forEach(student => {
        initialAttendance[student.id] = { status: 'present' };
      });
      setStudentAttendance(initialAttendance);
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'sick' | 'permission' | 'absent') => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleAttendanceNotes = (studentId: string, notes: string) => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const handleArrivalTime = (studentId: string, arrivalTime: string) => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        arrivalTime
      }
    }));
  };

  const calculateAttendanceSummary = () => {
    const summary = {
      present: 0,
      sick: 0,
      permission: 0,
      absent: 0
    };

    Object.values(studentAttendance).forEach(attendance => {
      summary[attendance.status]++;
    });

    return summary;
  };

  const markAllPresent = () => {
    const updatedAttendance: { [key: string]: { status: 'present' | 'sick' | 'permission' | 'absent'; arrivalTime?: string; notes?: string } } = {};
    selectedClassStudents.forEach(student => {
      updatedAttendance[student.id] = { status: 'present' };
    });
    setStudentAttendance(updatedAttendance);
  };

  const resetAttendance = () => {
    const resetAttendance: { [key: string]: { status: 'present' | 'sick' | 'permission' | 'absent'; arrivalTime?: string; notes?: string } } = {};
    selectedClassStudents.forEach(student => {
      resetAttendance[student.id] = { status: 'present' };
    });
    setStudentAttendance(resetAttendance);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date();
    const summary = calculateAttendanceSummary();
    
    // Create student attendance records
    const studentAttendanceRecords: StudentAttendance[] = Object.entries(studentAttendance).map(([studentId, attendance]) => ({
      id: `${Date.now()}-${studentId}`,
      studentId,
      teachingLogId: editingLog ? editingLog.id : Date.now().toString(),
      status: attendance.status,
      arrivalTime: attendance.arrivalTime,
      notes: attendance.notes,
      timestamp: now.toISOString()
    }));

    const logData: TeachingLog = {
      id: editingLog ? editingLog.id : Date.now().toString(),
      userId: user.id,
      date: now.toISOString(),
      scheduleId: formData.scheduleId,
      subject: formData.subject,
      class: formData.class,
      classId: formData.classId,
      topic: formData.topic,
      materials: formData.materials,
      attendance: summary.present,
      totalStudents: formData.totalStudents,
      notes: formData.notes,
      homework: formData.homework,
      createdAt: editingLog ? editingLog.createdAt : now.toISOString(),
      studentAttendance: studentAttendanceRecords,
      attendanceSummary: summary
    };

    if (editingLog) {
      dataService.updateTeachingLog(editingLog.id, logData);
    } else {
      dataService.addTeachingLog(logData);
    }

    // Save student attendance records
    studentAttendanceRecords.forEach(record => {
      dataService.addStudentAttendance(record);
    });

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
      classId: log.classId,
      topic: log.topic,
      materials: log.materials,
      attendance: log.attendance,
      totalStudents: log.totalStudents,
      notes: log.notes,
      homework: log.homework || ''
    });

    // Load existing student attendance
    if (log.studentAttendance) {
      const existingAttendance: { [key: string]: { status: 'present' | 'sick' | 'permission' | 'absent'; arrivalTime?: string; notes?: string } } = {};
      log.studentAttendance.forEach(attendance => {
        existingAttendance[attendance.studentId] = {
          status: attendance.status,
          arrivalTime: attendance.arrivalTime,
          notes: attendance.notes
        };
      });
      setStudentAttendance(existingAttendance);
    }

    // Load class students
    const classStudents = students.filter(s => s.classId === log.classId && s.status === 'active');
    setSelectedClassStudents(classStudents);
    
    setShowForm(true);
  };

  const handleDelete = (logId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
      const logs = dataService.getTeachingLogs();
      const filteredLogs = logs.filter(log => log.id !== logId);
      dataService.saveTeachingLogs(filteredLogs);
      loadTeachingLogs();
      alert('Jurnal berhasil dihapus!');
    }
  };

  const resetForm = () => {
    setFormData({
      scheduleId: '',
      subject: '',
      class: '',
      classId: '',
      topic: '',
      materials: '',
      attendance: 0,
      totalStudents: 0,
      notes: '',
      homework: ''
    });
    setStudentAttendance({});
    setSelectedClassStudents([]);
    setShowForm(false);
    setEditingLog(null);
    setShowAttendanceModal(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'sick': return <Heart className="h-4 w-4 text-red-600" />;
      case 'permission': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'absent': return <UserX className="h-4 w-4 text-gray-600" />;
      default: return <UserCheck className="h-4 w-4 text-green-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return 'Hadir';
      case 'sick': return 'Sakit';
      case 'permission': return 'Izin';
      case 'absent': return 'Alpa';
      default: return 'Hadir';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'sick': return 'bg-red-100 text-red-800 border-red-200';
      case 'permission': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'absent': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const filteredStudents = selectedClassStudents.filter(student =>
    student.name.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
    student.nis.includes(attendanceSearch)
  );

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
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
              </div>

              {/* Student Attendance Section */}
              {selectedClassStudents.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Absensi Siswa</h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={markAllPresent}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Tandai Semua Hadir
                      </button>
                      <button
                        type="button"
                        onClick={resetAttendance}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={attendanceSearch}
                        onChange={(e) => setAttendanceSearch(e.target.value)}
                        placeholder="Cari siswa..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Attendance Summary */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {Object.entries(calculateAttendanceSummary()).map(([status, count]) => (
                      <div key={status} className={`p-3 rounded-lg border ${getStatusColor(status)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getStatusIcon(status)}
                            <span className="ml-2 text-sm font-medium">{getStatusLabel(status)}</span>
                          </div>
                          <span className="text-lg font-bold">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Student List */}
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-3">
                      {filteredStudents.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-xs">
                                {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-500">NIS: {student.nis}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Status Buttons */}
                            <div className="flex gap-1">
                              {['present', 'sick', 'permission', 'absent'].map((status) => (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => handleAttendanceChange(student.id, status as any)}
                                  className={`p-2 rounded-lg border transition-colors ${
                                    studentAttendance[student.id]?.status === status
                                      ? getStatusColor(status)
                                      : 'bg-white border-gray-200 hover:bg-gray-50'
                                  }`}
                                  title={getStatusLabel(status)}
                                >
                                  {getStatusIcon(status)}
                                </button>
                              ))}
                            </div>

                            {/* Arrival Time for Late Students */}
                            {studentAttendance[student.id]?.status === 'present' && (
                              <input
                                type="time"
                                value={studentAttendance[student.id]?.arrivalTime || ''}
                                onChange={(e) => handleArrivalTime(student.id, e.target.value)}
                                className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Jam tiba"
                              />
                            )}

                            {/* Notes */}
                            {studentAttendance[student.id]?.status !== 'present' && (
                              <input
                                type="text"
                                value={studentAttendance[student.id]?.notes || ''}
                                onChange={(e) => handleAttendanceNotes(student.id, e.target.value)}
                                className="w-32 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Keterangan..."
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

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
                        {log.attendance}/{log.totalStudents} siswa hadir
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

                {/* Attendance Summary */}
                {log.attendanceSummary && (
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {Object.entries(log.attendanceSummary).map(([status, count]) => (
                      <div key={status} className={`p-2 rounded-lg border text-center ${getStatusColor(status)}`}>
                        <div className="flex items-center justify-center mb-1">
                          {getStatusIcon(status)}
                        </div>
                        <div className="text-xs font-medium">{getStatusLabel(status)}</div>
                        <div className="text-sm font-bold">{count}</div>
                      </div>
                    ))}
                  </div>
                )}

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