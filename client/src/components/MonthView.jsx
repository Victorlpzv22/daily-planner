import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import '../styles/MonthView.css';

function MonthView({ tasks, onTaskClick, onDayClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => {
    return (
      <div className="calendar-header">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="nav-btn">
          <FaChevronLeft />
        </button>
        <h2>{format(currentMonth, 'MMMM yyyy', { locale: es })}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="nav-btn">
          <FaChevronRight />
        </button>
      </div>
    );
  };

  const renderDaysOfWeek = () => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return (
      <div className="calendar-days-header">
        {days.map(day => (
          <div key={day} className="day-name">{day}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        
        // Obtener semana actual
        const weekStart = startOfWeek(cloneDay, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(cloneDay, { weekStartsOn: 1 });
        
        // Filtrar tareas diarias para este día específico
        const dailyTasks = tasks.filter(task => 
          task.tipo === 'diaria' && isSameDay(new Date(task.fecha), cloneDay)
        );
        
        // Filtrar tareas semanales que caen en esta semana
        const weeklyTasks = tasks.filter(task => {
          if (task.tipo !== 'semanal') return false;
          const taskDate = new Date(task.fecha);
          return taskDate >= weekStart && taskDate <= weekEnd;
        });
        
        // Combinar ambas tareas
        const dayTasks = [...dailyTasks, ...weeklyTasks];

        days.push(
          <div
            key={cloneDay.toString()}
            className={`calendar-day ${
              !isSameMonth(cloneDay, monthStart) ? 'disabled' : ''
            } ${isSameDay(cloneDay, new Date()) ? 'today' : ''}`}
            onClick={() => onDayClick(cloneDay)}
          >
            <div className="day-number">{format(cloneDay, 'd')}</div>
            <div className="day-tasks">
              {dayTasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className={`task-pill priority-${task.prioridad} ${task.completada ? 'completed' : ''} ${task.tipo === 'semanal' ? 'weekly-task' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                  }}
                  title={`${task.titulo} (${task.tipo})`}
                >
                  {task.hora && <span className="task-time">{task.hora.substring(0, 5)}</span>}
                  <span className="task-title-pill">{task.titulo}</span>
                  {task.tipo === 'semanal' && <span className="task-badge">📅</span>}
                </div>
              ))}
              {dayTasks.length > 3 && (
                <div className="more-tasks">+{dayTasks.length - 3} más</div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="calendar-row">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="calendar-body">{rows}</div>;
  };

  return (
    <div className="month-view">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
}

export default MonthView;