import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import NightsStayIcon from '@mui/icons-material/NightsStay';

const dayMap = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const fullDays = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function DaysTimeSlotDisplay({ availableDays = [], availableTimeSlots = {} }) {
  const [selectedDay, setSelectedDay] = useState(availableDays[0] || '');

  const slotData = availableTimeSlots[selectedDay] || {};

  return (
    <Box>
      {/* Day Selector */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
        {dayMap.map((letter, idx) => {
          const day = fullDays[idx];
          const isAvailable = availableDays.includes(day);
          const isSelected = selectedDay === day;
          return (
            <Box
              key={day}
              onClick={() => isAvailable && setSelectedDay(day)}
              sx={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 600,
                cursor: isAvailable ? 'pointer' : 'default',
                bgcolor: isSelected ? '#008cff' : 'transparent',
                border: isAvailable ? (isSelected ? 'none' : '2px solid #008cff') : '2px dashed #ddd',
                color: isSelected ? '#fff' : (isAvailable ? '#008cff' : '#aaa'),
                transition: '0.3s',
                opacity: isAvailable ? 1 : 0.4,
              }}
            >
              {letter}
            </Box>
          );
        })}
      </Box>

      {/* Time Slots Display */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
        {slotData.day?.start && slotData.day?.end && (
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#E3F2FD', p: 0.5, borderRadius: 1 }}>
            <LightModeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
            <Typography variant="caption">
              {slotData.day.start} - {slotData.day.end}
            </Typography>
          </Box>
        )}
        {/* {slotData.night?.start && slotData.night?.end && (
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F3E5F5', p: 0.5, borderRadius: 1 }}>
            <NightsStayIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
            <Typography variant="caption">
              {slotData.night.start} - {slotData.night.end}
            </Typography>
          </Box>
        )} */}
      </Box>
    </Box>
  );
}
