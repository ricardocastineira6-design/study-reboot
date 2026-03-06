import { Calendar, Clock, Trophy, Flame, BarChart3, TrendingUp } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTimer } from '../../hooks/useTimer';
import { useStudyStats } from '../../hooks/useStudyStats';
import styles from './StudyHistory.module.css';

export const StudyHistory = memo(function StudyHistory() {
  const { sessions } = useTimer();
  const stats = useStudyStats(sessions);

  // Memoizar funciones de formato para evitar recrearlas
  const formatDuration = useMemo(() => (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  const formatDate = useMemo(() => (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  }, []);

  // Memoizar sesiones recientes para evitar recalcular
  const recentSessions = useMemo(() => sessions
    .slice(-10)
    .reverse()
    .map(session => ({
      ...session,
      formattedDate: formatDate(session.date),
      formattedDuration: formatDuration(session.duration)
    })), [sessions, formatDate, formatDuration]);

  return (
    <div className={styles.historyContainer}>
      <h2 className={styles.title}>
        <BarChart3 size={24} />
        Tu Progreso de Estudio
      </h2>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Clock size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {stats.today > 0 ? formatDuration(stats.today) : '⏰'}
            </div>
            <div className={styles.statLabel}>
              {stats.today > 0 ? 'Hoy' : 'Estudia hoy'}
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Calendar size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {stats.thisWeek > 0 ? formatDuration(stats.thisWeek) : '📅'}
            </div>
            <div className={styles.statLabel}>
              {stats.thisWeek > 0 ? 'Esta Semana' : 'Primera semana'}
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {stats.thisMonth > 0 ? formatDuration(stats.thisMonth) : '📈'}
            </div>
            <div className={styles.statLabel}>
              {stats.thisMonth > 0 ? 'Este Mes' : 'Primer mes'}
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Flame size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {stats.currentStreak > 0 ? stats.currentStreak : '🚀'}
            </div>
            <div className={styles.statLabel}>
              {stats.currentStreak > 0 ? 'Días Seguidos' : 'Comienza tu racha'}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className={styles.additionalStats}>
        <div className={styles.additionalStat}>
          <Trophy size={16} />
          <span>
            Mejor día: {stats.bestDay.date ? 
              `${formatDate(stats.bestDay.date)} (${formatDuration(stats.bestDay.duration)})` : 
              'Aún no hay sesiones registradas'
            }
          </span>
        </div>
        <div className={styles.additionalStat}>
          <BarChart3 size={16} />
          <span>
            Promedio por sesión: {stats.totalSessions > 0 ? 
              formatDuration(stats.averageSessionLength) : 
              'Sin datos aún'
            }
          </span>
        </div>
        <div className={styles.additionalStat}>
          <Clock size={16} />
          <span>Total de sesiones: {stats.totalSessions}</span>
        </div>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className={styles.recentSessions}>
          <h3 className={styles.sectionTitle}>Sesiones Recientes</h3>
          <div className={styles.sessionsList}>
            {recentSessions.map((session) => (
              <div key={session.id} className={styles.sessionItem}>
                <div className={styles.sessionDate}>
                  {session.formattedDate}
                </div>
                <div className={styles.sessionDuration}>
                  {session.formattedDuration}
                </div>
                <div className={styles.sessionTime}>
                  {new Date(session.startTime).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <div className={styles.emptyState}>
          <Clock size={48} />
          <h3>¡Tu historial de estudio estará aquí!</h3>
          <p>
            Inicia el timer en la página principal y usa el botón <strong>"Finalizar Sesión"</strong> (✓) 
            cuando termines de estudiar para registrar tu tiempo.
          </p>
          <p className={styles.emptyStateHint}>
            💡 Cada sesión que completes se guardará automáticamente
          </p>
        </div>
      )}
    </div>
  );
});
