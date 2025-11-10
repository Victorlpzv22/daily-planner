import React, { useState, useEffect, useContext } from 'react';
import { taskService } from './services/api';
import { ThemeContext } from './contexts/ThemeContext';

// MUI Components
import { 
  Box, 
  Container, 
  Fab, 
  Alert, 
  Snackbar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Tus componentes (los actualizaremos)
import Header from './components/Header';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskFilter from './components/TaskFilter';
import ViewSelector from './components/ViewSelector';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentView, setCurrentView] = useState('list');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getAllTasks();
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las tareas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await taskService.createTask(taskData);
      setTasks([response.data.task, ...tasks]);
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError('Error al crear la tarea');
      console.error(err);
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      const response = await taskService.updateTask(id, taskData);
      setTasks(tasks.map(task => task.id === id ? response.data.task : task));
      setEditingTask(null);
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError('Error al actualizar la tarea');
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
      setError(null);
    } catch (err) {
      setError('Error al eliminar la tarea');
      console.error(err);
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const response = await taskService.toggleTask(id);
      setTasks(tasks.map(task => task.id === id ? response.data.task : task));
      setError(null);
    } catch (err) {
      setError('Error al actualizar la tarea');
      console.error(err);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleDayClick = (date) => {
    setEditingTask(null);
    setShowForm(true);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completada;
    if (filter === 'completed') return task.completada;
    return true;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2, 
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between' 
          }}>
            <ViewSelector 
              currentView={currentView}
              onViewChange={setCurrentView}
            />

            {currentView === 'list' && (
              <TaskFilter 
                currentFilter={filter}
                onFilterChange={setFilter}
                taskCounts={{
                  all: tasks.length,
                  pending: tasks.filter(t => !t.completada).length,
                  completed: tasks.filter(t => t.completada).length,
                }}
              />
            )}
          </Box>

          {showForm && (
            <TaskForm
              task={editingTask}
              onSubmit={editingTask ? 
                (data) => handleUpdateTask(editingTask.id, data) : 
                handleCreateTask
              }
              onCancel={handleCancelForm}
            />
          )}

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              Cargando tareas...
            </Box>
          ) : (
            <>
              {currentView === 'list' && (
                <TaskList
                  tasks={filteredTasks}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              )}

              {currentView === 'month' && (
                <MonthView
                  tasks={tasks}
                  onTaskClick={handleEditTask}
                  onDayClick={handleDayClick}
                />
              )}

              {currentView === 'week' && (
                <WeekView
                  tasks={tasks}
                  onTaskClick={handleEditTask}
                />
              )}
            </>
          )}
        </Box>
      </Container>

      {/* FAB para crear tarea */}
      <Fab 
        color="primary" 
        aria-label="add"
        onClick={() => setShowForm(!showForm)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Snackbar para errores */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;