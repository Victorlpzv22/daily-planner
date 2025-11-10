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
import RepeatIcon from '@mui/icons-material/Repeat';

function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'alta':
        return 'error';
      case 'media':
        return 'warning';
      case 'baja':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return null;
    return timeString.substring(0, 5);
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
        borderLeftColor: task.completada ? 'grey.400' : `${getPriorityColor(task.prioridad)}.main`,
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Checkbox
            checked={task.completada}
            onChange={() => onToggle(task.id)}
            color="primary"
            sx={{ mt: -1 }}
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
                icon={<CalendarTodayIcon />}
                label={formatDate(task.fecha)}
                size="small"
                variant="outlined"
                color={getPriorityColor(task.prioridad)}
              />

              {task.hora && (
                <Chip
                  icon={<AccessTimeIcon />}
                  label={formatTime(task.hora)}
                  size="small"
                  variant="outlined"
                />
              )}

              {task.tipo === 'semanal' && (
                <Chip
                  icon={<RepeatIcon />}
                  label="Semanal"
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}

              <Chip
                label={task.prioridad.toUpperCase()}
                size="small"
                color={getPriorityColor(task.prioridad)}
              />
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