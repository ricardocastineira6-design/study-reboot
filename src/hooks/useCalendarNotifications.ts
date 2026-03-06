import { useEffect, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { useLocalStorage } from './useLocalStorage';
import type { CalendarEvent } from '../types';

interface EventNotification {
  eventId: string;
  notificationTime: number;
  sent: boolean;
}

export function useCalendarNotifications() {
  const { showNotification, settings } = useNotifications();
  const [events] = useLocalStorage<CalendarEvent[]>('calendarEvents', []);
  const [sentNotifications, setSentNotifications] = useLocalStorage<EventNotification[]>('sentNotifications', []);

  // Limpiar notificaciones viejas (más de 7 días)
  const cleanupOldNotifications = useCallback(() => {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    setSentNotifications(prev => 
      prev.filter(notification => notification.notificationTime > sevenDaysAgo)
    );
  }, [setSentNotifications]);

  // Programar notificación para un evento
  const scheduleEventNotification = useCallback((event: CalendarEvent) => {
    if (!settings.enabled) return;

    try {
      const eventDate = new Date(event.date);
      const now = new Date();

      // Si el evento incluye hora, usarla; si no, usar 9:00 AM por defecto
      if (event.time) {
        const [hours, minutes] = event.time.split(':').map(Number);
        eventDate.setHours(hours, minutes, 0, 0);
      } else {
        eventDate.setHours(9, 0, 0, 0);
      }

      // Calcular el tiempo de la notificación (X minutos antes del evento)
      const notificationTime = eventDate.getTime() - (settings.reminderMinutes * 60 * 1000);

      // Solo programar si la notificación es en el futuro
      if (notificationTime > now.getTime()) {
        // Verificar si ya enviamos esta notificación
        const alreadySent = sentNotifications.some(
          notification => notification.eventId === event.id && 
          Math.abs(notification.notificationTime - notificationTime) < 60000 // 1 minuto de tolerancia
        );

        if (!alreadySent) {
          const timeUntilNotification = notificationTime - now.getTime();

          setTimeout(() => {
            const eventTypeEmoji = getEventEmoji(event);
            const categoryText = event.category === 'estudio' ? '📚 Estudio' : '📅 Personal';
            const timeText = event.time ? ` a las ${event.time}` : '';
            
            showNotification(
              `${eventTypeEmoji} Recordatorio: ${event.title}`,
              `${categoryText}${timeText} • ${settings.reminderMinutes} min antes`,
              {
                icon: '/favicon.ico'
              }
            );

            // Marcar como enviada
            setSentNotifications(prev => [
              ...prev,
              {
                eventId: event.id,
                notificationTime,
                sent: true
              }
            ]);
          }, timeUntilNotification);

          console.log(`📅 Notificación programada para "${event.title}" en ${Math.round(timeUntilNotification / 60000)} minutos`);
        }
      }
    } catch (error) {
      console.error('Error al programar notificación:', error);
    }
  }, [settings.enabled, settings.reminderMinutes, showNotification, sentNotifications, setSentNotifications]);

  // Obtener emoji según el tipo de evento
  const getEventEmoji = (event: CalendarEvent) => {
    if (event.category === 'estudio') {
      switch (event.type) {
        case 'exam': return '📝';
        case 'assignment': return '📋';
        case 'study': return '📚';
        default: return '📖';
      }
    }
    return '📅';
  };

  // Programar recordatorio diario
  const scheduleDailyReminder = useCallback(() => {
    if (!settings.dailyReminder) return;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0); // 8:00 AM por defecto

    if (settings.dailyReminderTime) {
      const [hours, minutes] = settings.dailyReminderTime.split(':').map(Number);
      tomorrow.setHours(hours, minutes, 0, 0);
    }

    const timeUntilReminder = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      const todayStr = tomorrow.toISOString().split('T')[0];
      const todayEvents = events.filter(event => event.date === todayStr);

      if (todayEvents.length > 0) {
        const eventsList = todayEvents.map(event => `• ${event.title}`).join('\n');
        showNotification(
          '🌅 Buenos días! Tienes eventos hoy:',
          eventsList,
          { icon: '/favicon.ico' }
        );
      }

      // Programar el siguiente recordatorio diario
      scheduleDailyReminder();
    }, timeUntilReminder);
  }, [settings.dailyReminder, settings.dailyReminderTime, events, showNotification]);

  // Verificar eventos próximos cada minuto
  useEffect(() => {
    if (!settings.enabled) return;

    const checkUpcomingEvents = () => {
      const now = new Date();
      const nextHour = new Date(now.getTime() + (60 * 60 * 1000)); // Próxima hora

      events.forEach(event => {
        const eventDate = new Date(event.date);
        
        // Si el evento incluye hora, usarla
        if (event.time) {
          const [hours, minutes] = event.time.split(':').map(Number);
          eventDate.setHours(hours, minutes, 0, 0);
        } else {
          eventDate.setHours(9, 0, 0, 0);
        }

        // Si el evento es dentro de la próxima hora, programar notificación
        if (eventDate.getTime() > now.getTime() && eventDate.getTime() <= nextHour.getTime()) {
          scheduleEventNotification(event);
        }
      });
    };

    // Verificar inmediatamente
    checkUpcomingEvents();

    // Verificar cada 5 minutos
    const interval = setInterval(checkUpcomingEvents, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [events, scheduleEventNotification, settings.enabled]);

  // Limpiar notificaciones viejas al cargar
  useEffect(() => {
    cleanupOldNotifications();
  }, [cleanupOldNotifications]);

  // Programar recordatorio diario
  useEffect(() => {
    if (settings.dailyReminder) {
      scheduleDailyReminder();
    }
  }, [scheduleDailyReminder, settings.dailyReminder]);

  return {
    scheduleEventNotification,
    sentNotifications
  };
}
