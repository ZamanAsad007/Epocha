export const getUserLocalDate = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    day: now.getDate(),
    year: now.getFullYear(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

export const formatHistoricalYear = (year) => {
  if (year < 0) return `${Math.abs(year)} BC`;
  if (year === 0) return '1 AD';
  return `${year} AD`;
};

export const formatTodayDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};