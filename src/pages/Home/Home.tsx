import { useState } from 'react';
import { ChevronRight, BarChart3 } from 'lucide-react';
import { Timer } from '../../components/Timer/Timer';
import { MotivationalMessage } from '../../components/MotivationalMessage/MotivationalMessage';
import { useGreeting } from '../../hooks/useGreeting';
import type { Page } from '../../types';
import styles from './Home.module.css';

interface HomeProps {
  onPageChange: (page: Page) => void;
}

export function Home({ onPageChange }: HomeProps) {
  const greeting = useGreeting();

  const encouragementMessages = [
    "¡Sigue adelante!",
    "¡Tú puedes!",
    "¡Cada minuto cuenta!",
    "¡Excelente progreso!",
    "¡No te rindas!",
    "¡Vas muy bien!"
  ];

  const [currentEncouragement, setCurrentEncouragement] = useState(0);

  const handleEncouragementClick = () => {
    setCurrentEncouragement((prev) => (prev + 1) % encouragementMessages.length);
  };

  return (
    <div className={styles.homePage}>
      <header className={styles.header}>
        <div className={styles.topSection}>
          <div className={styles.greetingSection}>
            <h1 className={styles.greeting}>
              <span className={styles.greetingEmoji}>{greeting.emoji}</span>
              {greeting.text}
            </h1>
            <div className={styles.dateSection}>
              <span className={styles.date}>
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
          
          <div className={styles.motivationalSection}>
            <MotivationalMessage />
          </div>
        </div>
      </header>

      <div className={styles.timerSection}>
        <Timer />
      </div>

      <div className={styles.statsSection}>
        <button 
          className={styles.statsButton}
          onClick={() => onPageChange('stats')}
        >
          <div className={styles.statsButtonContent}>
            <BarChart3 size={20} />
            <span className={styles.statsButtonText}>
              Ver estadísticas
            </span>
          </div>
        </button>
      </div>

      <div className={styles.motivationalSectionMobile}>
        <MotivationalMessage />
      </div>

      <div className={styles.keepPushing} onClick={handleEncouragementClick}>
        <div className={styles.encouragementIcon}>🌟</div>
        <div className={styles.keepPushingText}>
          {encouragementMessages[currentEncouragement]}
        </div>
        <div className={styles.progressInfo}>
          <span className={styles.progressText}>Haz clic para más motivación</span>
        </div>
      </div>

      <button 
        className={styles.moodButton}
        onClick={() => onPageChange('mood')}
      >
        <div className={styles.contenidoBotonAnimo}>
          <span className={styles.textoBotonAnimo}>
            ¿Cómo te sientes hoy?
          </span>
          <ChevronRight size={20} />
        </div>
      </button>
    </div>
  );
}
