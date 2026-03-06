import { CheckCircle } from 'lucide-react';
import styles from './SessionCompleteModal.module.css';

interface SessionCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  duration: number;
}

export function SessionCompleteModal({ isOpen, onClose, duration }: SessionCompleteModalProps) {
  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.successIcon}>
          <CheckCircle size={48} />
        </div>
        
        <h2 className={styles.title}>¡Sesión Completada!</h2>
        
        <p className={styles.message}>
          Has estudiado durante <strong>{formatDuration(duration)}</strong>
        </p>
        
        <p className={styles.motivationalMessage}>
          ¡Excelente trabajo! Tu constancia te llevará al éxito.
        </p>
        
        <button 
          className={styles.closeButton}
          onClick={onClose}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
