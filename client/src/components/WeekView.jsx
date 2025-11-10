import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import '../styles/WeekView.css';

function WeekView({ tasks, onTaskClick }) {
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

  const getWeeksInMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const weeks = [];
    let currentWeekStart = startDate;

    while (currentWeekStart <= endDate) {
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      weeks.push({
        start: currentWeekStart,
        end: weekEnd < monthEnd ? weekEnd : monthEnd,
        number: getWeek(currentWeekStart, { weekStartsOn: 1, locale: es })
      });
      currentWeekStart = addDays(weekEnd, 1);
    }

    return weeks;
  };

  const renderWeeks = () => {
    const weeks = getWeeksInMonth();
    const weeklyTasks = tasks.filter(task => task.tipo === 'semanal');

    return weeks.map((week, index) => {
      const tasksInWeek = weeklyTasks.filter(task => {
        const taskDate = new Date(task.fecha);
        return taskDate >= week.start && taskDate <= week.end;
      });

      return (
        <div key={index} className="week-row">
          <div className="week-info">
            <div className="week-number">Semana {week.number}</div>
            <div className="week-dates">
              {format(week.start, 'd MMM', { locale: es })} - {format(week.end, 'd MMM', { locale: es })}
            </div>
          </div>
          <div className="week-tasks">
            {tasksInWeek.length === 0 ? (
              <div className="no-tasks">Sin tareas semanales</div>
            ) : (
              tasksInWeek.map(task => (
                <div
                  key={task.id}
                  className={`week-task-card priority-${task.prioridad} ${task.completada ? 'completed' : ''}`}
                  onClick={() => onTaskClick(task)}
                >
                  <div className="task-card-header">
                    <h4>{task.titulo}</h4>
                    <span className={`badge badge-${task.prioridad}`}>{task.prioridad}</span>
                  </div>
                  {task.descripcion && (
                    <p className="task-card-description">{task.descripcion}</p>
                  )}
                  <div className="task-card-meta">
                    {task.hora && <span>🕐 {task.hora.substring(0, 5)}</span>}
                    <span>📅 {format(new Date(task.fecha), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="week-view">
      {renderHeader()}
      <div className="weeks-container">
        {renderWeeks()}
      </div>
    </div>
  );
}

export default WeekView;