import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths, 
  subMonths,
  isSameWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';

function WeekView({ tasks, onTaskClick }) {
  const theme = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3,
      }}>
        <IconButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </Typography>
        <IconButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
    );
  };

  const renderWeeks = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const weeks = [];
    let week = startDate;

    while (week <= endDate) {
      const weekStart = week;
      const weekEnd = endOfWeek(week, { weekStartsOn: 1 });

      const weekTasks = tasks.filter(task => {
        const taskDate = new Date(task.fecha);
        return task.tipo === 'semanal' && isSameWeek(taskDate, weekStart, { weekStartsOn: 1 });
      });

      weeks.push(
        <Paper 
          key={week.toString()} 
          elevation={2}
          sx={{ 
            p: 2,
            transition: 'all 0.2s',
            '&:hover': {
              elevation: 4,
            },
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
            Semana del {format(weekStart, 'd MMM', { locale: es })} - {format(weekEnd, 'd MMM', { locale: es })}
          </Typography>
          
          <Divider sx={{ my: 1 }} />
          
          {weekTasks.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              {weekTasks.map(task => (
                <Chip
                  key={task.id}
                  label={task.titulo}
                  color={
                    task.prioridad === 'alta' ? 'error' :
                    task.prioridad === 'media' ? 'warning' : 'success'
                  }
                  onClick={() => onTaskClick(task)}
                  sx={{
                    justifyContent: 'flex-start',
                    textDecoration: task.completada ? 'line-through' : 'none',
                    opacity: task.completada ? 0.6 : 1,
                  }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
              No hay tareas semanales
            </Typography>
          )}
        </Paper>
      );

      week = addDays(weekEnd, 1);
    }

    return weeks;
  };

  return (
    <Box>
      {renderHeader()}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {renderWeeks()}
      </Box>
    </Box>
  );
}

export default WeekView;