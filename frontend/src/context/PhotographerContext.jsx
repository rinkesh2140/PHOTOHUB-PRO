// frontend/src/context/PhotographerContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const PhotographerContext = createContext();

export const PhotographerProvider = ({ children }) => {
  const [photographer, setPhotographer] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedPhotographer = localStorage.getItem('photographer');
    
    if (savedToken && savedPhotographer) {
      setToken(savedToken);
      setPhotographer(JSON.parse(savedPhotographer));
    }
    setLoading(false);
  }, []);

  const signup = async (email, password, name) => {
    try {
      const response = await fetch('http://localhost:5000/api/photographers/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      if (!response.ok) throw new Error('Signup failed');
      
      const data = await response.json();
      
      setPhotographer(data.photographer);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('photographer', JSON.stringify(data.photographer));
      
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/photographers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) throw new Error('Login failed');
      
      const data = await response.json();
      
      setPhotographer(data.photographer);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('photographer', JSON.stringify(data.photographer));
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setPhotographer(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('photographer');
  };

  return (
    <PhotographerContext.Provider value={{
      photographer,
      token,
      loading,
      signup,
      login,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </PhotographerContext.Provider>
  );
};

export const usePhotographer = () => {
  const context = useContext(PhotographerContext);
  if (!context) {
    throw new Error('usePhotographer must be used within PhotographerProvider');
  }
  return context;
};
