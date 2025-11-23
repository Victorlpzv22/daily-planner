import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DateRangeIcon from '@mui/icons-material/DateRange';
import RepeatIcon from '@mui/icons-material/Repeat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EventIcon from '@mui/icons-material/Event';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  startOfDay,
  endOfDay,
  isSameDay,
} from 'date-fns';
import { es } from 'date-fns/locale';

function WeekView({ tasks, onTaskClick }) {
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
        <Typography variant="h5" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
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

      // Tareas que se solapan con esta semana
      const weekTasks = tasks.filter(task => {
        const taskStart = new Date(task.fecha_inicio);
        const taskEnd = new Date(task.fecha_fin);

        // Normalizar fechas al inicio del día para comparación correcta
        const normalizedTaskStart = startOfDay(taskStart);
        const normalizedTaskEnd = endOfDay(taskEnd);
        const normalizedWeekStart = startOfDay(weekStart);
        const normalizedWeekEnd = endOfDay(weekEnd);

        // Verificar si hay solapamiento con la semana actual
        const hasOverlap = normalizedTaskStart <= normalizedWeekEnd && normalizedTaskEnd >= normalizedWeekStart;

        return hasOverlap;
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
          {/* Header de la semana */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Semana del {format(weekStart, 'd MMM', { locale: es })} - {format(weekEnd, 'd MMM', { locale: es })}
            </Typography>

            {weekTasks.length > 0 && (
              <Chip
                label={`${weekTasks.length} tarea${weekTasks.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  bgcolor: weekTasks[0]?.color || '#6750A4',
                  color: '#fff',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>

          <Divider sx={{ my: 1 }} />

          {weekTasks.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              {weekTasks.map(task => {
                const isMultiDay = task.fecha_inicio !== task.fecha_fin;
                const taskColor = task.color || '#6750A4';

                // Iconos según el tipo de tarea
                let icon = null;
                if (task.tipo === 'semanal') {
                  icon = <RepeatIcon sx={{ fontSize: '1rem', color: taskColor }} />;
                } else if (task.tipo === 'diaria') {
                  icon = <EventIcon sx={{ fontSize: '1rem', color: taskColor }} />;
                } else if (isMultiDay || task.tipo === 'personalizado') {
                  icon = <DateRangeIcon sx={{ fontSize: '1rem', color: taskColor }} />;
                }

                return (
                  <Paper
                    key={task.id}
                    elevation={1}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      borderLeft: `4px solid ${taskColor}`,
                      textDecoration: task.completada ? 'line-through' : 'none',
                      opacity: task.completada ? 0.7 : 1,
                      bgcolor: task.completada ? 'action.hover' : 'background.paper',
                      transition: 'all 0.2s',
                      '&:hover': {
                        elevation: 3,
                        transform: 'translateX(4px)',
                        bgcolor: `${taskColor}08`,
                      },
                    }}
                    onClick={() => onTaskClick && onTaskClick(task)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {/* Icono de completada/pendiente */}
                      {task.completada ? (
                        <CheckCircleIcon sx={{ fontSize: '1.2rem', color: 'success.main' }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: '1.2rem', color: taskColor }} />
                      )}

                      {/* Icono de tipo */}
                      {icon}

                      {/* Título */}
                      <Typography
                        variant="body1"
                        sx={{
                          flex: 1,
                          fontWeight: 500,
                          color: task.completada ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {task.titulo}
                      </Typography>

                      {/* Fecha para tareas diarias */}
                      {task.tipo === 'diaria' && (
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(task.fecha_inicio), 'd MMM', { locale: es })}
                        </Typography>
                      )}

                      {/* Rango de fechas para tareas multi-día */}
                      {isMultiDay && task.tipo !== 'diaria' && (
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(task.fecha_inicio), 'd MMM', { locale: es })} - {format(new Date(task.fecha_fin), 'd MMM', { locale: es })}
                        </Typography>
                      )}

                      {/* Hora */}
                      {task.hora && (
                        <Chip
                          label={task.hora.substring(0, 5)}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: taskColor,
                            color: taskColor,
                          }}
                        />
                      )}

                      {/* Tipo de tarea */}
                      <Chip
                        label={task.tipo.toUpperCase()}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: taskColor,
                          color: taskColor,
                          fontSize: '0.7rem',
                        }}
                      />

                      {/* Prioridad con color de la tarea */}
                      <Chip
                        label={task.prioridad.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: taskColor,
                          color: '#fff',
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    {/* Descripción */}
                    {task.descripcion && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                          ml: icon ? 4.5 : 3.5,
                          fontStyle: 'italic',
                        }}
                      >
                        {task.descripcion}
                      </Typography>
                    )}
                  </Paper>
                );
              })}
            </Box>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 2,
                fontStyle: 'italic',
                textAlign: 'center',
                py: 2,
              }}
            >
              No hay tareas esta semana
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