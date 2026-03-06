import { useState, useEffect } from 'react';
import { Bell, CheckCircle, X } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import styles from './NotificationWelcome.module.css';

export function NotificationWelcome() {
  const { requestNotificationPermission, showNotification } = useNotifications();
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage('hasSeenNotificationWelcome', false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Mostrar bienvenida si el usuario no la ha visto y las notificaciones no están habilitadas
    if (!hasSeenWelcome && 'Notification' in window && Notification.permission === 'default') {
      setShowWelcome(true);
    }
  }, [hasSeenWelcome]);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      showNotification(
        '🎉 ¡Notificaciones habilitadas!',
        'Ahora recibirás recordatorios de tus eventos del calendario.',
        { icon: '/favicon.ico' }
      );
    }
    handleDismiss();
  };

  const handleDismiss = () => {
    setShowWelcome(false);
    setHasSeenWelcome(true);
  };

  if (!showWelcome) {
    return null;
  }

  return (
    <div className={styles.notificationWelcome}>
      <div className={styles.welcomeHeader}>
        <Bell className={styles.welcomeIcon} size={24} />
        <h3 className={styles.welcomeTitle}>¡Nueva funcionalidad!</h3>
      </div>
      
      <p className={styles.welcomeText}>
        Ahora puedes recibir notificaciones de tus eventos del calendario. 
        Te recordaremos tus exámenes, tareas y sesiones de estudio para que no se te olvide nada importante.
      </p>
      
      <div className={styles.welcomeActions}>
        <button 
          className={styles.enableButton}
          onClick={handleEnableNotifications}
        >
          <CheckCircle size={16} />
          Habilitar Notificaciones
        </button>
        <button 
          className={styles.dismissButton}
          onClick={handleDismiss}
        >
          <X size={16} />
          Ahora no
        </button>
      </div>
    </div>
  );
}
