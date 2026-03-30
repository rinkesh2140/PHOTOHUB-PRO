// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhotographer } from '../context/PhotographerContext';
import { api } from '../utils/api';
import { Plus, LogOut, Settings, Calendar, MapPin, DollarSign, Link2, Trash2 } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { photographer, logout } = usePhotographer();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    event_type: 'Wedding',
    event_date: '',
    location: '',
    total_amount: ''
  });

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const newProject = await api.createProject(formData);
      setProjects([newProject, ...projects]);
      setShowModal(false);
      setFormData({
        client_name: '',
        event_type: 'Wedding',
        event_date: '',
        location: '',
        total_amount: ''
      });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure? This will delete all photos and payments.')) return;
    
    try {
      await api.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500">
                ProjectHub Pro
              </h1>
              <p className="text-slate-400 text-sm mt-1">Welcome, {photographer?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300">
                <Settings size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Create Project Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Projects</h2>
            <p className="text-slate-400 text-sm mt-1">Manage your photography projects</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold px-6 py-3 rounded-lg transition-all"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-slate-400 mb-4">No projects yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              Create your first project →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div
                key={project.id}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-all cursor-pointer group"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">
                      {project.client_name}
                    </h3>
                    <p className="text-amber-400 text-sm">{project.event_type}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6 pb-6 border-b border-slate-700">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <Calendar size={16} className="text-slate-500" />
                    {new Date(project.event_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <MapPin size={16} className="text-slate-500" />
                    {project.location || 'Location not set'}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <DollarSign size={16} className="text-slate-500" />
                    ₹{project.total_amount?.toLocaleString() || '0'}
                  </div>
                </div>

                {/* Status & Share */}
                <div className="space-y-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    project.status === 'completed'
                      ? 'bg-green-500/20 text-green-400'
                      : project.status === 'delivered'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(
                        `${window.location.origin}/client/${project.share_token}`
                      );
                      alert('Link copied!');
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-semibold py-2 rounded-lg transition"
                  >
                    <Link2 size={16} />
                    Copy Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 w-full max-w-md border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-6">Create New Project</h3>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="e.g., John & Jane"
                  className="w-full bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Event Type
                </label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-amber-500"
                >
                  <option>Wedding</option>
                  <option>Engagement</option>
                  <option>Portrait</option>
                  <option>Event</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Event Date
                </label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Surat, Gujarat"
                  className="w-full bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Total Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  placeholder="50000"
                  className="w-full bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
