import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', { ...userData, role: 'CUSTOMER' });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  }
};

export const vehicleService = {
  getVehicles: async () => {
    const response = await api.get('/vehicles');
    return response.data;
  },
  getVehicle: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },
  createVehicle: async (vehicleData) => {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },
  updateVehicle: async (id, vehicleData) => {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },
  deleteVehicle: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  }
};

export const claimService = {
  getClaims: async (params = {}) => {
    const response = await api.get('/claims', { params });
    return response.data;
  },
  getClaim: async (id) => {
    const response = await api.get(`/claims/${id}`);
    return response.data;
  },
  createClaim: async (claimData) => {
    const response = await api.post('/claims', claimData);
    return response.data;
  },
  getClaimStatus: async (id) => {
    const response = await api.get(`/claims/${id}/status`);
    return response.data;
  }
};

export const evidenceService = {
  uploadEvidence: async (claimId, formData, onProgress) => {
    const response = await api.post(`/claims/${claimId}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    });
    return response.data;
  },
  getEvidence: async (claimId) => {
    const response = await api.get(`/claims/${claimId}/evidence`);
    return response.data;
  }
};

export const documentService = {
  uploadDocument: async (claimId, formData, onProgress) => {
    const response = await api.post(`/claims/${claimId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    });
    return response.data;
  },
  getDocuments: async (claimId = null) => {
    const url = claimId ? `/claims/${claimId}/documents` : '/documents';
    const response = await api.get(url);
    return response.data;
  }
};

export const assessmentService = {
  getAssessment: async (claimId) => {
    const response = await api.get(`/claims/${claimId}/assessment`);
    return response.data;
  },
  getEstimate: async (claimId) => {
    const response = await api.get(`/claims/${claimId}/estimate`);
    return response.data;
  }
};

export const packageService = {
  getPackageInfo: async (claimId) => {
    const response = await api.get(`/claims/${claimId}/package`);
    return response.data;
  },
  getPdfUrl: (claimId) => `${API_BASE_URL}/claims/${claimId}/package/pdf`,
  getZipUrl: (claimId) => `${API_BASE_URL}/claims/${claimId}/package/zip`
};

export const chatService = {
  sendMessage: async (question) => {
    const response = await api.post('/chat', { question });
    return response.data;
  },
  sendClaimMessage: async (claimId, question) => {
    const response = await api.post(`/claims/${claimId}/chat`, { question });
    return response.data;
  },
  getHistory: async (claimId = null) => {
    const url = claimId ? `/claims/${claimId}/chat/history` : '/chat/history';
    const response = await api.get(url);
    return response.data;
  }
};

export default api;
