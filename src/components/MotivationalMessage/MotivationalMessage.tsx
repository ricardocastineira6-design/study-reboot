import { RefreshCw } from 'lucide-react';
import { useMotivationalMessage } from '../../hooks/useMotivationalMessage';
import styles from './MotivationalMessage.module.css';

export function MotivationalMessage() {
  const { message, author, refreshMessage } = useMotivationalMessage();

  return (
    <div className={styles.motivationalCard}>
      <div className={styles.messageContent}>
        <div className={styles.messageText}>
          "{message}"
        </div>
        <div className={styles.messageAuthor}>
          — {author}
        </div>
      </div>
      <button 
        className={styles.refreshButton}
        onClick={refreshMessage}
        title="Nueva frase"
      >
        <RefreshCw size={16} />
      </button>
    </div>
  );
}
