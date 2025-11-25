import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Fab,
  useMediaQuery,
  CircularProgress,
  Alert,
  IconButton,
  ThemeProvider,
  CssBaseline,
  Avatar,
} from '@mui/material';
import { createCustomTheme } from './theme/theme';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import TaskDetailDialog from './components/TaskDetailDialog';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import UpdateNotification from './components/UpdateNotification';

const API_URL = 'http://localhost:5000/api/tasks';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const theme = React.useMemo(
    () => createCustomTheme(darkMode ? 'dark' : 'light'),
    [darkMode]
  );

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('viewMode');
    return saved || 'month';
  });
  const [selectedTask, setSelectedTask] = useState(null);

  // Guardar preferencias
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  // Cargar tareas al montar el componente
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_URL);

      console.log('📦 Respuesta del servidor:', response.data);

      const tasksData = response.data.tasks || response.data || [];

      if (Array.isArray(tasksData)) {
        setTasks(tasksData);
        console.log('✅ Tareas cargadas:', tasksData.length);
      } else {
        console.error('❌ La respuesta no es un array:', tasksData);
        setTasks([]);
        setError('Formato de datos inválido del servidor');
      }
    } catch (err) {
      console.error('❌ Error al cargar tareas:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('No se puede conectar al servidor. Verifica que esté corriendo en http://localhost:5000');
      } else {
        setError('Error al cargar las tareas: ' + (err.response?.data?.error || err.message));
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      console.log('📤 Enviando tarea:', taskData);
      await axios.post(API_URL, taskData);
      await fetchTasks();
      setIsFormOpen(false);
      setCurrentTask(null);
    } catch (err) {
      console.error('❌ Error al crear tarea:', err);
      if (err.code === 'ERR_NETWORK') {
        alert('Error de conexión. Verifica que el servidor esté corriendo.');
      } else {
        alert('Error al crear la tarea: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      console.log('📝 Actualizando tarea:', taskData);
      await axios.put(`${API_URL}/${currentTask.id}`, taskData);
      await fetchTasks();
      setIsFormOpen(false);
      setCurrentTask(null);
    } catch (err) {
      console.error('❌ Error al actualizar tarea:', err);
      alert('Error al actualizar la tarea: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${taskId}`);
      await fetchTasks();
      setSelectedTask(null);
    } catch (err) {
      console.error('❌ Error al eliminar tarea:', err);
      alert('Error al eliminar la tarea: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      await axios.patch(`${API_URL}/${taskId}/toggle`);
      await fetchTasks();
    } catch (err) {
      console.error('❌ Error al cambiar estado de tarea:', err);
      alert('Error al cambiar el estado: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsFormOpen(true);
    setSelectedTask(null);
  };

  const handleNewTask = () => {
    setCurrentTask(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentTask(null);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleDayClick = (date) => {
    console.log('📅 Día seleccionado:', date);
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Obtener día actual
  const today = new Date();
  const dayNumber = format(today, 'd');
  const dayName = format(today, 'EEEE', { locale: es });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UpdateNotification />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Icono del día actual */}
                <Avatar
                  sx={{
                    width: isMobile ? 48 : 56,
                    height: isMobile ? 48 : 56,
                    bgcolor: 'primary.main',
                    fontSize: isMobile ? '1.5rem' : '1.75rem',
                    fontWeight: 700,
                    boxShadow: 3,
                  }}
                  title={`Hoy es ${dayName}`}
                >
                  {dayNumber}
                </Avatar>

                <Box>
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    sx={{ fontWeight: 600, lineHeight: 1.2 }}
                  >
                    Daily Planner
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {format(today, "EEEE, d 'de' MMMM", { locale: es })}
                  </Typography>
                </Box>
              </Box>

              {/* Botón modo oscuro */}
              <IconButton onClick={toggleDarkMode} color="inherit">
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewChange}
                size={isMobile ? 'small' : 'medium'}
              >
                <ToggleButton value="month">
                  <CalendarMonthIcon sx={{ mr: 0.5 }} />
                  {!isMobile && 'Mes'}
                </ToggleButton>
                <ToggleButton value="week">
                  <ViewWeekIcon sx={{ mr: 0.5 }} />
                  {!isMobile && 'Semana'}
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewListIcon sx={{ mr: 0.5 }} />
                  {!isMobile && 'Lista'}
                </ToggleButton>
              </ToggleButtonGroup>

              {!isMobile && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleNewTask}
                  size="large"
                >
                  Nueva Tarea
                </Button>
              )}
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <>
              {viewMode === 'month' && (
                <MonthView
                  tasks={tasks}
                  onTaskClick={handleTaskClick}
                  onDayClick={handleDayClick}
                />
              )}

              {viewMode === 'week' && (
                <WeekView
                  tasks={tasks}
                  onTaskClick={handleTaskClick}
                  onDayClick={handleDayClick}
                />
              )}

              {viewMode === 'list' && (
                <TaskList
                  tasks={tasks}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              )}

              {tasks.length === 0 && !loading && (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    No hay tareas todavía
                  </Typography>
                  <Typography variant="body2">
                    Haz clic en el botón + para crear tu primera tarea
                  </Typography>
                </Box>
              )}
            </>
          )}

          {isMobile && (
            <Fab
              color="primary"
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
              }}
              onClick={handleNewTask}
            >
              <AddIcon />
            </Fab>
          )}

          {isFormOpen && (
            <TaskForm
              task={currentTask}
              onSubmit={currentTask ? handleUpdateTask : handleCreateTask}
              onCancel={handleCloseForm}
            />
          )}

          {selectedTask && (
            <TaskDetailDialog
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onToggle={handleToggleTask}
              onRefresh={fetchTasks}
            />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;