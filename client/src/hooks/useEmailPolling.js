import { useState, useEffect, useCallback } from 'react';
import { emailService } from '../services/api';
import toast from 'react-hot-toast';

export const useEmailPolling = (email, enabled = true, interval = 5000) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!email || !enabled || isExpired) return;

    try {
      setError(null);
      const data = await emailService.getMessages(email);

      const newMessageCount = data.messages.length - messages.length;
      if (newMessageCount > 0 && messages.length > 0) {
        toast.success(`${newMessageCount} new message${newMessageCount > 1 ? 's' : ''} received!`);
      }

      setMessages(data.messages);
      setExpiresAt(new Date(data.expiresAt));
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Email address not found');
      } else if (err.response?.status === 410) {
        setError('Email address has expired');
        setIsExpired(true);
      } else {
        setError('Failed to fetch messages');
      }
    }
  }, [email, enabled, messages.length, isExpired]);

  useEffect(() => {
    if (!email || !enabled) return;

    // Reset expired state when email changes
    setIsExpired(false);
    setError(null);
    setMessages([]);
    setExpiresAt(null);

    setLoading(true);
    fetchMessages().finally(() => setLoading(false));

    const intervalId = setInterval(fetchMessages, interval);

    return () => clearInterval(intervalId);
  }, [email, enabled, fetchMessages, interval]);

  const refresh = useCallback(() => {
    if (email && enabled && !isExpired) {
      setLoading(true);
      fetchMessages().finally(() => setLoading(false));
    }
  }, [fetchMessages, email, enabled, isExpired]);

  return {
    messages,
    loading,
    error,
    expiresAt,
    refresh
  };
};