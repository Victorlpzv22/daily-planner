import React from 'react';
import { ToggleButtonGroup, ToggleButton, useMediaQuery, useTheme } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';

function ViewSelector({ currentView, onViewChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const views = [
    { id: 'list', label: 'Lista', icon: <ViewListIcon /> },
    { id: 'month', label: isMobile ? 'Mes' : 'Mes (Días)', icon: <CalendarMonthIcon /> },
    { id: 'week', label: isMobile ? 'Sem.' : 'Mes (Semanas)', icon: <ViewWeekIcon /> },
  ];

  return (
    <ToggleButtonGroup
      value={currentView}
      exclusive
      onChange={(e, newView) => {
        if (newView !== null) {
          onViewChange(newView);
        }
      }}
      color="primary"
      size={isMobile ? 'small' : 'medium'}
    >
      {views.map((view) => (
        <ToggleButton key={view.id} value={view.id}>
          {view.icon}
          <span style={{ marginLeft: 8 }}>{view.label}</span>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export default ViewSelector;