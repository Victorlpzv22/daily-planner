import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Checkbox,
  IconButton,
  Chip,
  Box,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import RepeatIcon from '@mui/icons-material/Repeat';
import EventIcon from '@mui/icons-material/Event';
import ListAltIcon from '@mui/icons-material/ListAlt';

function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return null;
    return timeString.substring(0, 5);
  };

  const getDateRangeText = () => {
    const inicio = formatDate(task.fecha_inicio);
    const fin = formatDate(task.fecha_fin);

    if (task.fecha_inicio === task.fecha_fin || task.tipo === 'diaria') {
      return inicio;
    }

    return `${inicio} - ${fin}`;
  };

  const getTaskIcon = () => {
    switch (task.tipo) {
      case 'diaria':
        return <EventIcon />;
      case 'semanal':
        return <RepeatIcon />;
      case 'personalizado':
        return <DateRangeIcon />;
      default:
        return <CalendarTodayIcon />;
    }
  };

  return (
    <Card
      elevation={task.completada ? 1 : 2}
      sx={{
        position: 'relative',
        transition: 'all 0.3s ease',
        opacity: task.completada ? 0.7 : 1,
        '&:hover': {
          elevation: 4,
          transform: 'translateY(-2px)',
        },
        borderLeft: `4px solid`,
        borderLeftColor: task.color || '#6750A4',
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Checkbox
            checked={task.completada}
            onChange={() => onToggle(task.id)}
            color="primary"
            sx={{
              mt: -1,
              color: task.color || '#6750A4',
              '&.Mui-checked': {
                color: task.color || '#6750A4',
              }
            }}
          />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                textDecoration: task.completada ? 'line-through' : 'none',
                color: task.completada ? 'text.secondary' : 'text.primary',
                wordBreak: 'break-word',
              }}
            >
              {task.titulo}
            </Typography>

            {task.descripcion && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  textDecoration: task.completada ? 'line-through' : 'none',
                  wordBreak: 'break-word',
                }}
              >
                {task.descripcion}
              </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
              <Chip
                icon={getTaskIcon()}
                label={getDateRangeText()}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: task.color || '#6750A4',
                  color: task.color || '#6750A4',
                }}
              />

              {task.hora && (
                <Chip
                  icon={<AccessTimeIcon />}
                  label={formatTime(task.hora)}
                  size="small"
                  variant="outlined"
                />
              )}

              {task.tipo !== 'diaria' && (
                <Chip
                  label={task.tipo.toUpperCase()}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: task.color || '#6750A4',
                    color: task.color || '#6750A4',
                  }}
                />
              )}

              <Chip
                label={task.prioridad.toUpperCase()}
                size="small"
                sx={{
                  bgcolor: task.color || '#6750A4',
                  color: '#fff',
                }}
              />

              {task.subtasks && task.subtasks.length > 0 && (
                <Chip
                  icon={<ListAltIcon />}
                  label={`${task.subtasks.filter(st => st.completada).length}/${task.subtasks.length}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: task.color || '#6750A4',
                    color: task.color || '#6750A4',
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Tooltip title="Editar">
          <IconButton
            size="small"
            onClick={() => onEdit(task)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton
            size="small"
            onClick={() => onDelete(task.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

export default TaskItem;