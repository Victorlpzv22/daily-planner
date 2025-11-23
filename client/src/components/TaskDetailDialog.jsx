import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import RepeatIcon from '@mui/icons-material/Repeat';
import EventIcon from '@mui/icons-material/Event';

function TaskDetailDialog({ task, onClose, onEdit, onDelete, onToggle }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (!task) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
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

  const handleToggle = () => {
    onToggle(task.id);
    onClose();
  };

  const handleEdit = () => {
    onEdit(task);
    onClose();
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pr: 1,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box 
            sx={{ 
              width: 8, 
              height: 40, 
              bgcolor: task.color || '#1976d2', 
              borderRadius: 1,
            }} 
          />
          <Typography variant="h6" component="span">
            Detalles de la tarea
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Título */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              textDecoration: task.completada ? 'line-through' : 'none',
              color: task.completada ? 'text.secondary' : 'text.primary',
            }}
          >
            {task.titulo}
          </Typography>
        </Box>

        {/* Descripción */}
        {task.descripcion && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              {task.descripcion}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Información detallada */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Estado */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {task.completada ? (
              <CheckCircleIcon sx={{ color: 'success.main' }} />
            ) : (
              <RadioButtonUncheckedIcon sx={{ color: 'action.active' }} />
            )}
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Estado
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {task.completada ? 'Completada' : 'Pendiente'}
              </Typography>
            </Box>
          </Box>

          {/* Fecha */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {getTaskIcon()}
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Fecha
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {getDateRangeText()}
              </Typography>
            </Box>
          </Box>

          {/* Hora */}
          {task.hora && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AccessTimeIcon />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Hora
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formatTime(task.hora)}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Chips de información */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            <Chip
              label={`Tipo: ${task.tipo.toUpperCase()}`}
              size="small"
              variant="outlined"
              sx={{
                borderColor: task.color || '#1976d2',
                color: task.color || '#1976d2',
              }}
            />
            <Chip
              label={`Prioridad: ${task.prioridad.toUpperCase()}`}
              size="small"
              sx={{
                bgcolor: task.color || '#1976d2',
                color: '#fff',
              }}
            />
          </Box>

          {/* Vista previa del color */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Color asignado
            </Typography>
            <Box 
              sx={{ 
                width: '100%',
                height: 40,
                bgcolor: task.color || '#1976d2',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#fff', 
                  fontWeight: 500,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                {task.color || '#1976d2'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={handleToggle}
          startIcon={task.completada ? <RadioButtonUncheckedIcon /> : <CheckCircleIcon />}
          variant="outlined"
          sx={{
            borderColor: task.color || '#1976d2',
            color: task.color || '#1976d2',
            '&:hover': {
              borderColor: task.color || '#1976d2',
              bgcolor: task.color ? `${task.color}15` : 'rgba(25, 118, 210, 0.08)',
            },
          }}
        >
          {task.completada ? 'Marcar pendiente' : 'Completar'}
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={handleEdit}
          startIcon={<EditIcon />}
          variant="outlined"
        >
          Editar
        </Button>
        <Button
          onClick={handleDelete}
          startIcon={<DeleteIcon />}
          variant="outlined"
          color="error"
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TaskDetailDialog;