import React from 'react';
import { FaCheck, FaEdit, FaTrash, FaClock, FaExclamationCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import '../styles/TaskItem.css';

function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const getPriorityClass = (prioridad) => {
    return `priority-${prioridad}`;
  };

  const getPriorityIcon = (prioridad) => {
    if (prioridad === 'alta') return <FaExclamationCircle />;
    return null;
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`task-item ${task.completada ? 'completed' : ''} ${getPriorityClass(task.prioridad)}`}>
      <div className="task-checkbox">
        <input
          type="checkbox"
          checked={task.completada}
          onChange={() => onToggle(task.id)}
        />
        <span className="checkmark">
          {task.completada && <FaCheck />}
        </span>
      </div>

      <div className="task-content">
        <div className="task-header">
          <h3 className="task-title">{task.titulo}</h3>
          <div className="task-badges">
            {task.prioridad === 'alta' && (
              <span className="badge badge-priority">
                {getPriorityIcon(task.prioridad)}
                Alta
              </span>
            )}
            <span className={`badge badge-type badge-${task.tipo}`}>
              {task.tipo}
            </span>
          </div>
        </div>

        {task.descripcion && (
          <p className="task-description">{task.descripcion}</p>
        )}

        <div className="task-meta">
          <span className="task-date">
            <FaClock /> {formatDate(task.fecha)}
            {task.hora && ` - ${task.hora.substring(0, 5)}`}
          </span>
        </div>
      </div>

      <div className="task-actions">
        <button
          className="btn-icon btn-edit"
          onClick={() => onEdit(task)}
          title="Editar"
        >
          <FaEdit />
        </button>
        <button
          className="btn-icon btn-delete"
          onClick={() => onDelete(task.id)}
          title="Eliminar"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

export default TaskItem;