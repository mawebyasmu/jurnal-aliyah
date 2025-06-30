import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  GraduationCap,
  Target,
  Award,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { dataService } from '../services/dataService';

interface AcademicSettingsProps {
  onBack: () => void;
}

interface AcademicPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: 'semester' | 'quarter' | 'trimester';
  isActive: boolean;
}

interface GradingScale {
  id: string;
  grade: string;
  minScore: number;
  maxScore: number;
  description: string;
}

interface Curriculum {
  id: string;
  name: string;
  year: string;
  description: string;
  subjects: string[];
  isActive: boolean;
}

export const AcademicSettings: React.FC<AcademicSettingsProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'periods' | 'grading' | 'curriculum' | 'workload'>('periods');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([
    {
      id: '1',
      name: 'Semester Ganjil 2024/2025',
      startDate: '2024-07-15',
      endDate: '2024-12-20',
      type: 'semester',
      isActive: true
    },
    {
      id: '2',
      name: 'Semester Genap 2024/2025',
      startDate: '2025-01-06',
      endDate: '2025-06-20',
      type: 'semester',
      isActive: false
    }
  ]);

  const [gradingScale, setGradingScale] = useState<GradingScale[]>([
    { id: '1', grade: 'A', minScore: 90, maxScore: 100, description: 'Sangat Baik' },
    { id: '2', grade: 'B', minScore: 80, maxScore: 89, description: 'Baik' },
    { id: '3', grade: 'C', minScore: 70, maxScore: 79, description: 'Cukup' },
    { id: '4', grade: 'D', minScore: 60, maxScore: 69, description: 'Kurang' },
    { id: '5', grade: 'E', minScore: 0, maxScore: 59, description: 'Sangat Kurang' }
  ]);

  const [curriculums, setCurriculums] = useState<Curriculum[]>([
    {
      id: '1',
      name: 'Kurikulum Merdeka',
      year: '2024',
      description: 'Kurikulum Merdeka untuk SMA',
      subjects: ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Fisika', 'Kimia', 'Biologi'],
      isActive: true
    }
  ]);

  const [workloadSettings, setWorkloadSettings] = useState({
    maxHoursPerWeek: 24,
    maxClassesPerDay: 6,
    minBreakBetweenClasses: 15,
    maxConsecutiveHours: 4
  });

  const [periodForm, setPeriodForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    type: 'semester' as 'semester' | 'quarter' | 'trimester',
    isActive: false
  });

  const [gradeForm, setGradeForm] = useState({
    grade: '',
    minScore: 0,
    maxScore: 100,
    description: ''
  });

  const [curriculumForm, setCurriculumForm] = useState({
    name: '',
    year: '',
    description: '',
    subjects: [] as string[],
    isActive: false
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save academic settings to dataService
      const academicSettings = {
        periods: academicPeriods,
        grading: gradingScale,
        curriculums: curriculums,
        workload: workloadSettings
      };
      
      localStorage.setItem('academicSettings', JSON.stringify(academicSettings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      dataService.log('info', 'Academic settings updated', academicSettings);
    } catch (error) {
      console.error('Error saving academic settings:', error);
      alert('Terjadi kesalahan saat menyimpan pengaturan!');
    } finally {
      setLoading(false);
    }
  };

  // Academic Periods Functions
  const handleAddPeriod = () => {
    setPeriodForm({ name: '', startDate: '', endDate: '', type: 'semester', isActive: false });
    setEditingItem(null);
    setShowModal('period');
  };

  const handleEditPeriod = (period: AcademicPeriod) => {
    setPeriodForm({
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
      type: period.type,
      isActive: period.isActive
    });
    setEditingItem(period);
    setShowModal('period');
  };

  const handleDeletePeriod = (periodId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus periode akademik ini?')) {
      setAcademicPeriods(prev => prev.filter(p => p.id !== periodId));
    }
  };

  const handleSubmitPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      setAcademicPeriods(prev => prev.map(p => 
        p.id === editingItem.id ? { ...p, ...periodForm } : p
      ));
    } else {
      const newPeriod: AcademicPeriod = {
        id: Date.now().toString(),
        ...periodForm
      };
      setAcademicPeriods(prev => [...prev, newPeriod]);
    }
    
    setShowModal(null);
    setEditingItem(null);
  };

  // Grading Scale Functions
  const handleAddGrade = () => {
    setGradeForm({ grade: '', minScore: 0, maxScore: 100, description: '' });
    setEditingItem(null);
    setShowModal('grade');
  };

  const handleEditGrade = (grade: GradingScale) => {
    setGradeForm({
      grade: grade.grade,
      minScore: grade.minScore,
      maxScore: grade.maxScore,
      description: grade.description
    });
    setEditingItem(grade);
    setShowModal('grade');
  };

  const handleDeleteGrade = (gradeId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus skala nilai ini?')) {
      setGradingScale(prev => prev.filter(g => g.id !== gradeId));
    }
  };

  const handleSubmitGrade = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      setGradingScale(prev => prev.map(g => 
        g.id === editingItem.id ? { ...g, ...gradeForm } : g
      ));
    } else {
      const newGrade: GradingScale = {
        id: Date.now().toString(),
        ...gradeForm
      };
      setGradingScale(prev => [...prev, newGrade]);
    }
    
    setShowModal(null);
    setEditingItem(null);
  };

  // Curriculum Functions
  const handleAddCurriculum = () => {
    setCurriculumForm({ name: '', year: '', description: '', subjects: [], isActive: false });
    setEditingItem(null);
    setShowModal('curriculum');
  };

  const handleEditCurriculum = (curriculum: Curriculum) => {
    setCurriculumForm({
      name: curriculum.name,
      year: curriculum.year,
      description: curriculum.description,
      subjects: curriculum.subjects,
      isActive: curriculum.isActive
    });
    setEditingItem(curriculum);
    setShowModal('curriculum');
  };

  const handleDeleteCurriculum = (curriculumId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kurikulum ini?')) {
      setCurriculums(prev => prev.filter(c => c.id !== curriculumId));
    }
  };

  const handleSubmitCurriculum = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      setCurriculums(prev => prev.map(c => 
        c.id === editingItem.id ? { ...c, ...curriculumForm } : c
      ));
    } else {
      const newCurriculum: Curriculum = {
        id: Date.now().toString(),
        ...curriculumForm
      };
      setCurriculums(prev => [...prev, newCurriculum]);
    }
    
    setShowModal(null);
    setEditingItem(null);
  };

  const availableSubjects = [
    'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Fisika', 'Kimia', 'Biologi',
    'Sejarah', 'Geografi', 'Ekonomi', 'Sosiologi', 'Seni Budaya', 'Pendidikan Jasmani',
    'Pendidikan Agama', 'PKn', 'Prakarya', 'Informatika'
  ];

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
                <h1 className="text-xl font-semibold text-gray-900">Pengaturan Akademik</h1>
                <p className="text-sm text-gray-600">Kelola periode, kurikulum, dan sistem penilaian</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('periods')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'periods'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Periode Akademik
              </button>
              <button
                onClick={() => setActiveTab('grading')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'grading'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Award className="h-4 w-4 inline mr-2" />
                Skala Penilaian
              </button>
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'curriculum'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpen className="h-4 w-4 inline mr-2" />
                Kurikulum
              </button>
              <button
                onClick={() => setActiveTab('workload')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'workload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="h-4 w-4 inline mr-2" />
                Beban Mengajar
              </button>
            </nav>
          </div>
        </div>

        {/* Academic Periods Tab */}
        {activeTab === 'periods' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Periode Akademik</h2>
                <p className="text-sm text-gray-600 mt-1">Kelola semester, quarter, atau trimester</p>
              </div>
              <button
                onClick={handleAddPeriod}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Periode
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Periode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Mulai</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Selesai</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {academicPeriods.map((period) => (
                    <tr key={period.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{period.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{period.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(period.startDate).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(period.endDate).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          period.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {period.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditPeriod(period)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePeriod(period.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
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
        )}

        {/* Grading Scale Tab */}
        {activeTab === 'grading' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Skala Penilaian</h2>
                <p className="text-sm text-gray-600 mt-1">Kelola sistem grading dan konversi nilai</p>
              </div>
              <button
                onClick={handleAddGrade}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Grade
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rentang Nilai</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {gradingScale.map((grade) => (
                    <tr key={grade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{grade.grade}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {grade.minScore} - {grade.maxScore}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{grade.description}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditGrade(grade)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGrade(grade.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
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
        )}

        {/* Curriculum Tab */}
        {activeTab === 'curriculum' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Kurikulum</h2>
                <p className="text-sm text-gray-600 mt-1">Kelola kurikulum dan mata pelajaran</p>
              </div>
              <button
                onClick={handleAddCurriculum}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kurikulum
              </button>
            </div>
            <div className="p-6">
              {curriculums.map((curriculum) => (
                <div key={curriculum.id} className="border border-gray-200 rounded-lg p-6 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{curriculum.name}</h3>
                      <p className="text-sm text-gray-600">Tahun: {curriculum.year}</p>
                      <p className="text-sm text-gray-600 mt-1">{curriculum.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        curriculum.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {curriculum.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                      <button
                        onClick={() => handleEditCurriculum(curriculum)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCurriculum(curriculum.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Mata Pelajaran:</h4>
                    <div className="flex flex-wrap gap-2">
                      {curriculum.subjects.map((subject, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs bg-blue-50 text-blue-700">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workload Tab */}
        {activeTab === 'workload' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Beban Mengajar</h2>
              <p className="text-sm text-gray-600 mt-1">Atur batasan jam mengajar dan jadwal guru</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maksimal Jam per Minggu
                  </label>
                  <input
                    type="number"
                    value={workloadSettings.maxHoursPerWeek}
                    onChange={(e) => setWorkloadSettings(prev => ({
                      ...prev,
                      maxHoursPerWeek: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="40"
                  />
                  <p className="text-xs text-gray-500 mt-1">Jam mengajar maksimal per guru per minggu</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maksimal Kelas per Hari
                  </label>
                  <input
                    type="number"
                    value={workloadSettings.maxClassesPerDay}
                    onChange={(e) => setWorkloadSettings(prev => ({
                      ...prev,
                      maxClassesPerDay: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Jumlah kelas maksimal per guru per hari</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimal Istirahat (menit)
                  </label>
                  <input
                    type="number"
                    value={workloadSettings.minBreakBetweenClasses}
                    onChange={(e) => setWorkloadSettings(prev => ({
                      ...prev,
                      minBreakBetweenClasses: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="60"
                  />
                  <p className="text-xs text-gray-500 mt-1">Waktu istirahat minimal antar kelas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maksimal Jam Berturut-turut
                  </label>
                  <input
                    type="number"
                    value={workloadSettings.maxConsecutiveHours}
                    onChange={(e) => setWorkloadSettings(prev => ({
                      ...prev,
                      maxConsecutiveHours: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="8"
                  />
                  <p className="text-xs text-gray-500 mt-1">Jam mengajar berturut-turut maksimal</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Catatan Beban Mengajar:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Pengaturan ini akan mempengaruhi penjadwalan otomatis</li>
                      <li>Pastikan sesuai dengan regulasi dan kebijakan sekolah</li>
                      <li>Perubahan akan berlaku untuk periode akademik berikutnya</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal === 'period' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit Periode Akademik' : 'Tambah Periode Akademik'}
                </h2>
                <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitPeriod} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Periode *</label>
                <input
                  type="text"
                  value={periodForm.name}
                  onChange={(e) => setPeriodForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Semester Ganjil 2024/2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jenis *</label>
                <select
                  value={periodForm.type}
                  onChange={(e) => setPeriodForm(prev => ({ ...prev, type: e.target.value as any }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="semester">Semester</option>
                  <option value="quarter">Quarter</option>
                  <option value="trimester">Trimester</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai *</label>
                  <input
                    type="date"
                    value={periodForm.startDate}
                    onChange={(e) => setPeriodForm(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai *</label>
                  <input
                    type="date"
                    value={periodForm.endDate}
                    onChange={(e) => setPeriodForm(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={periodForm.isActive}
                  onChange={(e) => setPeriodForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Aktifkan periode ini</span>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

      {showModal === 'grade' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit Grade' : 'Tambah Grade Baru'}
                </h2>
                <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitGrade} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade *</label>
                <input
                  type="text"
                  value={gradeForm.grade}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, grade: e.target.value.toUpperCase() }))}
                  required
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="A"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nilai Minimum *</label>
                  <input
                    type="number"
                    value={gradeForm.minScore}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, minScore: parseInt(e.target.value) || 0 }))}
                    required
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nilai Maksimum *</label>
                  <input
                    type="number"
                    value={gradeForm.maxScore}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 0 }))}
                    required
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi *</label>
                <input
                  type="text"
                  value={gradeForm.description}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Sangat Baik"
                />
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

      {showModal === 'curriculum' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit Kurikulum' : 'Tambah Kurikulum Baru'}
                </h2>
                <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitCurriculum} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kurikulum *</label>
                  <input
                    type="text"
                    value={curriculumForm.name}
                    onChange={(e) => setCurriculumForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Kurikulum Merdeka"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tahun *</label>
                  <input
                    type="text"
                    value={curriculumForm.year}
                    onChange={(e) => setCurriculumForm(prev => ({ ...prev, year: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="2024"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={curriculumForm.description}
                  onChange={(e) => setCurriculumForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Deskripsi kurikulum..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mata Pelajaran</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {availableSubjects.map(subject => (
                    <label key={subject} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={curriculumForm.subjects.includes(subject)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCurriculumForm(prev => ({
                              ...prev,
                              subjects: [...prev.subjects, subject]
                            }));
                          } else {
                            setCurriculumForm(prev => ({
                              ...prev,
                              subjects: prev.subjects.filter(s => s !== subject)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={curriculumForm.isActive}
                  onChange={(e) => setCurriculumForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Aktifkan kurikulum ini</span>
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