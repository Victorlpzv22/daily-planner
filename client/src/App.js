import React, { useState, useEffect } from 'react';
import { taskService } from './services/api';
import Header from './components/Header';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskFilter from './components/TaskFilter';
import ViewSelector from './components/ViewSelector';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import './styles/App.css';

function App() {
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
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      try {
        await taskService.deleteTask(id);
        setTasks(tasks.filter(task => task.id !== id));
        setError(null);
      } catch (err) {
        setError('Error al eliminar la tarea');
        console.error(err);
      }
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
    <div className="App">
      <Header />
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="container">
        <div className="actions-bar">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : '+ Nueva Tarea'}
          </button>

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
        </div>

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
          <div className="loading">Cargando tareas...</div>
        ) : (
          <>
            {currentView === 'list' && (
              <>
                <TaskList
                  tasks={filteredTasks}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
                {filteredTasks.length === 0 && (
                  <div className="empty-state">
                    <p>No hay tareas {filter !== 'all' && filter}</p>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowForm(true)}
                    >
                      Crear primera tarea
                    </button>
                  </div>
                )}
              </>
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
      </div>
    </div>
  );
}

export default App;