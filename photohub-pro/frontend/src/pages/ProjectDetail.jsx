// frontend/src/pages/ProjectDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { ArrowLeft, Upload, Image, DollarSign, Check, X, Copy } from 'lucide-react';

export const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('photos');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'paid'
  });

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectData, photosData, paymentsData] = await Promise.all([
        api.getProject(projectId),
        api.getPhotos(projectId),
        api.getPayments(projectId)
      ]);
      setProject(projectData);
      setPhotos(photosData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async (e) => {
    const files = e.target.files;
    if (!files) return;

    for (let file of files) {
      try {
        // Convert file to base64 for demo
        const reader = new FileReader();
        reader.onload = async (event) => {
          const imageUrl = event.target.result;
          const photo = await api.uploadPhoto(projectId, {
            title: file.name.replace(/\.[^/.]+$/, ''),
            imageUrl
          });
          setPhotos([...photos, photo]);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading photo:', error);
      }
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await api.deletePhoto(photoId);
      setPhotos(photos.filter(p => p.id !== photoId));
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const payment = await api.createPayment(projectId, paymentForm);
      setPayments([payment, ...payments]);
      setShowPaymentModal(false);
      setPaymentForm({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'paid'
      });
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
  }

  if (!project) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Project not found</div>;
  }

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const remaining = (project.total_amount || 0) - totalPaid;

  const shareLink = `${window.location.origin}/client/${project.share_token}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{project.client_name}</h1>
              <p className="text-slate-400 text-sm">{project.event_type} • {new Date(project.event_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Project Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-white">₹{project.total_amount?.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-700/50 rounded-lg p-4">
            <p className="text-green-400 text-sm mb-1">Paid</p>
            <p className="text-2xl font-bold text-green-400">₹{totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 border border-yellow-700/50 rounded-lg p-4">
            <p className="text-yellow-400 text-sm mb-1">Remaining</p>
            <p className="text-2xl font-bold text-yellow-400">₹{remaining.toLocaleString()}</p>
          </div>
        </div>

        {/* Share Link */}
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 font-semibold mb-1">Share with Client</p>
              <p className="text-slate-400 text-sm break-all">{shareLink}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                alert('Link copied!');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              <Copy size={16} />
              Copy
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-800 mb-8">
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'photos'
                ? 'border-b-2 border-amber-500 text-amber-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Image size={18} className="inline mr-2" />
            Photos ({photos.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'payments'
                ? 'border-b-2 border-amber-500 text-amber-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <DollarSign size={18} className="inline mr-2" />
            Payments ({payments.length})
          </button>
        </div>

        {/* PHOTOS TAB */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-amber-500 transition bg-slate-800/30 hover:bg-slate-800/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload size={32} className="text-slate-400 mb-2" />
                <p className="text-slate-300 font-semibold">Click to upload photos</p>
                <p className="text-slate-500 text-sm">or drag and drop</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleUploadPhoto}
                className="hidden"
              />
            </label>

            {photos.length === 0 ? (
              <p className="text-center text-slate-400 py-12">No photos uploaded yet</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(photo => (
                  <div key={photo.id} className="group relative rounded-lg overflow-hidden bg-slate-800">
                    {photo.image_url && (
                      <img
                        src={photo.image_url}
                        alt={photo.title}
                        className="w-full h-32 object-cover group-hover:opacity-75 transition"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                      {photo.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition"
            >
              <DollarSign size={20} />
              Record Payment
            </button>

            {payments.length === 0 ? (
              <p className="text-center text-slate-400 py-12">No payments recorded yet</p>
            ) : (
              <div className="space-y-3">
                {payments.map(payment => (
                  <div key={payment.id} className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">₹{payment.amount?.toLocaleString()}</p>
                      <p className="text-slate-400 text-sm">{new Date(payment.payment_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        payment.status === 'paid'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {payment.status}
                      </span>
                      {payment.status === 'paid' && (
                        <Check size={20} className="text-green-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 w-full max-w-md border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-6">Record Payment</h3>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="10000"
                  className="w-full bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-lg"
                >
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
