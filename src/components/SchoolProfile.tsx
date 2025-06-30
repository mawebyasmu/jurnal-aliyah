import React, { useState, useEffect } from 'react';
import {
  School,
  MapPin,
  Phone,
  Mail,
  Save,
  ArrowLeft,
  Building,
  Target,
  Eye,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  X,
  CheckCircle
} from 'lucide-react';
import { dataService } from '../services/dataService';

interface SchoolProfileProps {
  onBack: () => void;
}

interface Branch {
  id: string;
  name: string;
  address: string;
}

export const SchoolProfile: React.FC<SchoolProfileProps> = ({ onBack }) => {
  const [settings, setSettings] = useState({
    name: '',
    logo: '',
    address: '',
    phone: '',
    email: '',
    mission: '',
    vision: '',
    academicYear: '',
    branches: [] as Branch[]
  });
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState({ name: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const systemSettings = dataService.getSettings();
      setSettings(systemSettings.school);
    } catch (error) {
      console.error('Error loading school settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const systemSettings = dataService.getSettings();
      systemSettings.school = settings;
      dataService.saveSettings(systemSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      dataService.log('info', 'School profile updated', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Terjadi kesalahan saat menyimpan pengaturan!');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = () => {
    setBranchForm({ name: '', address: '' });
    setEditingBranch(null);
    setShowBranchModal(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setBranchForm({ name: branch.name, address: branch.address });
    setEditingBranch(branch);
    setShowBranchModal(true);
  };

  const handleDeleteBranch = (branchId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus cabang ini?')) {
      setSettings(prev => ({
        ...prev,
        branches: prev.branches.filter(b => b.id !== branchId)
      }));
    }
  };

  const handleSubmitBranch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBranch) {
      setSettings(prev => ({
        ...prev,
        branches: prev.branches.map(b => 
          b.id === editingBranch.id 
            ? { ...b, ...branchForm }
            : b
        )
      }));
    } else {
      const newBranch: Branch = {
        id: Date.now().toString(),
        ...branchForm
      };
      setSettings(prev => ({
        ...prev,
        branches: [...prev.branches, newBranch]
      }));
    }
    
    setShowBranchModal(false);
    setEditingBranch(null);
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
                <h1 className="text-xl font-semibold text-gray-900">Profil Sekolah</h1>
                <p className="text-sm text-gray-600">Kelola informasi dan identitas sekolah</p>
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
                {loading ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <School className="h-5 w-5 mr-2 text-blue-600" />
                Informasi Dasar
              </h2>
              <p className="text-sm text-gray-600 mt-1">Data identitas dan kontak sekolah</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Sekolah *
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nama lengkap sekolah"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tahun Akademik
                  </label>
                  <input
                    type="text"
                    value={settings.academicYear}
                    onChange={(e) => setSettings(prev => ({ ...prev, academicYear: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2024/2025"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Alamat Lengkap
                </label>
                <textarea
                  value={settings.address}
                  onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Alamat lengkap sekolah"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="021-12345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="info@sekolah.sch.id"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vision & Mission */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-600" />
                Visi & Misi
              </h2>
              <p className="text-sm text-gray-600 mt-1">Tujuan dan cita-cita institusi</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Eye className="h-4 w-4 inline mr-1" />
                  Visi
                </label>
                <textarea
                  value={settings.vision}
                  onChange={(e) => setSettings(prev => ({ ...prev, vision: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Visi sekolah untuk masa depan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="h-4 w-4 inline mr-1" />
                  Misi
                </label>
                <textarea
                  value={settings.mission}
                  onChange={(e) => setSettings(prev => ({ ...prev, mission: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Misi dan langkah-langkah untuk mencapai visi"
                />
              </div>
            </div>
          </div>

          {/* Branches */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-purple-600" />
                  Cabang/Kampus
                </h2>
                <p className="text-sm text-gray-600 mt-1">Kelola lokasi cabang sekolah</p>
              </div>
              <button
                onClick={handleAddBranch}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Cabang
              </button>
            </div>
            
            {settings.branches.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>Belum ada cabang yang terdaftar</p>
                <button
                  onClick={handleAddBranch}
                  className="mt-2 text-purple-600 hover:text-purple-700 text-sm"
                >
                  Tambah cabang pertama
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Cabang</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {settings.branches.map((branch) => (
                      <tr key={branch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {branch.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {branch.address}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditBranch(branch)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBranch(branch.id)}
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
            )}
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Preview Profil</h2>
              <p className="text-sm text-gray-600 mt-1">Tampilan informasi sekolah</p>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">{settings.name || 'Nama Sekolah'}</h3>
                  <p className="text-blue-700 mb-4">Tahun Akademik {settings.academicYear || '2024/2025'}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-left">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Visi</h4>
                      <p className="text-blue-800 text-sm">{settings.vision || 'Visi belum diisi'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Misi</h4>
                      <p className="text-blue-800 text-sm">{settings.mission || 'Misi belum diisi'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-blue-200">
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-700">
                      {settings.address && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{settings.address}</span>
                        </div>
                      )}
                      {settings.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          <span>{settings.phone}</span>
                        </div>
                      )}
                      {settings.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          <span>{settings.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingBranch ? 'Edit Cabang' : 'Tambah Cabang Baru'}
                </h2>
                <button
                  onClick={() => setShowBranchModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitBranch} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Cabang *
                </label>
                <input
                  type="text"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Contoh: Cabang Jakarta Selatan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat *
                </label>
                <textarea
                  value={branchForm.address}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, address: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Alamat lengkap cabang"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingBranch ? 'Perbarui' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
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