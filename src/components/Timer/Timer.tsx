import { Play, Pause, Square, CheckCircle } from 'lucide-react';
import { useState, memo, useMemo } from 'react';
import { useTimer } from '../../hooks/useTimer';
import { SessionCompleteModal } from '../SessionCompleteModal/SessionCompleteModal';
import styles from './Timer.module.css';

const Timer = memo(function Timer() {
  const { time, isRunning, startTimer, stopTimer, resetTimer, finishSession, formatTime, sessions } = useTimer();
  const [showModal, setShowModal] = useState(false);
  const [completedSessionDuration, setCompletedSessionDuration] = useState(0);

  const handleFinishSession = () => {
    if (time > 0) {
      setCompletedSessionDuration(time);
      finishSession();
      setShowModal(true);
    }
  };

  // Memoizar cálculos pesados para evitar recalcularlos en cada render
  const { progress, strokeDashoffset, formattedTotalTime, circumference } = useMemo(() => {
    // Calculate total time today
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(session => session.date === today);
    const totalTimeToday = todaySessions.reduce((total, session) => total + session.duration, 0) + time;

    // Calculate progress for circular timer (assuming 25 minutes = 100%)
    const maxTime = 25 * 60; // 25 minutes in seconds
    const progress = Math.min((time / maxTime) * 100, 100);
    const circumference = 2 * Math.PI * 88; // radius of 88px
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const formatTotalTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    };

    return {
      totalTimeToday,
      progress,
      strokeDashoffset,
      formattedTotalTime: formatTotalTime(totalTimeToday),
      circumference
    };
  }, [time, sessions]);

  return (
    <div className={styles.timerContainer}>
      <div className={styles.circularTimer}>
        <svg className={styles.circularProgress} viewBox="0 0 200 200">
          <circle
            className={styles.progressBackground}
            cx="100"
            cy="100"
            r="88"
          />
          <circle
            className={styles.progressBar}
            cx="100"
            cy="100"
            r="88"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className={styles.timerDisplay}>
          <div className={styles.timeText}>
            {formatTime(time)}
          </div>
          <div className={styles.progressText}>
            {progress.toFixed(0)}% de 25min
          </div>
        </div>
      </div>

      <div className={styles.timerControls}>
        {!isRunning ? (
          <button
            className={`${styles.controlButton} ${styles.playButton}`}
            onClick={startTimer}
            aria-label="Start timer"
          >
            <Play size={24} fill="currentColor" />
          </button>
        ) : (
          <button
            className={`${styles.controlButton} ${styles.pauseButton}`}
            onClick={stopTimer}
            aria-label="Pause timer"
          >
            <Pause size={24} fill="currentColor" />
          </button>
        )}
        
        {time > 0 && (
          <button
            className={`${styles.controlButton} ${styles.finishButton}`}
            onClick={handleFinishSession}
            aria-label="Finalizar sesión"
            title="Finalizar sesión de estudio"
          >
            <CheckCircle size={24} />
          </button>
        )}
        
        <button
          className={`${styles.controlButton} ${styles.resetButton}`}
          onClick={resetTimer}
          aria-label="Reset timer"
        >
          <Square size={24} />
        </button>
      </div>

      <div className={styles.statsCard}>
        <div className={styles.statsTitle}>Has estudiado</div>
        <div className={styles.statsValue}>
          {formattedTotalTime} hoy
        </div>
      </div>

      <SessionCompleteModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        duration={completedSessionDuration}
      />
    </div>
  );
});

export { Timer };
