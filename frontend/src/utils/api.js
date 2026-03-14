import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const errData = err.response?.data;
    let message = 'Something went wrong.';
    if (errData?.errors) {
      message = Object.values(errData.errors).flat().join(' ');
    } else if (errData?.message) {
      message = errData.message;
    } else if (errData?.detail) {
      message = errData.detail;
    }
    return Promise.reject({ ...err, userMessage: message });
  }
);

export const getEmployees = (params) => api.get('/employees/', { params });
export const getEmployee = (id) => api.get(`/employees/${id}/`);
export const createEmployee = (data) => api.post('/employees/', data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}/`);

export const getAttendance = (params) => api.get('/attendance/', { params });
export const markAttendance = (data) => api.post('/attendance/', data);
export const deleteAttendance = (id) => api.delete(`/attendance/${id}/`);

export const getDashboard = () => api.get('/dashboard/');

export default api;
