import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import EventIcon from '@mui/icons-material/Event';
import RepeatIcon from '@mui/icons-material/Repeat';

dayjs.locale('es');

function TaskForm({ task, onSubmit, onCancel }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha: dayjs(),
    hora: null,
    prioridad: 'media',
    tipo: 'diaria',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        titulo: task.titulo || '',
        descripcion: task.descripcion || '',
        fecha: task.fecha ? dayjs(task.fecha) : dayjs(),
        hora: task.hora ? dayjs(`2000-01-01 ${task.hora}`) : null,
        prioridad: task.prioridad || 'media',
        tipo: task.tipo || 'diaria',
      });
    }
  }, [task]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    }
    
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    const dataToSubmit = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      fecha: formData.fecha.format('YYYY-MM-DD'),
      hora: formData.hora ? formData.hora.format('HH:mm:ss') : null,
      prioridad: formData.prioridad,
      tipo: formData.tipo,
    };

    onSubmit(dataToSubmit);
  };

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <Dialog 
      open={true} 
      onClose={onCancel}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {task ? 'Editar Tarea' : 'Nueva Tarea'}
      </DialogTitle>

      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Título"
            value={formData.titulo}
            onChange={handleChange('titulo')}
            error={!!errors.titulo}
            helperText={errors.titulo}
            required
            fullWidth
            autoFocus
          />

          <TextField
            label="Descripción"
            value={formData.descripcion}
            onChange={handleChange('descripcion')}
            multiline
            rows={3}
            fullWidth
          />

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <DatePicker
              label="Fecha"
              value={formData.fecha}
              onChange={(newValue) => setFormData({ ...formData, fecha: newValue })}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: !!errors.fecha,
                  helperText: errors.fecha,
                },
              }}
            />

            <TimePicker
              label="Hora (opcional)"
              value={formData.hora}
              onChange={(newValue) => setFormData({ ...formData, hora: newValue })}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>

          <FormControl fullWidth>
            <InputLabel>Prioridad</InputLabel>
            <Select
              value={formData.prioridad}
              onChange={handleChange('prioridad')}
              label="Prioridad"
            >
              <MenuItem value="baja">Baja</MenuItem>
              <MenuItem value="media">Media</MenuItem>
              <MenuItem value="alta">Alta</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <InputLabel sx={{ mb: 1 }}>Tipo de Tarea</InputLabel>
            <ToggleButtonGroup
              value={formData.tipo}
              exclusive
              onChange={(e, newTipo) => {
                if (newTipo !== null) {
                  setFormData({ ...formData, tipo: newTipo });
                }
              }}
              fullWidth
              color="primary"
            >
              <ToggleButton value="diaria">
                <EventIcon sx={{ mr: 1 }} />
                Diaria
              </ToggleButton>
              <ToggleButton value="semanal">
                <RepeatIcon sx={{ mr: 1 }} />
                Semanal
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {task ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TaskForm;