import React from 'react';
import { FaList, FaCalendarDay, FaCalendarWeek } from 'react-icons/fa';
import '../styles/ViewSelector.css';

function ViewSelector({ currentView, onViewChange }) {
  const views = [
    { id: 'list', label: 'Lista', icon: FaList },
    { id: 'month', label: 'Mes (Días)', icon: FaCalendarDay },
    { id: 'week', label: 'Mes (Semanas)', icon: FaCalendarWeek },
  ];

  return (
    <div className="view-selector">
      {views.map(view => {
        const Icon = view.icon;
        return (
          <button
            key={view.id}
            className={`view-btn ${currentView === view.id ? 'active' : ''}`}
            onClick={() => onViewChange(view.id)}
            title={view.label}
          >
            <Icon />
            <span>{view.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ViewSelector;