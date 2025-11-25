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
  Alert,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  startOfWeek,
  endOfWeek,
  format,
  addMonths,
  isBefore,
  parseISO,
  isValid
} from 'date-fns';
import { es } from 'date-fns/locale';
import EventIcon from '@mui/icons-material/Event';
import RepeatIcon from '@mui/icons-material/Repeat';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';

// Colores predefinidos por defecto
const DEFAULT_COLORS = [
  { name: 'Rojo', value: '#d32f2f' },
  { name: 'Rosa', value: '#c2185b' },
  { name: 'Púrpura', value: '#7b1fa2' },
  { name: 'Índigo', value: '#303f9f' },
  { name: 'Azul', value: '#6750A4' },
  { name: 'Cian', value: '#0097a7' },
  { name: 'Verde', value: '#388e3c' },
  { name: 'Lima', value: '#689f38' },
  { name: 'Naranja', value: '#f57c00' },
  { name: 'Marrón', value: '#5d4037' },
  { name: 'Gris', value: '#616161' },
  { name: 'Azul gris', value: '#455a64' },
];

// Obtener colores del localStorage o usar los predeterminados
const getStoredColors = () => {
  try {
    const stored = localStorage.getItem('presetColors');
    return stored ? JSON.parse(stored) : DEFAULT_COLORS;
  } catch {
    return DEFAULT_COLORS;
  }
};

// Guardar colores en localStorage
const saveColors = (colors) => {
  localStorage.setItem('presetColors', JSON.stringify(colors));
};

