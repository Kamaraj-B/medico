import React, { useState, useMemo, useEffect } from "react";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import dayjs from "dayjs";

// Generate 15 min slots from given range
const generateTimeSlots = (range) => {
  if (!range) return [];
  const [start, end] = range.split("-");
  const slots = [];
  let current = dayjs(`2025-01-01T${start}`);
  const endTime = dayjs(`2025-01-01T${end}`);

  while (current.isBefore(endTime)) {
    let next = current.add(15, "minute"); // 15 min slots
    if (next.isAfter(endTime)) break;
    slots.push(`${current.format("HH:mm")}-${next.format("HH:mm")}`);
    current = next;
  }
  return slots;
};

// Check if a 15-min slot overlaps any booked range
const isSlotBooked = (slot, bookedSlots) => {
  const [slotStart, slotEnd] = slot.split("-").map(t => dayjs(`2025-01-01T${t}`));
  for (let booked of bookedSlots) {
    const [bookedStart, bookedEnd] = booked.split("-").map(t => dayjs(`2025-01-01T${t}`));
    if (slotStart.isBefore(bookedEnd) && slotEnd.isAfter(bookedStart)) {
      return true; // overlap exists
    }
  }
  return false;
};

const TimeSlotSelector = ({ availableDays, availableTime, bookedSlots, onSelectionChange }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Generate available date list
  const dateOptions = useMemo(() => {
    const today = dayjs();
    const list = [];
    for (let i = 0; i < 30; i++) {
      const d = today.add(i, "day");
      if (availableDays.includes(d.format("dddd"))) {
        list.push({
          label: d.format("dddd, MMMM D"),
          value: d.format("YYYY-MM-DD"),
        });
      }
    }
    return list;
  }, [availableDays]);

  // Generate time options for selected date
  const timeOptions = useMemo(() => {
    if (!selectedDate) return [];
    const weekday = dayjs(selectedDate).format("dddd");
    const times = availableTime[weekday] || {};
    const booked = bookedSlots[selectedDate] || { day: [], night: [] };

    const allSlots = [];
    ["day", "night"].forEach((period) => {
      const slots = generateTimeSlots(times[period]);
      slots.forEach((slot) => {
        const isBookedSlot = isSlotBooked(slot, booked[period] || []);
        allSlots.push({ time: slot, period, booked: isBookedSlot });
      });
    });
    return allSlots;
  }, [selectedDate, availableTime, bookedSlots]);

  // Auto-pick earliest valid end time after selecting start
  useEffect(() => {
    if (startTime) {
      const startIndex = timeOptions.findIndex((slot) => slot.time === startTime);
      const possibleEnds = [];

      // Max 2 slots after start (30 min max)
      for (let i = startIndex + 1; i <= startIndex + 2 && i < timeOptions.length; i++) {
        const slot = timeOptions[i];
        if (slot.booked) break;
        possibleEnds.push(slot);
      }

      if (possibleEnds.length > 0) {
        setEndTime(possibleEnds[0].time); // pick first available
      } else {
        setEndTime("");
      }
    }
  }, [startTime, timeOptions]);

  // Handle select changes
  const handleChange = (type, value) => {
    if (type === "date") {
      setSelectedDate(value);
      setStartTime("");
      setEndTime("");
    } else if (type === "start") {
      setStartTime(value);
      setEndTime(""); // Will be set by useEffect
    } else {
      setEndTime(value);
    }
  };

  // Fire selection change when all are set
  useEffect(() => {
    if (selectedDate && startTime && endTime) {
      onSelectionChange({
        date: selectedDate,
        start: startTime.split("-")[0],
        end: endTime.split("-")[1],
      });
    }
  }, [selectedDate, startTime, endTime, onSelectionChange]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Date Select */}
      <FormControl fullWidth>
        <InputLabel>Date</InputLabel>
        <Select
          value={selectedDate}
          label="Date"
          onChange={(e) => handleChange("date", e.target.value)}
        >
          {dateOptions.map((d) => (
            <MenuItem key={d.value} value={d.value}>
              {d.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Start + End Time Selects */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Start Time */}
        <FormControl sx={{ flex: 1 }}>
          <InputLabel>Start</InputLabel>
          <Select
            value={startTime}
            label="Start"
            onChange={(e) => handleChange("start", e.target.value)}
            disabled={!selectedDate}
          >
            {timeOptions.map((slot) => (
              <MenuItem
                key={slot.time}
                value={slot.time}
                disabled={slot.booked}
                sx={slot.booked ? { color: "red" } : { color: "green" }}
              >
                {slot.time.split("-")[0]} {slot.booked ? "Booked" : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* End Time */}
        <FormControl sx={{ flex: 1 }}>
          <InputLabel>End</InputLabel>
          <Select
            value={endTime}
            label="End"
            onChange={(e) => handleChange("end", e.target.value)}
            disabled={!startTime}
          >
            {(() => {
              if (!startTime) return [];
              const startIndex = timeOptions.findIndex(
                (slot) => slot.time === startTime
              );

              let availableEndSlots = [];
              for (let i = startIndex + 1; i <= startIndex + 2 && i < timeOptions.length; i++) {
                const slot = timeOptions[i];
                if (slot.booked) break;
                availableEndSlots.push(slot);
              }

              return availableEndSlots.map((slot) => (
                <MenuItem key={slot.time} value={slot.time}>
                  {slot.time.split("-")[1]}
                </MenuItem>
              ));
            })()}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default TimeSlotSelector;
