import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  ArrowLeft,
  BookOpen,
  MapPin,
  UserCheck,
  Clock,
  School,
  GraduationCap
} from 'lucide-react';
import { dataService } from '../services/dataService';

interface ClassManagementProps {
  onBack: () => void;
}

interface Class {
  id: string;
  name: string;
  capacity: number;
  room: string;
  teacherId: string;
  subjects: string[];
  students: number;
  grade: string;
  academicYear: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  department: string;
  description?: string;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({ onBack }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState<'class' | 'subject' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects'>('classes');
  const [loading, setLoading] = useState(false);

  const [classForm, setClassForm] = useState({
    name: '',
    capacity: 30,
    room: '',
    teacherId: '',
    subjects: [] as string[],
    students: 0,
    grade: '',
    academicYear: '2024/2025'
  });

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    credits: 3,
    department: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const classData = dataService.getClasses();
      const subjectData = dataService.getSubjects();
      const teacherData = dataService.getUsers().filter(u => u.role === 'teacher');
      
      setClasses(classData);
      setSubjects(subjectData);
      setTeachers(teacherData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddClass = () => {
    setClassForm({
      name: '',
      capacity: 30,
      room: '',
      teacherId: '',
      subjects: [],
      students: 0,
      grade: '',
      academicYear: '2024/2025'
    });
    setEditingItem(null);
    setShowModal('class');
  };

  const handleEditClass = (classItem: Class) => {
    setClassForm({
      name: classItem.name,
      capacity: classItem.capacity,
      room: classItem.room,
      teacherId: classItem.teacherId,
      subjects: classItem.subjects,
      students: classItem.students,
      grade: classItem.grade,
      academicYear: classItem.academicYear
    });
    setEditingItem(classItem);
    setShowModal('class');
  };

  const handleDeleteClass = (classId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
      const success = dataService.deleteClass(classId);
      if (success) {
        loadData();
        alert('Kelas berhasil dihapus!');
      } else {
        alert('Gagal menghapus kelas!');
      }
    }
  };

  const handleSubmitClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingItem) {
        const updated = dataService.updateClass(editingItem.id, classForm);
        if (updated) {
          alert('Kelas berhasil diperbarui!');
        }
      } else {
        const newClass = dataService.addClass(classForm);
        alert('Kelas berhasil ditambahkan!');
      }
      
      setShowModal(null);
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error('Error saving class:', error);
      alert('Terjadi kesalahan saat menyimpan kelas!');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = () => {
    setSubjectForm({
      name: '',
      code: '',
      credits: 3,
      department: '',
      description: ''
    });
    setEditingItem(null);
    setShowModal('subject');
  };

