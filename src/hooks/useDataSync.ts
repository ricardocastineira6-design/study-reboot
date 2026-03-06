import { useEffect, useCallback } from 'react';
import type { UserData } from '../types';

/**
 * Hook simplificado para preparar/normalizar datos locales.
 * No hay sincronización remota en esta entrega.
 */
export const useDataSync = () => {
  const syncLocalData = useCallback(async () => {
    try {
      const localData: Partial<UserData> = {
        studySessions: JSON.parse(localStorage.getItem('studySessions') || '[]'),
        questions: JSON.parse(localStorage.getItem('questions') || '[]'),
        notes: JSON.parse(localStorage.getItem('notes') || '[]'),
        tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
        calendarEvents: JSON.parse(localStorage.getItem('calendarEvents') || '[]'),
        moodEntries: JSON.parse(localStorage.getItem('moodEntries') || '[]')
      };

      const hasLocalData = Object.values(localData).some(d => Array.isArray(d) && d.length > 0);
      if (hasLocalData) {
        console.log('Datos locales preparados (sin sincronización remota)');
      }
    } catch (err) {
      console.error('Error procesando datos locales:', err);
    }
  }, []);

  useEffect(() => {
    syncLocalData();
  }, [syncLocalData]);

  return {
    syncCurrentData: syncLocalData
  };
};
