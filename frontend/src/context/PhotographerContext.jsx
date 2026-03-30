// frontend/src/context/PhotographerContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { tokenStorage, photographerStorage, authAPI } from '../utils/apiService';

const PhotographerContext = createContext();

export const usePhotographer = () => {
  const context = useContext(PhotographerContext);
  if (!context) {
    throw new Error('usePhotographer must be used within PhotographerProvider');
  }
  return context;
};

export const PhotographerProvider = ({ children }) => {
  const [photographer, setPhotographer] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for stored token on app load
        const storedToken = tokenStorage.get();
        const storedPhotographer = photographerStorage.get();

        if (storedToken) {
          setToken(storedToken);

          // Verify token is still valid
          try {
            const profile = await authAPI.getProfile(storedToken);
            setPhotographer(profile);
            photographerStorage.set(profile);
          } catch (err) {
            // Token is invalid, clear it
            console.error('Token validation failed:', err);
            tokenStorage.remove();
            photographerStorage.remove();
            setToken(null);
            setPhotographer(null);
          }
        } else if (storedPhotographer) {
          // Have photographer but no token, clear everything
          photographerStorage.remove();
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ==================== LOGIN ====================

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login(email, password);
      const { token: newToken, photographer: newPhotographer } = response;

      // Store auth data
      tokenStorage.set(newToken);
      photographerStorage.set(newPhotographer);

      // Update state
      setToken(newToken);
      setPhotographer(newPhotographer);

      return { success: true, token: newToken };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ==================== SIGNUP ====================

  const signup = async (email, password, name) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.signup(email, password, name);
      const { token: newToken, photographer: newPhotographer } = response;

      // Store auth data
      tokenStorage.set(newToken);
      photographerStorage.set(newPhotographer);

      // Update state
      setToken(newToken);
      setPhotographer(newPhotographer);

      return { success: true, token: newToken };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ==================== LOGOUT ====================

  const logout = () => {
    try {
      // Clear stored data
      tokenStorage.remove();
      photographerStorage.remove();

      // Clear state
      setToken(null);
      setPhotographer(null);
      setError(null);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // ==================== UPDATE PROFILE ====================

  const updateProfile = (updates) => {
    const updated = { ...photographer, ...updates };
    setPhotographer(updated);
    photographerStorage.set(updated);
  };

  // ==================== CONTEXT VALUE ====================

  const value = {
    // State
    photographer,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!photographer,

    // Methods
    login,
    signup,
    logout,
    updateProfile,

    // Helpers
    getToken: () => token,
    getPhotographer: () => photographer,
    clearError: () => setError(null)
  };

  return (
    <PhotographerContext.Provider value={value}>
      {children}
    </PhotographerContext.Provider>
  );
};

export default PhotographerContext;
