import React from 'react';
import { Box, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ListIcon from '@mui/icons-material/List';

function TaskFilter({ currentFilter, onFilterChange, taskCounts }) {
  const filters = [
    {
      id: 'all',
      label: 'Todas',
      icon: <ListIcon />,
      count: taskCounts.all,
    },
    {
      id: 'pending',
      label: 'Pendientes',
      icon: <RadioButtonUncheckedIcon />,
      count: taskCounts.pending,
    },
    {
      id: 'completed',
      label: 'Completadas',
      icon: <CheckCircleOutlineIcon />,
      count: taskCounts.completed,
    },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {filters.map((filter) => (
        <Chip
          key={filter.id}
          icon={filter.icon}
          label={`${filter.label} (${filter.count})`}
          onClick={() => onFilterChange(filter.id)}
          color={currentFilter === filter.id ? 'primary' : 'default'}
          variant={currentFilter === filter.id ? 'filled' : 'outlined'}
          sx={{
            fontWeight: currentFilter === filter.id ? 600 : 400,
          }}
        />
      ))}
    </Box>
  );
}

export default TaskFilter;