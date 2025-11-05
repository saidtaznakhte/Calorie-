

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XIcon, CalendarIcon as CalendarIconSvg } from './Icons.js';
import { toYYYYMMDD, formatDate } from '../utils/dateUtils.js';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  useEffect(() => {
    if (isOpen) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [isOpen, selectedDate]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday, etc.
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];

    // Fill leading empty days from the previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Fill days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    // Fill trailing empty days for the last row
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  const handleDayClick = (date: Date | null) => {
    if (date) {
      onSelectDate(date);
    }
  };

  if (!isOpen) return null;

  const selectedDateYYYYMMDD = toYYYYMMDD(selectedDate);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-modal-title"
    >
      <div
        className="bg-card dark:bg-dark-card rounded-2xl p-6 w-11/12 max-w-sm animate-slide-in-up flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-light-gray dark:hover:bg-dark-border" aria-label="Previous Month">
            <ChevronLeftIcon className="w-5 h-5 text-text-main dark:text-dark-text-main" />
          </button>
          <h2 id="calendar-modal-title" className="text-xl font-bold text-text-main dark:text-dark-text-main font-montserrat">
            {monthName}
          </h2>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-light-gray dark:hover:bg-dark-border" aria-label="Next Month">
            <ChevronRightIcon className="w-5 h-5 text-text-main dark:text-dark-text-main" />
          </button>
        </header>

        <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">
          {daysOfWeek.map(day => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 flex-1">
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date && date.getMonth() === currentMonth.getMonth();
            const isSelected = date && toYYYYMMDD(date) === selectedDateYYYYMMDD;
            const isToday = date && toYYYYMMDD(date) === toYYYYMMDD(new Date());

            return (
              <button
                key={index}
                onClick={() => handleDayClick(date)}
                disabled={!date || !isCurrentMonth}
                className={`w-full aspect-square flex items-center justify-center rounded-full transition-colors 
                  ${isCurrentMonth ? 'text-text-main dark:text-dark-text-main' : 'text-text-light/40 dark:text-dark-text-light/40 cursor-not-allowed'}
                  ${isSelected ? 'bg-primary text-white font-bold' : ''}
                  ${isToday && !isSelected ? 'border-2 border-secondary font-semibold' : ''}
                  ${!isSelected && isCurrentMonth ? 'hover:bg-light-gray dark:hover:bg-dark-border' : ''}
                  ${!date || !isCurrentMonth ? 'opacity-50' : ''}
                `}
                aria-label={date ? formatDate(date, { weekday: 'long', month: 'long', day: 'numeric' }) : undefined}
                aria-selected={isSelected ? 'true' : undefined}
                aria-current={isToday && !isSelected ? 'date' : undefined}
              >
                {date ? date.getDate() : ''}
              </button>
            );
          })}
        </div>
        
        <button
          onClick={onClose}
          className="w-full bg-primary text-white font-bold py-3 rounded-xl text-lg mt-6"
          aria-label="Close calendar"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CalendarModal;