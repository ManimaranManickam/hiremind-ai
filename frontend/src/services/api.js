import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const jobsAPI = {
  getAll: () => api.get('/jobs/'),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs/', data),
};

export const resumeAPI = {
  upload: (file, jobId) => {
    const form = new FormData();
    form.append('file', file);
    const url = jobId ? `/resumes/upload?job_id=${jobId}` : '/resumes/upload';
    return api.post(url, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getAll: () => api.get('/resumes/'),
  getById: (id) => api.get(`/resumes/${id}`),
};

export const interviewAPI = {
  start: (jobId, resumeId) => api.post('/interviews/', { job_id: jobId, resume_id: resumeId }),
  submit: (interviewId, answers, terminated = false, terminationReason = null) =>
    api.post(`/interviews/${interviewId}/submit`, { answers, terminated, termination_reason: terminationReason }),
  getById: (id) => api.get(`/interviews/${id}`),
  getByResume: (resumeId) => api.get(`/interviews/by-resume/${resumeId}`),
  getAll: () => api.get('/interviews/'),
};

export default api;
