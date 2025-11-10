import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Chip,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RepeatIcon from '@mui/icons-material/Repeat';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isSameWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';

function MonthView({ tasks, onTaskClick, onDayClick }) {
  const theme = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Función para truncar texto
  const truncateText = (text, maxLength = 15) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderHeader = () => {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2,
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

  const renderDaysOfWeek = () => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    return (
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 1,
        mb: 1,
      }}>
        {days.map((day) => (
          <Box key={day} sx={{ textAlign: 'center', py: 1 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              {day}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let day = startDate;

    while (day <= endDate) {
      const weekStart = day;
      const weekEnd = endOfWeek(day, { weekStartsOn: 1 });

      // Obtener tareas semanales de esta semana
      const weeklyTasks = tasks.filter(task => {
        if (task.tipo !== 'semanal') return false;
        const taskDate = new Date(task.fecha);
        return isSameWeek(taskDate, weekStart, { weekStartsOn: 1 });
      });

      // Generar celdas de días
      const days = [];
      for (let i = 0; i < 7; i++) {
        const cloneDay = addDays(weekStart, i);
        
        // Solo tareas diarias para este día específico
        const dailyTasks = tasks.filter(task => 
          task.tipo === 'diaria' && isSameDay(new Date(task.fecha), cloneDay)
        );
        
        const isToday = isSameDay(cloneDay, new Date());
        const isCurrentMonth = isSameMonth(cloneDay, monthStart);

        days.push(
          <Paper
            key={cloneDay.toString()}
            elevation={isToday ? 3 : 1}
            sx={{
              minHeight: 100,
              maxHeight: 140,
              p: 1,
              cursor: 'pointer',
              bgcolor: isCurrentMonth 
                ? (isToday ? alpha(theme.palette.primary.main, 0.1) : 'background.paper')
                : 'action.hover',
              transition: 'all 0.2s',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                elevation: 3,
                transform: 'scale(1.02)',
              },
            }}
            onClick={() => onDayClick(cloneDay)}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: isToday ? 700 : 500,
                color: isCurrentMonth ? 'text.primary' : 'text.disabled',
                mb: 0.5,
              }}
            >
              {format(cloneDay, 'd')}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 0.5,
              overflow: 'hidden',
              flex: 1,
            }}>
              {dailyTasks.slice(0, 2).map(task => (
                <Tooltip 
                  key={task.id} 
                  title={`${task.titulo} ${task.hora ? '(' + task.hora.substring(0, 5) + ')' : ''}`}
                  arrow
                  placement="top"
                >
                  <Chip
                    label={truncateText(task.titulo, 15)}
                    size="small"
                    color={
                      task.prioridad === 'alta' ? 'error' :
                      task.prioridad === 'media' ? 'warning' : 'success'
                    }
                    variant="filled"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick(task);
                    }}
                    sx={{
                      fontSize: '0.65rem',
                      height: 20,
                      textDecoration: task.completada ? 'line-through' : 'none',
                      opacity: task.completada ? 0.6 : 1,
                      maxWidth: '100%',
                      '& .MuiChip-label': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      },
                    }}
                  />
                </Tooltip>
              ))}
              {dailyTasks.length > 2 && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{
                    fontSize: '0.65rem',
                    textAlign: 'center',
                    mt: 0.5,
                  }}
                >
                  +{dailyTasks.length - 2} más
                </Typography>
              )}
            </Box>
          </Paper>
        );
      }

      rows.push(
        <Box 
          key={weekStart.toString()} 
          sx={{ 
            position: 'relative',
            mb: 2,
          }}
        >
          {/* Grid de días de la semana */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
          }}>
            {days}
          </Box>

          {/* Tareas semanales que abarcan toda la fila */}
          {weeklyTasks.length > 0 && (
            <Box sx={{ 
              mt: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}>
              {weeklyTasks.slice(0, 2).map(task => (
                <Tooltip 
                  key={task.id} 
                  title={`${task.titulo} - Tarea semanal`}
                  arrow
                  placement="top"
                >
                  <Paper
                    elevation={2}
                    sx={{
                      px: 2,
                      py: 0.5,
                      cursor: 'pointer',
                      bgcolor: task.prioridad === 'alta' ? 'error.light' :
                               task.prioridad === 'media' ? 'warning.light' : 'success.light',
                      color: task.prioridad === 'alta' ? 'error.dark' :
                             task.prioridad === 'media' ? 'warning.dark' : 'success.dark',
                      borderLeft: '4px solid',
                      borderLeftColor: task.prioridad === 'alta' ? 'error.main' :
                                      task.prioridad === 'media' ? 'warning.main' : 'success.main',
                      transition: 'all 0.2s',
                      textDecoration: task.completada ? 'line-through' : 'none',
                      opacity: task.completada ? 0.6 : 1,
                      '&:hover': {
                        elevation: 4,
                        transform: 'translateX(4px)',
                      },
                    }}
                    onClick={() => onTaskClick(task)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RepeatIcon sx={{ fontSize: '0.9rem' }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {task.titulo}
                      </Typography>
                      {task.hora && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            opacity: 0.8,
                            fontSize: '0.75rem',
                          }}
                        >
                          {task.hora.substring(0, 5)}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Tooltip>
              ))}
              {weeklyTasks.length > 2 && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{
                    fontSize: '0.65rem',
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  +{weeklyTasks.length - 2} tareas semanales más
                </Typography>
              )}
            </Box>
          )}
        </Box>
      );

      day = addDays(weekEnd, 1);
    }

    return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>{rows}</Box>;
  };

  return (
    <Box>
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </Box>
  );
}

export default MonthView;