  const handleEditSubject = (subject: Subject) => {
    setSubjectForm({
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      department: subject.department,
      description: subject.description || ''
    });
    setEditingItem(subject);
    setShowModal('subject');
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
      const success = dataService.deleteSubject(subjectId);
      if (success) {
        loadData();
        alert('Mata pelajaran berhasil dihapus!');
      } else {
        alert('Gagal menghapus mata pelajaran!');
      }
    }
  };

  const handleSubmitSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingItem) {
        const updated = dataService.updateSubject(editingItem.id, subjectForm);
        if (updated) {
          alert('Mata pelajaran berhasil diperbarui!');
        }
      } else {
        const newSubject = dataService.addSubject(subjectForm);
        alert('Mata pelajaran berhasil ditambahkan!');
      }
      
      setShowModal(null);
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error('Error saving subject:', error);
      alert('Terjadi kesalahan saat menyimpan mata pelajaran!');
    } finally {
      setLoading(false);
    }
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Tidak ada';
  };

  const departments = ['MIPA', 'IPS', 'Bahasa', 'Seni', 'Olahraga', 'Agama', 'Kewarganegaraan'];
  const grades = ['X', 'XI', 'XII'];
  const rooms = ['R.01', 'R.02', 'R.03', 'R.04', 'R.05', 'R.06', 'R.07', 'R.08', 'R.09', 'R.10', 'R.11', 'R.12', 'R.13', 'R.14', 'R.15', 'Lab Komputer', 'Lab Fisika', 'Lab Kimia', 'Lab Biologi'];

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
                <h1 className="text-xl font-semibold text-gray-900">Manajemen Kelas & Mata Pelajaran</h1>
                <p className="text-sm text-gray-600">Kelola kelas, mata pelajaran, dan penugasan guru</p>
              </div>
            </div>
            <button
              onClick={activeTab === 'classes' ? handleAddClass : handleAddSubject}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === 'classes' ? 'Tambah Kelas' : 'Tambah Mata Pelajaran'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('classes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'classes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Daftar Kelas
              </button>
              <button
                onClick={() => setActiveTab('subjects')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'subjects'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpen className="h-4 w-4 inline mr-2" />
                Mata Pelajaran
              </button>
            </nav>
          </div>
        </div>

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Daftar Kelas</h2>
              <p className="text-sm text-gray-600 mt-1">Total: {classes.length} kelas</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wali Kelas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruangan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kapasitas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mata Pelajaran</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {classes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Belum ada kelas yang terdaftar
                      </td>
                    </tr>
                  ) : (
                    classes.map((classItem) => (
                      <tr key={classItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{classItem.name}</div>
                            <div className="text-sm text-gray-500">Tingkat {classItem.grade} • {classItem.academicYear}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {getTeacherName(classItem.teacherId)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            {classItem.room}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 text-gray-400 mr-1" />
                            {classItem.students}/{classItem.capacity}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex flex-wrap gap-1">
                            {classItem.subjects.slice(0, 2).map((subject, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700">
                                {subject}
                              </span>
                            ))}
                            {classItem.subjects.length > 2 && (
                              <span className="text-xs text-gray-500">+{classItem.subjects.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClass(classItem)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClass(classItem.id)}
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

        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Mata Pelajaran</h2>
              <p className="text-sm text-gray-600 mt-1">Total: {subjects.length} mata pelajaran</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mata Pelajaran</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departemen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subjects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Belum ada mata pelajaran yang terdaftar
                      </td>
                    </tr>
                  ) : (
                    subjects.map((subject) => (
                      <tr key={subject.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {subject.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {subject.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {subject.credits}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {subject.department}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {subject.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditSubject(subject)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(subject.id)}
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

      {/* Modals */}
      {showModal === 'class' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit Kelas' : 'Tambah Kelas Baru'}
                </h2>
                <button
                  onClick={() => setShowModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitClass} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Kelas *
                  </label>
                  <input
                    type="text"
                    value={classForm.name}
                    onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: XII IPA 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tingkat *
                  </label>
                  <select
                    value={classForm.grade}
                    onChange={(e) => setClassForm(prev => ({ ...prev, grade: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Tingkat</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ruangan *
                  </label>
                  <select
                    value={classForm.room}
                    onChange={(e) => setClassForm(prev => ({ ...prev, room: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Ruangan</option>
                    {rooms.map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wali Kelas
                  </label>
                  <select
                    value={classForm.teacherId}
                    onChange={(e) => setClassForm(prev => ({ ...prev, teacherId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Wali Kelas</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kapasitas *
                  </label>
                  <input
                    type="number"
                    value={classForm.capacity}
                    onChange={(e) => setClassForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                    required
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Siswa Saat Ini
                  </label>
                  <input
                    type="number"
                    value={classForm.students}
                    onChange={(e) => setClassForm(prev => ({ ...prev, students: parseInt(e.target.value) || 0 }))}
                    min="0"
                    max={classForm.capacity}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tahun Akademik
                  </label>
                  <input
                    type="text"
                    value={classForm.academicYear}
                    onChange={(e) => setClassForm(prev => ({ ...prev, academicYear: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2024/2025"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mata Pelajaran
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {subjects.map(subject => (
                    <label key={subject.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={classForm.subjects.includes(subject.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setClassForm(prev => ({
                              ...prev,
                              subjects: [...prev.subjects, subject.name]
                            }));
                          } else {
                            setClassForm(prev => ({
                              ...prev,
                              subjects: prev.subjects.filter(s => s !== subject.name)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{subject.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Menyimpan...' : (editingItem ? 'Perbarui Kelas' : 'Simpan Kelas')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'subject' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
                </h2>
                <button
                  onClick={() => setShowModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitSubject} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Mata Pelajaran *
                </label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Matematika"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode *
                  </label>
                  <input
                    type="text"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MTK"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKS *
                  </label>
                  <input
                    type="number"
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
                    required
                    min="1"
                    max="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departemen *
                </label>
                <select
                  value={subjectForm.department}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, department: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Departemen</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi mata pelajaran..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Menyimpan...' : (editingItem ? 'Perbarui' : 'Simpan')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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