function TaskForm({ task, onSubmit, onCancel }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: new Date(),
    fecha_fin: new Date(),
    hora: null,
    prioridad: 'media',
    tipo: 'diaria',
    color: '#6750A4',
  });

  const [errors, setErrors] = useState({});

  const [recurrence, setRecurrence] = useState({
    enabled: false,
    frequency: 'daily',
    interval: 1,
    weekdays: [],
    monthdays: [], // Días específicos del mes (1-31)
    monthWeek: null, // Primera, segunda, tercera, cuarta, última semana
    monthWeekday: null, // Día de la semana para repetición mensual
    endType: 'date',
    endDate: addMonths(new Date(), 1),
    count: 10
  });

  const [subtasks, setSubtasks] = useState([]);

  // Estado para colores predefinidos personalizables
  const [presetColors, setPresetColors] = useState(getStoredColors());
  const [editingColors, setEditingColors] = useState(false);
  const [editingColorIndex, setEditingColorIndex] = useState(null);
  const [tempColorName, setTempColorName] = useState('');
  const [tempColorValue, setTempColorValue] = useState('#000000');

  useEffect(() => {
    if (task) {
      setFormData({
        titulo: task.titulo || '',
        descripcion: task.descripcion || '',
        fecha_inicio: task.fecha_inicio ? parseISO(task.fecha_inicio) : new Date(),
        fecha_fin: task.fecha_fin ? parseISO(task.fecha_fin) : new Date(),
        hora: task.hora ? parseISO(`2000-01-01T${task.hora}`) : null,
        prioridad: task.prioridad || 'media',
        tipo: task.tipo || 'diaria',
        color: task.color || '#1976d2',
      });

      if (task.subtasks) {
        setSubtasks(task.subtasks);
      }
    }
  }, [task]);

  const handleTipoChange = (event, newTipo) => {
    if (newTipo === null) return;

    let newFechaFin = formData.fecha_inicio;

    if (newTipo === 'diaria') {
      newFechaFin = formData.fecha_inicio;
      setFormData({
        ...formData,
        tipo: newTipo,
        fecha_fin: newFechaFin,
      });
    } else if (newTipo === 'semanal') {
      const weekStart = startOfWeek(formData.fecha_inicio, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(formData.fecha_inicio, { weekStartsOn: 1 });
      setFormData({
        ...formData,
        tipo: newTipo,
        fecha_inicio: weekStart,
        fecha_fin: weekEnd,
      });
      // Si la frecuencia es diaria, cambiarla a semanal automáticamente
      if (recurrence.frequency === 'daily') {
        setRecurrence({ ...recurrence, frequency: 'weekly', weekdays: [] });
      }
    } else {
      setFormData({ ...formData, tipo: newTipo, fecha_fin: newFechaFin });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    }

    if (!formData.fecha_inicio || !isValid(formData.fecha_inicio)) {
      newErrors.fecha_inicio = 'La fecha de inicio es obligatoria';
    }

    if (!formData.fecha_fin || !isValid(formData.fecha_fin)) {
      newErrors.fecha_fin = 'La fecha de fin es obligatoria';
    }

    if (formData.fecha_fin && formData.fecha_inicio &&
      isBefore(formData.fecha_fin, formData.fecha_inicio)) {
      newErrors.fecha_fin = 'La fecha de fin debe ser posterior o igual a la de inicio';
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
      fecha_inicio: format(formData.fecha_inicio, 'yyyy-MM-dd'),
      fecha_fin: format(formData.fecha_fin, 'yyyy-MM-dd'),
      hora: formData.hora ? format(formData.hora, 'HH:mm:ss') : null,
      prioridad: formData.prioridad,
      tipo: formData.tipo,
      color: formData.color,
      recurrence: recurrence.enabled ? {
        enabled: true,
        frequency: recurrence.frequency,
        interval: recurrence.interval,
        weekdays: recurrence.weekdays,
        monthdays: recurrence.monthdays,
        monthWeek: recurrence.monthWeek,
        monthWeekday: recurrence.monthWeekday,
        endDate: recurrence.endDate ? format(recurrence.endDate, 'yyyy-MM-dd') : null,
        count: recurrence.count
      } : null,
      subtasks: subtasks.filter(st => st.titulo.trim() !== '')
    };

    onSubmit(dataToSubmit);
  };

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleFechaInicioChange = (newValue) => {
    if (!newValue || !isValid(newValue)) return;

    if (formData.tipo === 'diaria') {
      setFormData({ ...formData, fecha_inicio: newValue, fecha_fin: newValue });
    } else if (formData.tipo === 'semanal') {
      const weekStart = startOfWeek(newValue, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(newValue, { weekStartsOn: 1 });
      setFormData({
        ...formData,
        fecha_inicio: weekStart,
        fecha_fin: weekEnd,
      });
    } else {
      setFormData({ ...formData, fecha_inicio: newValue });
    }
  };

  const handleColorSelect = (color) => {
    setFormData({ ...formData, color });
  };

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { titulo: '', completada: false }]);
  };

  const handleSubtaskChange = (index, value) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index].titulo = value;
    setSubtasks(newSubtasks);
  };

  const handleRemoveSubtask = (index) => {
    const newSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(newSubtasks);
  };

  // Funciones para gestionar colores predefinidos
  const handleStartEditColor = (index) => {
    setEditingColorIndex(index);
    setTempColorName(presetColors[index].name);
    setTempColorValue(presetColors[index].value);
  };

  const handleSaveEditColor = () => {
    if (editingColorIndex !== null && tempColorName.trim()) {
      const newColors = [...presetColors];
      newColors[editingColorIndex] = { name: tempColorName.trim(), value: tempColorValue };
      setPresetColors(newColors);
      saveColors(newColors);
      setEditingColorIndex(null);
    }
  };

  const handleCancelEditColor = () => {
    setEditingColorIndex(null);
    setTempColorName('');
    setTempColorValue('#000000');
  };

  const handleResetColors = () => {
    setPresetColors(DEFAULT_COLORS);
    saveColors(DEFAULT_COLORS);
    setEditingColors(false);
  };

  return (
    <Dialog
      open={true}
      onClose={onCancel}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 8,
            height: 32,
            bgcolor: formData.color,
            borderRadius: 1
          }}
        />
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

          <Box>
            <InputLabel sx={{ mb: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
              Tipo de Tarea
            </InputLabel>
            <ToggleButtonGroup
              value={formData.tipo}
              exclusive
              onChange={handleTipoChange}
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
              <ToggleButton value="personalizado">
                <DateRangeIcon sx={{ mr: 1 }} />
                Personalizado
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {formData.tipo === 'diaria' && (
            <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
              La tarea se realizará en un solo día
            </Alert>
          )}

          {formData.tipo === 'semanal' && (
            <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
              La tarea abarcará desde el lunes hasta el domingo de la semana seleccionada.
              {recurrence.enabled && ' Las repeticiones siempre comenzarán en lunes.'}
            </Alert>
          )}

          {formData.tipo === 'personalizado' && (
            <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
              Selecciona las fechas de inicio y fin manualmente
            </Alert>
          )}

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha de Inicio"
              value={formData.fecha_inicio}
              onChange={handleFechaInicioChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  error={!!errors.fecha_inicio}
                  helperText={errors.fecha_inicio}
                />
              )}
            />

            <DatePicker
              label="Fecha de Fin"
              value={formData.fecha_fin}
              onChange={(newValue) => setFormData({ ...formData, fecha_fin: newValue })}
              disabled={formData.tipo === 'diaria' || formData.tipo === 'semanal'}
              minDate={formData.fecha_inicio}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  error={!!errors.fecha_fin}
                  helperText={errors.fecha_fin ||
                    (formData.tipo !== 'personalizado' ? 'Automático según el tipo' : 'Debe ser igual o posterior a la fecha de inicio')}
                />
              )}
            />

            <TimePicker
              label="Hora (opcional)"
              value={formData.hora}
              onChange={(newValue) => setFormData({ ...formData, hora: newValue })}
              renderInput={(params) => <TextField {...params} fullWidth />}
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

          <Divider sx={{ my: 1 }} />

          {/* Recurrence Section */}
          {!task && (
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: recurrence.enabled ? 2 : 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RepeatIcon color="action" />
                  <Typography variant="body1">Repetir tarea</Typography>
                </Box>
                <Button
                  variant={recurrence.enabled ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setRecurrence({ ...recurrence, enabled: !recurrence.enabled })}
                >
                  {recurrence.enabled ? "Activado" : "Desactivado"}
                </Button>
              </Box>

              {recurrence.enabled && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Frecuencia</InputLabel>
                      <Select
                        value={recurrence.frequency}
                        label="Frecuencia"
                        onChange={(e) => setRecurrence({ ...recurrence, frequency: e.target.value })}
                      >
                        {/* Para tareas semanales, no permitir frecuencia diaria */}
                        {formData.tipo !== 'semanal' && (
                          <MenuItem value="daily">Diaria</MenuItem>
                        )}
                        <MenuItem value="weekly">Semanal</MenuItem>
                        <MenuItem value="monthly">Mensual</MenuItem>
                        <MenuItem value="yearly">Anual</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Cada..."
                      type="number"
                      size="small"
                      value={recurrence.interval}
                      onChange={(e) => setRecurrence({ ...recurrence, interval: Math.max(1, parseInt(e.target.value) || 1) })}
                      InputProps={{
                        endAdornment: <Typography variant="caption" sx={{ ml: 1 }}>
                          {recurrence.frequency === 'daily' ? 'días' :
                            recurrence.frequency === 'weekly' ? 'semanas' :
                              recurrence.frequency === 'monthly' ? 'meses' : 'años'}
                        </Typography>
                      }}
                      sx={{ width: '150px' }}
                    />
                  </Box>

                  {recurrence.frequency === 'weekly' && formData.tipo !== 'semanal' && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Días de la semana
                      </Typography>
                      <ToggleButtonGroup
                        value={recurrence.weekdays}
                        onChange={(e, newDays) => setRecurrence({ ...recurrence, weekdays: newDays })}
                        aria-label="días de la semana"
                        size="small"
                        fullWidth
                      >
                        {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map((day, index) => (
                          <ToggleButton key={day} value={day} aria-label={day}>
                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'][index]}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </Box>
                  )}

                  {recurrence.frequency === 'weekly' && formData.tipo === 'semanal' && (
                    <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                      Las tareas semanales se repetirán siempre comenzando el lunes de cada semana.
                    </Alert>
                  )}

                  {recurrence.frequency === 'monthly' && formData.tipo !== 'semanal' && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Repetir en...
                      </Typography>
                      
                      {/* Opción 1: Días específicos del mes */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <input
                            type="radio"
                            checked={recurrence.monthWeek === null}
                            onChange={() => setRecurrence({ ...recurrence, monthWeek: null, monthWeekday: null })}
                            style={{ cursor: 'pointer' }}
                          />
                          <Typography variant="body2" sx={{ cursor: 'pointer' }}
                            onClick={() => setRecurrence({ ...recurrence, monthWeek: null, monthWeekday: null })}>
                            Días específicos del mes
                          </Typography>
                        </Box>
                        
                        {recurrence.monthWeek === null && (
                          <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: 0.5,
                            ml: 3,
                          }}>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                              <Box
                                key={day}
                                onClick={() => {
                                  const newDays = recurrence.monthdays.includes(day)
                                    ? recurrence.monthdays.filter(d => d !== day)
                                    : [...recurrence.monthdays, day].sort((a, b) => a - b);
                                  setRecurrence({ ...recurrence, monthdays: newDays });
                                }}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 1,
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: recurrence.monthdays.includes(day) ? 600 : 400,
                                  bgcolor: recurrence.monthdays.includes(day) ? 'primary.main' : 'action.hover',
                                  color: recurrence.monthdays.includes(day) ? 'primary.contrastText' : 'text.primary',
                                  '&:hover': {
                                    bgcolor: recurrence.monthdays.includes(day) ? 'primary.dark' : 'action.selected',
                                  },
                                }}
                              >
                                {day}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>

                      {/* Opción 2: Semana específica del mes */}
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <input
                            type="radio"
                            checked={recurrence.monthWeek !== null}
                            onChange={() => setRecurrence({ ...recurrence, monthWeek: 'first', monthWeekday: 'MO', monthdays: [] })}
                            style={{ cursor: 'pointer' }}
                          />
                          <Typography variant="body2" sx={{ cursor: 'pointer' }}
                            onClick={() => setRecurrence({ ...recurrence, monthWeek: 'first', monthWeekday: 'MO', monthdays: [] })}>
                            Día de la semana específico
                          </Typography>
                        </Box>
                        
                        {recurrence.monthWeek !== null && (
                          <Box sx={{ display: 'flex', gap: 1, ml: 3 }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <InputLabel>Semana</InputLabel>
                              <Select
                                value={recurrence.monthWeek || 'first'}
                                label="Semana"
                                onChange={(e) => setRecurrence({ ...recurrence, monthWeek: e.target.value })}
                              >
                                <MenuItem value="first">Primera</MenuItem>
                                <MenuItem value="second">Segunda</MenuItem>
                                <MenuItem value="third">Tercera</MenuItem>
                                <MenuItem value="fourth">Cuarta</MenuItem>
                                <MenuItem value="last">Última</MenuItem>
                              </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <InputLabel>Día</InputLabel>
                              <Select
                                value={recurrence.monthWeekday || 'MO'}
                                label="Día"
                                onChange={(e) => setRecurrence({ ...recurrence, monthWeekday: e.target.value })}
                              >
                                <MenuItem value="MO">Lunes</MenuItem>
                                <MenuItem value="TU">Martes</MenuItem>
                                <MenuItem value="WE">Miércoles</MenuItem>
                                <MenuItem value="TH">Jueves</MenuItem>
                                <MenuItem value="FR">Viernes</MenuItem>
                                <MenuItem value="SA">Sábado</MenuItem>
                                <MenuItem value="SU">Domingo</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}

                  {recurrence.frequency === 'monthly' && formData.tipo === 'semanal' && (
                    <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                      Las tareas semanales se repetirán el primer lunes de cada mes.
                    </Alert>
                  )}

                  {recurrence.frequency === 'yearly' && formData.tipo === 'semanal' && (
                    <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                      Las tareas semanales se repetirán en la misma semana cada año, comenzando el lunes.
                    </Alert>
                  )}

                  <Divider sx={{ borderStyle: 'dashed' }} />

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Termina
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input
                          type="radio"
                          checked={recurrence.endType === 'date'}
                          onChange={() => setRecurrence({ ...recurrence, endType: 'date' })}
                          style={{ cursor: 'pointer' }}
                        />
                        <Typography
                          variant="body2"
                          onClick={() => setRecurrence({ ...recurrence, endType: 'date' })}
                          sx={{ cursor: 'pointer', flexGrow: 1 }}
                        >
                          En fecha específica
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                          <DatePicker
                            value={recurrence.endDate}
                            onChange={(newValue) => setRecurrence({ ...recurrence, endDate: newValue })}
                            disabled={recurrence.endType !== 'date'}
                            renderInput={(params) => <TextField {...params} size="small" sx={{ width: 160 }} />}
                          />
                        </LocalizationProvider>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input
                          type="radio"
                          checked={recurrence.endType === 'count'}
                          onChange={() => setRecurrence({ ...recurrence, endType: 'count' })}
                          style={{ cursor: 'pointer' }}
                        />
                        <Typography
                          variant="body2"
                          onClick={() => setRecurrence({ ...recurrence, endType: 'count' })}
                          sx={{ cursor: 'pointer', flexGrow: 1 }}
                        >
                          Después de
                        </Typography>
                        <TextField
                          type="number"
                          size="small"
                          value={recurrence.count}
                          onChange={(e) => setRecurrence({ ...recurrence, count: Math.max(1, parseInt(e.target.value) || 1) })}
                          disabled={recurrence.endType !== 'count'}
                          InputProps={{
                            endAdornment: <Typography variant="caption" sx={{ ml: 1 }}>veces</Typography>
                          }}
                          sx={{ width: 160 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          <Divider sx={{ my: 1 }} />

          {/* Subtasks Section */}
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ListAltIcon color="action" />
                <Typography variant="body1">Subtareas</Typography>
              </Box>
              <Button
                startIcon={<AddIcon />}
                size="small"
                onClick={handleAddSubtask}
              >
                Agregar
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {subtasks.map((subtask, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    placeholder="Nueva subtarea"
                    value={subtask.titulo}
                    onChange={(e) => handleSubtaskChange(index, e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <CheckCircleIcon
                          color="disabled"
                          sx={{ mr: 1, fontSize: 20 }}
                        />
                      )
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveSubtask(index)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              {subtasks.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                  No hay subtareas. Agrega una para crear una lista de verificación.
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Selector de Color Mejorado */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <PaletteIcon color="action" />
              <Typography variant="body2" fontWeight={500} color="text.secondary">
                Color de la tarea
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton 
                size="small" 
                onClick={() => setEditingColors(!editingColors)}
                color={editingColors ? 'primary' : 'default'}
                title="Personalizar colores"
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Vista previa del color seleccionado */}
            <Box
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                bgcolor: formData.color,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 1,
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Color seleccionado
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {formData.titulo || 'Vista previa'}
                </Typography>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 32 }} />
            </Box>

            {/* Paleta de colores predefinidos */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Colores predefinidos
              </Typography>
              {editingColors && (
                <Button 
                  size="small" 
                  onClick={handleResetColors}
                  sx={{ fontSize: '0.7rem' }}
                >
                  Restaurar
                </Button>
              )}
            </Box>
            
            {/* Modo edición de colores */}
            {editingColors ? (
              <Box sx={{ mb: 2 }}>
                {presetColors.map((colorOption, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                    }}
                  >
                    {editingColorIndex === index ? (
                      <>
                        <input
                          type="color"
                          value={tempColorValue}
                          onChange={(e) => setTempColorValue(e.target.value)}
                          style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }}
                        />
                        <TextField
                          value={tempColorName}
                          onChange={(e) => setTempColorName(e.target.value)}
                          size="small"
                          placeholder="Nombre del color"
                          sx={{ flexGrow: 1 }}
                        />
                        <Button size="small" onClick={handleSaveEditColor} color="primary">
                          Guardar
                        </Button>
                        <Button size="small" onClick={handleCancelEditColor}>
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: colorOption.value,
                          }}
                        />
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {colorOption.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {colorOption.value}
                        </Typography>
                        <IconButton size="small" onClick={() => handleStartEditColor(index)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 1,
                mb: 2,
              }}>
                {presetColors.map((colorOption) => (
                  <Box
                    key={colorOption.value}
                    onClick={() => handleColorSelect(colorOption.value)}
                    sx={{
                      width: '100%',
                      paddingTop: '100%',
                      position: 'relative',
                      cursor: 'pointer',
                      borderRadius: 1.5,
                      bgcolor: colorOption.value,
                      border: '3px solid',
                      borderColor: formData.color === colorOption.value
                        ? 'primary.main'
                        : 'transparent',
                      transition: 'all 0.2s',
                      boxShadow: formData.color === colorOption.value ? 3 : 1,
                      '&:hover': {
                        transform: 'scale(1.15)',
                        boxShadow: 3,
                        zIndex: 10,
                      },
                      '&::after': formData.color === colorOption.value ? {
                        content: '"✓"',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#fff',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      } : {},
                    }}
                    title={colorOption.name}
                  />
                ))}
              </Box>
            )}

            {/* Input de color personalizado */}
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              O elige un color personalizado
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: 60,
                  height: 56,
                  borderRadius: 1,
                  border: '2px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                />
              </Box>
              <TextField
                label="Código hexadecimal"
                value={formData.color}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.startsWith('#') && value.length <= 7) {
                    handleColorSelect(value);
                  }
                }}
                size="small"
                fullWidth
                placeholder="#1976d2"
                helperText="Formato: #RRGGBB"
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 0.5,
                        bgcolor: formData.color,
                        border: '1px solid',
                        borderColor: 'divider',
                        mr: 1,
                      }}
                    />
                  ),
                }}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onCancel} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: formData.color,
            minWidth: 120,
            '&:hover': {
              bgcolor: formData.color,
              filter: 'brightness(0.85)',
            }
          }}
        >
          {task ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TaskForm;