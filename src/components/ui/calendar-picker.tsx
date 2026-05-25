"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface CalendarPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function CalendarPicker({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}: CalendarPickerProps) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  if (!isOpen) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setViewDate(today);
    onSelectDate(today);
    onClose();
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(year, month, day);
    newDate.setHours(0, 0, 0, 0);
    onSelectDate(newDate);
    onClose();
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl p-4 w-full max-w-sm shadow-xl border border-border animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">Select Date</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-text-primary">
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-text-muted py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const date = new Date(year, month, day);
            const isSelected = isSameDay(date, selectedDate);
            const isTodayDate = isToday(date);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-white shadow-md"
                    : isTodayDate
                    ? "bg-primary-light text-primary ring-1 ring-primary"
                    : "text-text-primary hover:bg-surface-hover"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Today Button */}
        <button
          onClick={goToToday}
          className="w-full mt-4 py-2.5 rounded-lg bg-surface-secondary text-text-secondary font-medium hover:bg-surface-hover transition-colors"
        >
          Go to Today
        </button>
      </div>
    </div>
  );
}
