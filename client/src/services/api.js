import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Servicios de tareas
export const taskService = {
  // Obtener todas las tareas
  getAllTasks: () => api.get('/tasks/'),

  // Obtener tarea por ID
  getTaskById: (id) => api.get(`/tasks/${id}`),

  // Crear tarea
  createTask: (taskData) => api.post('/tasks/', taskData),

  // Actualizar tarea
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),

  // Eliminar tarea
  deleteTask: (id) => api.delete(`/tasks/${id}`),

  // Toggle completada
  toggleTask: (id) => api.patch(`/tasks/${id}/toggle`),

  // Tareas pendientes
  getPendingTasks: () => api.get('/tasks/pending'),

  // Tareas por fecha
  getTasksByDate: (date) => api.get(`/tasks/date/${date}`),
};

export default api;