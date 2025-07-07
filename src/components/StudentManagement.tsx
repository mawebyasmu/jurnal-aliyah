import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  X,
  Eye,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Settings,
  ArrowLeft,
  GraduationCap,
  UserPlus
} from 'lucide-react';
import { Student, Class } from '../types';
import { dataService } from '../services/dataService';

interface StudentManagementProps {
  onBack: () => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({ onBack }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'graduated' | 'transferred'>('all');
  const [showModal, setShowModal] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nis: '',
    classId: '',
    email: '',
    phone: '',
    address: '',
    parentName: '',
    parentPhone: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female',
    status: 'active' as 'active' | 'inactive' | 'graduated' | 'transferred'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    
    const handleStudentsUpdate = (updatedStudents: Student[]) => {
      setStudents(updatedStudents);
    };
    
    dataService.subscribe('studentsUpdated', handleStudentsUpdate);
    
    return () => {
      dataService.unsubscribe('studentsUpdated', handleStudentsUpdate);
    };
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, classFilter, statusFilter]);

  const loadData = () => {
    const studentData = dataService.getStudents();
    const classData = dataService.getClasses();
    setStudents(studentData);
    setClasses(classData);
  };

  const filterStudents = () => {
    let filtered = students;

    if (classFilter !== 'all') {
      filtered = filtered.filter(student => student.classId === classFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nis.includes(searchTerm) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  };

  const handleAddStudent = () => {
    setFormData({
      name: '',
      nis: '',
      classId: '',
      email: '',
      phone: '',
      address: '',
      parentName: '',
      parentPhone: '',
      birthDate: '',
      gender: 'male',
      status: 'active'
    });
    setSelectedStudent(null);
    setShowModal('add');
  };

  const handleEditStudent = (student: Student) => {
    setFormData({
      name: student.name,
      nis: student.nis,
      classId: student.classId,
      email: student.email || '',
      phone: student.phone || '',
      address: student.address || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      birthDate: student.birthDate || '',
      gender: student.gender,
      status: student.status
    });
    setSelectedStudent(student);
    setShowModal('edit');
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowModal('view');
  };

  const handleDeleteStudent = async (student: Student) => {
    if (confirm(`Apakah Anda yakin ingin menghapus siswa ${student.name}?`)) {
      setLoading(true);
      try {
        const success = dataService.deleteStudent(student.id);
        if (success) {
          dataService.log('info', `Student deleted: ${student.name}`, { studentId: student.id });
          alert('Siswa berhasil dihapus!');
        } else {
          alert('Gagal menghapus siswa!');
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Terjadi kesalahan saat menghapus siswa!');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const studentData = {
        name: formData.name,
        nis: formData.nis,
        classId: formData.classId,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        birthDate: formData.birthDate,
        gender: formData.gender,
        status: formData.status,
        enrollmentDate: new Date().toISOString().split('T')[0]
      };

      if (showModal === 'add') {
        const newStudent = dataService.addStudent(studentData);
        dataService.log('info', `New student created: ${newStudent.name}`, { studentId: newStudent.id });
        alert('Siswa berhasil ditambahkan!');
      } else if (showModal === 'edit' && selectedStudent) {
        const updatedStudent = dataService.updateStudent(selectedStudent.id, studentData);
        if (updatedStudent) {
          dataService.log('info', `Student updated: ${updatedStudent.name}`, { studentId: updatedStudent.id });
          alert('Siswa berhasil diperbarui!');
        }
      }

      setShowModal(null);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Terjadi kesalahan saat menyimpan siswa!');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (student: Student, newStatus: 'active' | 'inactive' | 'graduated' | 'transferred') => {
    setLoading(true);
    try {
      const updatedStudent = dataService.updateStudent(student.id, { status: newStatus });
      if (updatedStudent) {
        dataService.log('info', `Student status changed: ${student.name} -> ${newStatus}`, { 
          studentId: student.id, 
          oldStatus: student.status,
          newStatus 
        });
        alert(`Status siswa berhasil diubah menjadi ${newStatus}!`);
      }
    } catch (error) {
      console.error('Error updating student status:', error);
      alert('Terjadi kesalahan saat mengubah status siswa!');
    } finally {
      setLoading(false);
    }
  };

  const exportStudents = () => {
    try {
      const csvData = dataService.exportData('students', 'csv');
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      dataService.log('info', 'Students data exported', { format: 'csv', count: students.length });
    } catch (error) {
      console.error('Error exporting students:', error);
      alert('Terjadi kesalahan saat mengekspor data!');
    }
  };

  const getStudentStats = () => {
    const total = students.length;
    const active = students.filter(s => s.status === 'active').length;
    const male = students.filter(s => s.gender === 'male').length;
    const female = students.filter(s => s.gender === 'female').length;
    const recentlyEnrolled = students.filter(s => {
      if (!s.enrollmentDate) return false;
      const enrollDate = new Date(s.enrollmentDate);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return enrollDate > thirtyDaysAgo;
    }).length;

    return { total, active, male, female, recentlyEnrolled };
  };

  const getClassName = (classId: string) => {
    const classData = classes.find(c => c.id === classId);
    return classData ? classData.name : 'Tidak ada kelas';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Tidak Aktif';
      case 'graduated': return 'Lulus';
      case 'transferred': return 'Pindah';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'graduated': return 'bg-blue-100 text-blue-800';
      case 'transferred': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = getStudentStats();

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
                <h1 className="text-xl font-semibold text-gray-900">Manajemen Siswa</h1>
                <p className="text-sm text-gray-600">Kelola data siswa dan informasi akademik</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportStudents}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={handleAddStudent}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Siswa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-purple-50 p-3 rounded-lg">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Laki-laki</p>
                <p className="text-2xl font-bold text-purple-600">{stats.male}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-pink-50 p-3 rounded-lg">
                <User className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Perempuan</p>
                <p className="text-2xl font-bold text-pink-600">{stats.female}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <UserPlus className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Baru (30 hari)</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.recentlyEnrolled}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Siswa
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nama, NIS, email, atau orang tua..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Kelas
              </label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Kelas</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
                <option value="graduated">Lulus</option>
                <option value="transferred">Pindah</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Menampilkan {filteredStudents.length} dari {students.length} siswa
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Siswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis Kelamin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orang Tua
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada siswa yang ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                            <div className="text-xs text-gray-400">NIS: {student.nis}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getClassName(student.classId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{student.parentName}</div>
                          <div className="text-gray-500">{student.parentPhone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                          {getStatusLabel(student.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewStudent(student)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <div className="relative group">
                            <button className="p-1 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors">
                              <Settings className="h-4 w-4" />
                            </button>
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 hidden group-hover:block min-w-[120px]">
                              <button
                                onClick={() => handleStatusChange(student, 'active')}
                                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Aktifkan
                              </button>
                              <button
                                onClick={() => handleStatusChange(student, 'inactive')}
                                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Nonaktifkan
                              </button>
                              <button
                                onClick={() => handleStatusChange(student, 'graduated')}
                                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Lulus
                              </button>
                              <button
                                onClick={() => handleStatusChange(student, 'transferred')}
                                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Pindah
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteStudent(student)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Hapus"
                            disabled={loading}
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {showModal === 'add' ? 'Tambah Siswa Baru' : 
                   showModal === 'edit' ? 'Edit Siswa' : 'Detail Siswa'}
                </h2>
                <button
                  onClick={() => setShowModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showModal === 'view' && selectedStudent ? (
              <div className="p-6 space-y-6">
                <div className="flex items-center">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xl">
                      {selectedStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedStudent.name}</h3>
                    <p className="text-gray-600">{selectedStudent.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">NIS: {selectedStudent.nis}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedStudent.status)}`}>
                        {getStatusLabel(selectedStudent.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                    <p className="text-gray-900">{getClassName(selectedStudent.classId)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                    <p className="text-gray-900">{selectedStudent.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                  {selectedStudent.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                      <p className="text-gray-900">{selectedStudent.phone}</p>
                    </div>
                  )}
                  {selectedStudent.birthDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                      <p className="text-gray-900">{new Date(selectedStudent.birthDate).toLocaleDateString('id-ID')}</p>
                    </div>
                  )}
                  {selectedStudent.parentName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Orang Tua</label>
                      <p className="text-gray-900">{selectedStudent.parentName}</p>
                    </div>
                  )}
                  {selectedStudent.parentPhone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telepon Orang Tua</label>
                      <p className="text-gray-900">{selectedStudent.parentPhone}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Masuk</label>
                    <p className="text-gray-900">{new Date(selectedStudent.enrollmentDate).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>

                {selectedStudent.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                    <p className="text-gray-900">{selectedStudent.address}</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NIS *
                    </label>
                    <input
                      type="text"
                      value={formData.nis}
                      onChange={(e) => setFormData(prev => ({ ...prev, nis: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kelas *
                    </label>
                    <select
                      value={formData.classId}
                      onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Kelas</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Kelamin *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                      <option value="graduated">Lulus</option>
                      <option value="transferred">Pindah</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Orang Tua
                    </label>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telepon Orang Tua
                    </label>
                    <input
                      type="tel"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {showModal === 'add' ? 'Tambah Siswa' : 'Simpan Perubahan'}
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};