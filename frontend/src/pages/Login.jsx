// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhotographer } from '../context/PhotographerContext';
import { Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login, signup } = usePhotographer();
  
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-amber-400 to-orange-500 p-3 rounded-lg mb-4">
            <span className="text-3xl">📸</span>
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent">
            ProjectHub Pro
          </h1>
          <p className="text-slate-400 mt-2">Manage your photography projects</p>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8 backdrop-blur">
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-6">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Field (Signup only) */}
            {isSignup && (
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-slate-700/50 border border-slate-600 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-amber-500 transition"
                    required={isSignup}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-slate-700/50 border border-slate-600 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-amber-500 transition"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-700/50 border border-slate-600 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-amber-500 transition"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold py-2 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <span>Loading...</span>
              ) : isSignup ? (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Toggle Signup/Login */}
          <div className="text-center mt-6 pt-6 border-t border-slate-700">
            <p className="text-slate-400">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
              {' '}
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError('');
                }}
                className="text-amber-400 hover:text-amber-300 font-semibold transition"
              >
                {isSignup ? 'Sign In' : 'Create One'}
              </button>
            </p>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 text-center">
          <p className="text-blue-400 text-sm">
            💡 <strong>Demo:</strong> Sign up to test the platform
          </p>
        </div>
      </div>
    </div>
  );
};
