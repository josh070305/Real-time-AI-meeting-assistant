import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useMeetingStore from '../store/useMeetingStore';

const SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState('Waiting for connection...');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const updateInsights = useMeetingStore((state) => state.updateInsights);
  const setInsightsLoading = useMeetingStore((state) => state.setInsightsLoading);
  const setError = useMeetingStore((state) => state.setError);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const socket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: token ? { token } : undefined,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setReconnectAttempts(0);
      setLastMessage('Connected to meeting server');
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      setLastMessage(`Disconnected: ${reason}`);
    });

    socket.on('connect_error', (error) => {
      setLastMessage(`Connection error: ${error.message}`);
      setConnected(false);
    });

    socket.on('reconnect_attempt', (attempt) => {
      setReconnectAttempts(attempt);
      setLastMessage(`Reconnecting... attempt ${attempt}`);
    });

    socket.on('reconnect', () => {
      setConnected(true);
      setReconnectAttempts(0);
      setLastMessage('Reconnected successfully');
    });

    socket.on('joined-meeting', ({ meetingId }) => {
      setLastMessage(`Joined room ${meetingId}`);
    });

    socket.on('insights-update', (insights) => {
      setInsightsLoading(false);
      updateInsights(insights);
      setLastMessage('Live insights updated');
    });

    socket.on('meeting-saved', ({ ok, error, meetingId }) => {
      if (ok) {
        setLastMessage(`Meeting saved: ${meetingId}`);
      } else {
        setError(error || 'Meeting could not be saved');
      }
    });

    socket.on('transcript-buffer-update', () => {
      setLastMessage('Receiving transcript...');
    });

    return () => {
      socket.disconnect();
    };
  }, [setError, setInsightsLoading, updateInsights]);

  const joinMeeting = useCallback((meetingId) => {
    if (socketRef.current && meetingId) {
      socketRef.current.emit('join-meeting', { meetingId });
    }
  }, []);

  const sendTranscriptChunk = useCallback((text) => {
    if (socketRef.current && text && connected) {
      socketRef.current.emit('transcript-chunk', { text });
    }
  }, [connected]);

  const stopMeetingSession = useCallback((meetingId, transcript, summary, duration) => {
    return new Promise((resolve) => {
      if (!socketRef.current || !connected) {
        resolve(false);
        return;
      }

      const timeout = setTimeout(() => {
        socketRef.current.off('meeting-saved', handler);
        resolve(false);
      }, 30000);

      const handler = ({ ok, meetingId: savedMeetingId, error }) => {
        clearTimeout(timeout);
        socketRef.current.off('meeting-saved', handler);
        if (ok) {
          resolve(savedMeetingId || meetingId);
        } else {
          console.error('Meeting save error:', error);
          resolve(false);
        }
      };

      socketRef.current.on('meeting-saved', handler);
      socketRef.current.emit('stop-meeting', { meetingId, transcript, summary, duration });
    });
  }, [connected]);

  return {
    connected,
    lastMessage,
    reconnectAttempts,
    joinMeeting,
    sendTranscriptChunk,
    stopMeetingSession,
  };
}
