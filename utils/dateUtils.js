
export const toYYYYMMDD = (date) => {
  return date.toISOString().split('T')[0];
};

export const getDayOfWeek = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

export const formatDate = (date, options = { month: 'long', day: 'numeric' }) => {
    return date.toLocaleDateString('en-US', options);
}

export const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

export const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         yesterday.getFullYear() === date.getFullYear();
};