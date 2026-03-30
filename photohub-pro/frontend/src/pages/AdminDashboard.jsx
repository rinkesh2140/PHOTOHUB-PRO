// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { usePhotographer } from '../context/PhotographerContext';
import { api } from '../utils/api';
import { Users, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';

export const AdminDashboard = () => {
  const { photographer } = usePhotographer();
  const [stats, setStats] = useState(null);
  const [photographers, setPhotographers] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, photosData, revenueData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminPhotographers(),
        api.getAdminRevenue()
      ]);

      setStats(statsData);
      setPhotographers(photosData);
      setRevenue(revenueData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">Platform Analytics & Management</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Key Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-700/50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users size={20} className="text-blue-400" />
                <p className="text-blue-400 text-sm font-semibold">Total Users</p>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
              <p className="text-blue-400/60 text-xs mt-2">Active photographers</p>
            </div>

            <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-700/50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign size={20} className="text-green-400" />
                <p className="text-green-400 text-sm font-semibold">Total Revenue</p>
              </div>
              <p className="text-3xl font-bold text-white">₹{stats.totalRevenue?.toLocaleString()}</p>
              <p className="text-green-400/60 text-xs mt-2">All-time revenue</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-700/50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={20} className="text-purple-400" />
                <p className="text-purple-400 text-sm font-semibold">New This Month</p>
              </div>
              <p className="text-3xl font-bold text-white">{stats.newUsersThisMonth}</p>
              <p className="text-purple-400/60 text-xs mt-2">New signups</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 border border-yellow-700/50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 size={20} className="text-yellow-400" />
                <p className="text-yellow-400 text-sm font-semibold">Monthly Revenue</p>
              </div>
              <p className="text-3xl font-bold text-white">₹{stats.revenueThisMonth?.toLocaleString()}</p>
              <p className="text-yellow-400/60 text-xs mt-2">This month</p>
            </div>
          </div>
        )}

        {/* Photographers List */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-bold text-white mb-6">Active Photographers</h2>
          
          {photographers.length === 0 ? (
            <p className="text-slate-400">No photographers yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-semibold">Plan</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {photographers.map(p => (
                    <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 text-white font-semibold">{p.name}</td>
                      <td className="py-3 px-4 text-slate-400">{p.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          p.subscription_tier === 'free'
                            ? 'bg-slate-700 text-slate-300'
                            : p.subscription_tier === 'starter'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {p.subscription_tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-sm">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Daily Revenue (Last 30 Days)</h2>
          
          {revenue.length === 0 ? (
            <p className="text-slate-400">No revenue data yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {revenue.map(item => (
                <div key={item.date} className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded">
                  <span className="text-slate-300 text-sm">{new Date(item.date).toLocaleDateString()}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-40 bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2"
                        style={{ width: `${Math.min((item.revenue / 10000) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-amber-400 font-semibold text-sm min-w-24 text-right">
                      ₹{item.revenue?.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
