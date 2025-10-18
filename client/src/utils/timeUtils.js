import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export const formatRelativeTime = (date) => {
  const dateObj = new Date(date);

  if (isToday(dateObj)) {
    return format(dateObj, 'HH:mm');
  } else if (isYesterday(dateObj)) {
    return 'Yesterday';
  } else {
    return format(dateObj, 'MMM dd');
  }
};

export const formatFullDateTime = (date) => {
  return format(new Date(date), 'PPpp');
};

export const formatTimeRemaining = (expiresAt) => {
  const now = new Date();
  const expires = new Date(expiresAt);

  if (expires <= now) {
    return 'Expired';
  }

  return formatDistanceToNow(expires, { addSuffix: true });
};

export const getTimeRemainingColor = (expiresAt) => {
  const now = new Date();
  const expires = new Date(expiresAt);
  const timeLeft = expires - now;
  const fiveMinutes = 5 * 60 * 1000;
  const twoMinutes = 2 * 60 * 1000;

  if (timeLeft <= 0) {
    return 'text-red-600';
  } else if (timeLeft <= twoMinutes) {
    return 'text-red-500';
  } else if (timeLeft <= fiveMinutes) {
    return 'text-orange-500';
  } else {
    return 'text-green-600';
  }
};