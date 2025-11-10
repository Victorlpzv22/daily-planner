import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import '../styles/Header.css';

function Header() {
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <FaCalendarAlt className="header-icon" />
          <h1>Daily Planner</h1>
        </div>
        <p className="header-date">{today}</p>
      </div>
    </header>
  );
}

export default Header;