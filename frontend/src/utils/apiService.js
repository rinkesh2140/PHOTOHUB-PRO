// frontend/src/utils/apiService.js
// Complete API service with all endpoints - FIXED VERSION

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function for API calls with error handling
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ==================== AUTHENTICATION ====================

export const authAPI = {
  signup: (email, password, name) =>
    apiCall('/api/photographers/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    }),

  login: (email, password) =>
    apiCall('/api/photographers/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }),

  getProfile: (token) =>
    apiCall('/api/photographers/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  forgotPassword: (email) =>
    apiCall('/api/photographers/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }),

  resetPassword: (token, password) =>
    apiCall(`/api/photographers/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
};

// ==================== PROJECTS ====================

export const projectAPI = {
  getAll: (token, limit = 10, offset = 0) =>
    apiCall(`/api/projects?limit=${limit}&offset=${offset}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  create: (token, clientName, eventDate, eventType) =>
    apiCall('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ clientName, eventDate, eventType })
    }),

  update: (token, projectId, updates) =>
    apiCall(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    }),

  delete: (token, projectId) =>
    apiCall(`/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
};

// ==================== PHOTOS ====================

export const photoAPI = {
  upload: (token, projectId, title, imageUrl) =>
    apiCall(`/api/projects/${projectId}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, imageUrl })
    }),

  search: (token, projectId, params = {}) => {
    const query = new URLSearchParams(params);
    return apiCall(`/api/projects/${projectId}/photos?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  delete: (token, photoId) =>
    apiCall(`/api/photos/${photoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  like: (photoId, clientId) =>
    apiCall(`/api/photos/${photoId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId })
    })
};

// ==================== SLIDESHOWS (Feature #1) ====================

export const slideshowAPI = {
  create: (token, projectId, name, musicStyle) =>
    apiCall('/api/slideshows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ projectId, name, musicStyle })
    }),

  getById: (token, slideshowId) =>
    apiCall(`/api/slideshows/${slideshowId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
};

// ==================== TIMELINE (Feature #2) ====================

export const timelineAPI = {
  tagPhoto: (token, photoId, eventTimeLabel, eventTimeOrder) =>
    apiCall(`/api/photos/${photoId}/event-label`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ eventTimeLabel, eventTimeOrder })
    }),

  getTimeline: (token, projectId) =>
    apiCall(`/api/projects/${projectId}/timeline`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
};

// ==================== PEOPLE TAGGING (Feature #3) ====================

export const peopleAPI = {
  tagPerson: (token, photoId, personName, faceIndex) =>
    apiCall(`/api/photos/${photoId}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ personName, faceIndex })
    }),

  getPeopleList: (token, projectId) =>
    apiCall(`/api/projects/${projectId}/people`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  getPhotosByPerson: (token, projectId, personName) =>
    apiCall(`/api/projects/${projectId}/photos-by-person/${personName}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
};

// ==================== INSTAGRAM STORIES (Feature #4) ====================

export const storyAPI = {
  generate: (token, projectId, photoId, templateType, textOverlay, hashtags) =>
    apiCall('/api/instagram-stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ projectId, photoId, templateType, textOverlay, hashtags })
    }),

  getById: (token, storyId) =>
    apiCall(`/api/instagram-stories/${storyId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  getImageUrl: (storyId) => `${API_URL}/api/instagram-stories/${storyId}/image`
};

// ==================== ANNIVERSARY (Features #5 & #6) ====================

export const anniversaryAPI = {
  claimPhotoshoot: (projectId, preferredDate) =>
    apiCall(`/api/photoshoots/claim-free/${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredDate })
    }),

  getStatus: (projectId) =>
    apiCall(`/api/photoshoots/status/${projectId}`)
};

// ==================== ADMIN ====================

export const adminAPI = {
  getStats: (token) =>
    apiCall('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
};

// ==================== PUBLIC ENDPOINTS ====================

export const publicAPI = {
  getProject: (shareToken) =>
    apiCall(`/api/projects/public/${shareToken}`),

  getProjectPhotos: (shareToken) =>
    apiCall(`/api/projects/public/${shareToken}/photos`)
};

// ==================== STORAGE HELPERS ====================

export const tokenStorage = {
  get: () => localStorage.getItem('token'),
  set: (token) => localStorage.setItem('token', token),
  remove: () => localStorage.removeItem('token'),
  isValid: () => {
    const token = localStorage.getItem('token');
    return token && token.length > 0;
  }
};

export const photographerStorage = {
  get: () => {
    const data = localStorage.getItem('photographer');
    return data ? JSON.parse(data) : null;
  },
  set: (photographer) => localStorage.setItem('photographer', JSON.stringify(photographer)),
  remove: () => localStorage.removeItem('photographer')
};

// ==================== ERROR HANDLING ====================

export const handleAPIError = (error) => {
  if (error instanceof TypeError) {
    return 'Network error. Please check your connection.';
  }
  if (error.message === 'Failed to fetch') {
    return 'Unable to reach server. Please try again later.';
  }
  return error.message || 'An unexpected error occurred';
};
