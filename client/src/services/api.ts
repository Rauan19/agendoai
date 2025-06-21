import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'client' | 'provider' | 'admin';
  phone?: string;
  profileImage?: string;
  address?: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  userType?: 'client' | 'provider';
  phone?: string;
}

export interface Service {
  _id: string;
  providerId: string;
  categoryId: string;
  nicheId?: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  executionTime: number;
  breakTime: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  _id: string;
  clientId: string;
  providerId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

// Auth API
export const authAPI = {
  login: (data: LoginData) => api.post('/auth/login', data),
  register: (data: RegisterData) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Services API
export const servicesAPI = {
  getAll: (params?: any) => api.get('/services', { params }),
  getById: (id: string) => api.get(`/services/${id}`),
  create: (data: Partial<Service>) => api.post('/services', data),
  update: (id: string, data: Partial<Service>) => api.put(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
};

// Appointments API
export const appointmentsAPI = {
  getAll: (params?: any) => api.get('/appointments', { params }),
  getById: (id: string) => api.get(`/appointments/${id}`),
  create: (data: Partial<Appointment>) => api.post('/appointments', data),
  update: (id: string, data: Partial<Appointment>) => api.put(`/appointments/${id}`, data),
  cancel: (id: string, reason?: string) => api.put(`/appointments/${id}/cancel`, { cancellationReason: reason }),
};

// Categories API
export const categoriesAPI = {
  getAll: (params?: any) => api.get('/categories', { params }),
  getNiches: () => api.get('/categories/niches'),
};

// Providers API
export const providersAPI = {
  getAll: (params?: any) => api.get('/providers', { params }),
  getById: (id: string) => api.get(`/providers/${id}`),
};

export default api;