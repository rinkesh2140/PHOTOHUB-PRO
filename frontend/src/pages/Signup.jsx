// frontend/src/pages/Signup.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePhotographer } from '../context/PhotographerContext';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = usePhotographer();

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validation functions
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const getPasswordStrength = (password) => {
    if (password.length < 8) return { level: 'weak', label: 'Weak' };
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (hasUpper && hasNumber && hasSpecial) return { level: 'strong', label: 'Strong' };
    if ((hasUpper && hasNumber) || (hasUpper && hasSpecial) || (hasNumber && hasSpecial)) {
      return { level: 'medium', label: 'Medium' };
    }
    return { level: 'weak', label: 'Weak' };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  
  const getStrengthColor = (level) => {
    switch (level) {
      case 'strong': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'weak': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const isPasswordValid = () => {
    return (
      formData.password.length >= 8 &&
      /[A-Z]/.test(formData.password) &&
      /\d/.test(formData.password) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) &&
      formData.password === formData.confirmPassword
    );
  };

  const isFormValid =
    validateEmail(formData.email) &&
    formData.name.length >= 2 &&
    formData.name.length <= 100 &&
    isPasswordValid() &&
    formData.termsAccepted;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError('Please fill all fields correctly');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signup(formData.email, formData.password, formData.name);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">PhotoHub Pro</h1>
            <p className="text-gray-400">Join our photography community</p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                />
                {formData.email && !validateEmail(formData.email) && (
                  <p className="mt-1 text-red-500 text-sm">Invalid email format</p>
                )}
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  maxLength="100"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                />
                {formData.name && (formData.name.length < 2 || formData.name.length > 100) && (
                  <p className="mt-1 text-red-500 text-sm">Name must be 2-100 characters</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Lock className="inline w-4 h-4 mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 chars: uppercase, number, special char"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded h-2 overflow-hidden">
                        <div
                          className={`h-full ${getStrengthColor(passwordStrength.level)} transition-all`}
                          style={{
                            width: passwordStrength.level === 'weak' ? '33%' : 
                                   passwordStrength.level === 'medium' ? '66%' : '100%'
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400">{passwordStrength.label}</span>
                    </div>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li className={/^.{8,}$/.test(formData.password) ? 'text-green-400' : ''}>
                        {/^.{8,}$/.test(formData.password) ? '✓' : '○'} At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(formData.password) ? 'text-green-400' : ''}>
                        {/[A-Z]/.test(formData.password) ? '✓' : '○'} One uppercase letter
                      </li>
                      <li className={/\d/.test(formData.password) ? 'text-green-400' : ''}>
                        {/\d/.test(formData.password) ? '✓' : '○'} One number
                      </li>
                      <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-400' : ''}>
                        {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? '✓' : '○'} One special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-red-500 text-sm">Passwords don't match</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 bg-slate-700 border-slate-600 rounded accent-orange-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-400">
                  I agree to the Terms & Conditions and Privacy Policy
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 rounded transition mt-6"
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center text-gray-400 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-500 hover:text-orange-400 transition">
                Login here
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-6">
            © 2024 PhotoHub Pro. All rights reserved.
          </p>
        </div>
      </div>
    </ErrorBoundary>
  );
}
