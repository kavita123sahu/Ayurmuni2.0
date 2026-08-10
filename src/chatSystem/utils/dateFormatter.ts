/** Always show wall-clock time with AM/PM (e.g. 10:45 AM). */
export const formatMessageTime = (dateString: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
