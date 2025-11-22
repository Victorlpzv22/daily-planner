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
import DateRangeIcon from '@mui/icons-material/DateRange';
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
  differenceInDays,
  max,
  min,
  startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';

function MonthView({ tasks, onTaskClick, onDayClick }) {
  const theme = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  const calculateTaskPosition = (taskStart, taskEnd, weekStart, weekEnd) => {
    const normalizedTaskStart = startOfDay(taskStart);
    const normalizedTaskEnd = startOfDay(taskEnd);
    const normalizedWeekStart = startOfDay(weekStart);
    const normalizedWeekEnd = startOfDay(weekEnd);

    const visibleStart = max([normalizedTaskStart, normalizedWeekStart]);
    const visibleEnd = min([normalizedTaskEnd, normalizedWeekEnd]);

    const startDayIndex = differenceInDays(visibleStart, normalizedWeekStart);
    const spanDays = differenceInDays(visibleEnd, visibleStart) + 1;

    return {
      startColumn: startDayIndex + 1,
      spanColumns: spanDays,
    };
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

      const multiDayTasks = tasks.filter(task => {
        const taskStart = new Date(task.fecha_inicio);
        const taskEnd = new Date(task.fecha_fin);

        if (task.tipo === 'diaria') return false;
        if (task.fecha_inicio === task.fecha_fin) return false;

        return (taskStart <= weekEnd && taskEnd >= weekStart);
      });

      const days = [];
      for (let i = 0; i < 7; i++) {
        const cloneDay = addDays(weekStart, i);

        const dailyTasks = tasks.filter(task => {
          const taskStart = new Date(task.fecha_inicio);
          const normalizedCloneDay = startOfDay(cloneDay);
          const normalizedTaskStart = startOfDay(taskStart);

          if (task.tipo === 'diaria') {
            return isSameDay(normalizedCloneDay, normalizedTaskStart);
          }

          if (task.fecha_inicio === task.fecha_fin) {
            return isSameDay(normalizedCloneDay, normalizedTaskStart);
          }

          return false;
        });

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
                    variant="filled"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick(task);
                    }}
                    sx={{
                      fontSize: '0.65rem',
                      height: 20,
                      bgcolor: task.color || '#6750A4',
                      color: '#fff',
                      textDecoration: task.completada ? 'line-through' : 'none',
                      opacity: task.completada ? 0.6 : 1,
                      maxWidth: '100%',
                      '&:hover': {
                        bgcolor: task.color || '#6750A4',
                        filter: 'brightness(0.9)',
                      },
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
          <Box
            id="week-grid"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 1,
            }}
          >
            {days}
          </Box>

          {multiDayTasks.length > 0 && (
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              {multiDayTasks.slice(0, 3).map((task) => {
                const taskStart = new Date(task.fecha_inicio);
                const taskEnd = new Date(task.fecha_fin);
                const { startColumn, spanColumns } = calculateTaskPosition(
                  taskStart,
                  taskEnd,
                  weekStart,
                  weekEnd
                );

                const taskIcon = task.tipo === 'semanal' ? <RepeatIcon /> : <DateRangeIcon />;
                const taskStartFormatted = format(taskStart, 'd MMM', { locale: es });
                const taskEndFormatted = format(taskEnd, 'd MMM', { locale: es });

                return (
                  <Tooltip
                    key={task.id}
                    title={`${task.titulo} (${taskStartFormatted} - ${taskEndFormatted})`}
                    arrow
                    placement="top"
                  >
                    <Paper
                      elevation={2}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '4px',
                        '& > div': {
                          gridColumn: `${startColumn} / span ${spanColumns}`,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          cursor: 'pointer',
                          bgcolor: task.color || '#6750A4',
                          color: '#fff',
                          borderLeft: '4px solid',
                          borderLeftColor: task.color || '#6750A4',
                          filter: task.completada ? 'brightness(0.7)' : 'none',
                          borderRadius: 1,
                          transition: 'all 0.2s',
                          textDecoration: task.completada ? 'line-through' : 'none',
                          opacity: task.completada ? 0.6 : 1,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4],
                            filter: 'brightness(1.1)',
                          },
                        }}
                        onClick={() => onTaskClick(task)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {React.cloneElement(taskIcon, { sx: { fontSize: '0.9rem' } })}
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              fontSize: '0.8rem',
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {task.titulo}
                          </Typography>
                          {spanColumns >= 3 && (
                            <Typography
                              variant="caption"
                              sx={{
                                opacity: 0.8,
                                fontSize: '0.65rem',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {taskStartFormatted} - {taskEndFormatted}
                            </Typography>
                          )}
                          {task.hora && spanColumns >= 2 && (
                            <Typography
                              variant="caption"
                              sx={{
                                opacity: 0.8,
                                fontSize: '0.7rem',
                              }}
                            >
                              {task.hora.substring(0, 5)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </Tooltip>
                );
              })}
            </Box>
          )}

          {multiDayTasks.length > 3 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: '0.65rem',
                textAlign: 'center',
                fontStyle: 'italic',
                display: 'block',
                mt: 0.5,
              }}
            >
              +{multiDayTasks.length - 3} tareas más
            </Typography>
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