import { useMemo } from 'react';
import type { StudySession } from '../types';

export interface StudyStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalSessions: number;
  averageSessionLength: number;
  bestDay: {
    date: string;
    duration: number;
  };
  currentStreak: number;
}

export function useStudyStats(sessions: StudySession[]): StudyStats {
  return useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Get start of week (Monday)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate today's total
    const todaySessions = sessions.filter(session => session.date === today);
    const todayTotal = todaySessions.reduce((total, session) => total + session.duration, 0);
    
    // Calculate this week's total
    const weekSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startOfWeek;
    });
    const weekTotal = weekSessions.reduce((total, session) => total + session.duration, 0);
    
    // Calculate this month's total
    const monthSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startOfMonth;
    });
    const monthTotal = monthSessions.reduce((total, session) => total + session.duration, 0);
    
    // Calculate average session length
    const totalDuration = sessions.reduce((total, session) => total + session.duration, 0);
    const averageSessionLength = sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0;
    
    // Find best day
    const dailyTotals = sessions.reduce((acc, session) => {
      acc[session.date] = (acc[session.date] || 0) + session.duration;
      return acc;
    }, {} as Record<string, number>);
    
    const bestDay = Object.keys(dailyTotals).length > 0 
      ? Object.entries(dailyTotals).reduce(
          (best, [date, duration]) => {
            return duration > best.duration ? { date, duration } : best;
          },
          { date: '', duration: 0 }
        )
      : { date: '', duration: 0 };
    
    // Calculate current streak
    let currentStreak = 0;
    const sortedDates = Object.keys(dailyTotals).sort().reverse();
    const todayIndex = sortedDates.indexOf(today);
    
    if (todayIndex !== -1) {
      currentStreak = 1;
      for (let i = todayIndex + 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i - 1]);
        const prevDate = new Date(sortedDates[i]);
        const diffTime = currentDate.getTime() - prevDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    return {
      today: todayTotal,
      thisWeek: weekTotal,
      thisMonth: monthTotal,
      totalSessions: sessions.length,
      averageSessionLength,
      bestDay,
      currentStreak
    };
  }, [sessions]);
}
