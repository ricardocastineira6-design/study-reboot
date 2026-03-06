import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface NotificationSettings {
  enabled: boolean;
  reminderMinutes: number;
  soundEnabled: boolean;
  showBrowserNotification: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  reminderMinutes: 15,
  soundEnabled: true,
  showBrowserNotification: true,
  dailyReminder: true,
  dailyReminderTime: '08:00'
};

export function useNotifications() {
  const [settings, setSettings] = useLocalStorage<NotificationSettings>('notificationSettings', defaultSettings);

  // Solicitar permisos para notificaciones del navegador
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Mostrar notificación del navegador
  const showBrowserNotification = useCallback((title: string, body: string, icon?: string) => {
    if (!settings.showBrowserNotification) return;

    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'study-reboot-event',
        requireInteraction: false,
        silent: !settings.soundEnabled
      });

      // Auto cerrar después de 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
  }, [settings.showBrowserNotification, settings.soundEnabled]);

  // Reproducir sonido de notificación
  const playNotificationSound = useCallback(() => {
    if (!settings.soundEnabled) return;

    try {
      // Crear un sonido simple usando Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('No se pudo reproducir el sonido de notificación:', error);
    }
  }, [settings.soundEnabled]);

  // Mostrar notificación completa (visual + sonido)
  const showNotification = useCallback((title: string, body: string, options?: { 
    sound?: boolean; 
    browser?: boolean;
    icon?: string;
  }) => {
    const opts = { sound: true, browser: true, ...options };

    if (opts.sound) {
      playNotificationSound();
    }

    if (opts.browser) {
      showBrowserNotification(title, body, opts.icon);
    }
  }, [playNotificationSound, showBrowserNotification]);

  // Inicializar notificaciones al cargar
  useEffect(() => {
    if (settings.enabled) {
      requestNotificationPermission();
    }
  }, [settings.enabled, requestNotificationPermission]);

  return {
    settings,
    setSettings,
    requestNotificationPermission,
    showNotification,
    showBrowserNotification,
    playNotificationSound
  };
}
