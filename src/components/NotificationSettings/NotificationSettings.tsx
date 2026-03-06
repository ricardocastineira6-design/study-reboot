import { useState } from 'react';
import { Bell, AlertCircle, TestTube } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import styles from './NotificationSettings.module.css';

export function NotificationSettings() {
  const { settings, setSettings, requestNotificationPermission, showNotification } = useNotifications();
  const [showPermissionWarning, setShowPermissionWarning] = useState(
    'Notification' in window && Notification.permission === 'default'
  );

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNumberChange = (key: keyof typeof settings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleTimeChange = (key: keyof typeof settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setShowPermissionWarning(false);
    }
  };

  const handleTestNotification = () => {
    showNotification(
      '🎉 ¡Notificación de prueba!',
      'Las notificaciones están funcionando correctamente. Recibirás recordatorios de tus eventos del calendario.',
      { icon: '/favicon.ico' }
    );
  };

  return (
    <div className={styles.notificationSettings}>
      <h3 className={styles.settingsTitle}>
        <Bell size={20} />
        Configuración de Notificaciones
      </h3>

      {showPermissionWarning && (
        <div className={styles.permissionWarning}>
          <AlertCircle size={20} />
          <span className={styles.permissionText}>
            Para recibir notificaciones, necesitas permitir el acceso en tu navegador.
          </span>
          <button 
            className={styles.permissionButton}
            onClick={handleRequestPermission}
          >
            Permitir Notificaciones
          </button>
        </div>
      )}

      <div className={styles.settingsGrid}>
        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>
            <span className={styles.settingTitle}>Habilitar Notificaciones</span>
            <span className={styles.settingDescription}>
              Activar o desactivar todas las notificaciones del calendario
            </span>
          </div>
          <div 
            className={`${styles.switch} ${settings.enabled ? styles.active : ''}`}
            onClick={() => handleToggle('enabled')}
          >
            <div className={styles.switchHandle} />
          </div>
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>
            <span className={styles.settingTitle}>Tiempo de Recordatorio</span>
            <span className={styles.settingDescription}>
              Minutos antes del evento para recibir la notificación
            </span>
          </div>
          <input
            type="number"
            min="1"
            max="120"
            value={settings.reminderMinutes}
            onChange={(e) => handleNumberChange('reminderMinutes', parseInt(e.target.value) || 15)}
            className={styles.numberInput}
            disabled={!settings.enabled}
          />
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>
            <span className={styles.settingTitle}>Sonido de Notificación</span>
            <span className={styles.settingDescription}>
              Reproducir un sonido cuando llegue una notificación
            </span>
          </div>
          <div 
            className={`${styles.switch} ${settings.soundEnabled ? styles.active : ''}`}
            onClick={() => handleToggle('soundEnabled')}
          >
            <div className={styles.switchHandle} />
          </div>
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>
            <span className={styles.settingTitle}>Notificaciones del Navegador</span>
            <span className={styles.settingDescription}>
              Mostrar notificaciones emergentes en el escritorio
            </span>
          </div>
          <div 
            className={`${styles.switch} ${settings.showBrowserNotification ? styles.active : ''}`}
            onClick={() => handleToggle('showBrowserNotification')}
          >
            <div className={styles.switchHandle} />
          </div>
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>
            <span className={styles.settingTitle}>Recordatorio Diario</span>
            <span className={styles.settingDescription}>
              Recibir un resumen de los eventos del día cada mañana
            </span>
          </div>
          <div 
            className={`${styles.switch} ${settings.dailyReminder ? styles.active : ''}`}
            onClick={() => handleToggle('dailyReminder')}
          >
            <div className={styles.switchHandle} />
          </div>
        </div>

        {settings.dailyReminder && (
          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <span className={styles.settingTitle}>Hora del Recordatorio Diario</span>
              <span className={styles.settingDescription}>
                A qué hora quieres recibir el resumen diario
              </span>
            </div>
            <input
              type="time"
              value={settings.dailyReminderTime}
              onChange={(e) => handleTimeChange('dailyReminderTime', e.target.value)}
              className={styles.timeInput}
              disabled={!settings.enabled || !settings.dailyReminder}
            />
          </div>
        )}
      </div>

      <button 
        className={styles.testButton}
        onClick={handleTestNotification}
        disabled={!settings.enabled}
      >
        <TestTube size={18} />
        Probar Notificación
      </button>
    </div>
  );
}
