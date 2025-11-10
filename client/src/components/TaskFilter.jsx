import React from 'react';
import '../styles/TaskFilter.css';

function TaskFilter({ currentFilter, onFilterChange, taskCounts }) {
  const filters = [
    { id: 'all', label: 'Todas', count: taskCounts.all },
    { id: 'pending', label: 'Pendientes', count: taskCounts.pending },
    { id: 'completed', label: 'Completadas', count: taskCounts.completed },
  ];

  return (
    <div className="task-filter">
      {filters.map(filter => (
        <button
          key={filter.id}
          className={`filter-btn ${currentFilter === filter.id ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
          <span className="filter-count">{filter.count}</span>
        </button>
      ))}
    </div>
  );
}

export default TaskFilter;