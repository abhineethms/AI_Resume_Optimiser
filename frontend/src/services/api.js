import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // Increase timeout to 60 seconds
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.data || config.params);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    // Handle specific error cases
    console.error('[API Response Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      code: error.code
    });
    
    if (error.response) {
      // Server responded with a status code outside of 2xx
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Resume API services
export const resumeService = {
  parseResume: async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    const response = await api.post('/resume/parse', formData, config);
    return response.data;
  },
  
  getResumes: async () => {
    const response = await api.get('/history/resumes');
    return response.data;
  },
};

// Job API services
export const jobService = {
  parseJobFile: async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    const response = await api.post('/job/parse/file', formData, config);
    return response.data;
  },
  
  parseJobText: async (text) => {
    const response = await api.post('/job/parse/text', { text });
    return response.data;
  },
  
  getJobs: async () => {
    const response = await api.get('/history/jobs');
    return response.data;
  },
};

// Match API services
export const matchService = {
  compareResumeJob: async (resumeId, jobId) => {
    const response = await api.post('/match/compare', { resumeId, jobId });
    return response.data;
  },
  
  generateCoverLetter: async (params) => {
    const response = await api.post('/match/letter/generate', params);
    return response.data;
  },
  
  getResumeFeedback: async (matchId) => {
    const response = await api.post('/match/feedback', { matchId });
    return response.data;
  },
  
  getMatches: async () => {
    const response = await api.get('/history/matches');
    return response.data;
  },
};

// Auth API services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
};

export default api;
