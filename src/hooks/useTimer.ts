import { useState, useEffect, useRef, useCallback } from 'react';
import type { StudySession } from '../types';
import { useLocalStorage } from './useLocalStorage';

export function useTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // seconds
  const [sessions, setSessions] = useLocalStorage<StudySession[]>('studySessions', []);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Optimización: usar useCallback para evitar re-creaciones innecesarias
  const updateTimer = useCallback(() => {
    setTime(prevTime => prevTime + 1);
  }, []);

  useEffect(() => {
    if (isRunning) {
  intervalRef.current = window.setInterval(updateTimer, 1000);
    } else {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, updateTimer]);

  const startTimer = () => {
    setIsRunning(true);
    startTimeRef.current = new Date();
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (startTimeRef.current && time > 0) {
      const session: StudySession = {
        id: Date.now().toString(),
        startTime: startTimeRef.current,
        endTime: new Date(),
        duration: time,
        date: new Date().toISOString().split('T')[0]
      };
      setSessions(prev => [...prev, session]);
    }
  };

  const finishSession = () => {
    if (time > 0) {
      const session: StudySession = {
        id: Date.now().toString(),
        startTime: startTimeRef.current || new Date(),
        endTime: new Date(),
        duration: time,
        date: new Date().toISOString().split('T')[0]
      };
      setSessions(prev => [...prev, session]);
      setTime(0);
      setIsRunning(false);
      startTimeRef.current = null;
    }
  };

  const resetTimer = () => {
    setTime(0);
    setIsRunning(false);
    startTimeRef.current = null;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    time,
    isRunning,
    sessions,
    startTimer,
    stopTimer,
    resetTimer,
    finishSession,
    formatTime
  };
}
