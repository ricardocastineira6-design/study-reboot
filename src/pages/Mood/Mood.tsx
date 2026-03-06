import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { MoodEntry } from '../../types';
import styles from './Mood.module.css';

export function Mood() {
  const [moodEntries, setMoodEntries] = useLocalStorage<MoodEntry[]>('moodEntries', []);
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood'] | null>(null);
  const [note, setNote] = useState('');
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const moodOptions = [
    { value: 'excellent' as const, emoji: '😄', label: 'Excelente' },
    { value: 'good' as const, emoji: '😊', label: 'Bien' },
    { value: 'okay' as const, emoji: '😐', label: 'Regular' },
    { value: 'stressed' as const, emoji: '😰', label: 'Estresado' },
    { value: 'sad' as const, emoji: '😢', label: 'Triste' }
  ];

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = moodEntries.find(entry => entry.date === today);

  // Human-friendly helper messages per mood
  const moodMessages: Record<string, string> = {
    excellent: "¡Qué bien! Aprovecha esa energía para tus metas de hoy.",
    good: "Genial — sigue así, pequeños pasos cuentan.",
    okay: "Está bien tener días así. Date permiso para descansar si lo necesitas.",
    stressed: "Lo siento que te sientas así — respirar hondo o una pausa corta puede ayudar.",
    sad: "Siento que hoy sea difícil. Si puedes, habla con alguien de confianza o escribe lo que sientes."
  };

  const handleSaveMood = () => {
    if (!selectedMood) return;

    const entry: MoodEntry = {
      id: todayEntry ? todayEntry.id : Date.now().toString(),
      date: today,
      mood: selectedMood,
      note: note.trim() || undefined
    };

    if (todayEntry) {
      setMoodEntries(prev => prev.map(e => e.id === todayEntry.id ? entry : e));
    } else {
      setMoodEntries(prev => [entry, ...prev]);
    }

    setSelectedMood(null);
    setNote('');
    setIsEditing(false);

    // Show a brief confirmation
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Get entries for selected period
  const getPeriodEntries = () => {
    const now = new Date();
    const daysAgo = period === 'week' ? 7 : 30;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    return moodEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate;
    });
  };

  const periodEntries = getPeriodEntries();

  // Calculate stats
  const averageMoodScore = periodEntries.length > 0 
    ? periodEntries.reduce((sum, entry) => {
        const scores = { excellent: 5, good: 4, okay: 3, stressed: 2, sad: 1 };
        return sum + scores[entry.mood];
      }, 0) / periodEntries.length
    : 0;

  const mostCommonMood = periodEntries.length > 0 
    ? Object.entries(
        periodEntries.reduce((acc, entry) => {
          acc[entry.mood] = (acc[entry.mood] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
    : 'N/A';

  return (
    <div className={styles.moodPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <Heart className={styles.titleIcon} size={28} />
          Estado de Ánimo
        </h1>
      </header>

      {(!todayEntry || isEditing) && (
        <div className={styles.currentMoodSection}>
          <h2 className={styles.sectionTitle}>¿Cómo te sientes hoy?</h2>
          
          <div className={styles.moodOptions} role="list">
            {moodOptions.map(option => (
              <button
                key={option.value}
                aria-pressed={selectedMood === option.value}
                className={`${styles.moodOption} ${selectedMood === option.value ? styles.selected : ''}`}
                onClick={() => setSelectedMood(option.value)}
                type="button"
              >
                <div className={styles.moodEmoji} aria-hidden>{option.emoji}</div>
                <div className={styles.moodLabel}>{option.label}</div>
              </button>
            ))}
          </div>

          <div style={{ minHeight: 36, marginBottom: 8 }}>
            {selectedMood ? (
              <div style={{ color: 'var(--text-medium)' }}>{moodMessages[selectedMood]}</div>
            ) : (
              <div style={{ color: 'var(--text-medium)' }}>Selecciona un emoji que represente tu día. No hay respuestas correctas.</div>
            )}
          </div>

          <textarea
            placeholder="Escribe en pocas palabras cómo te ha ido hoy — por ejemplo: 'mucho trabajo, me siento cansado' (opcional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`input textarea ${styles.noteInput}`}
            rows={3}
          />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button 
              className={`btn btn-primary ${styles.saveButton}`}
              onClick={handleSaveMood}
              disabled={!selectedMood}
              type="button"
            >
              Guardar
            </button>
            {isEditing && (
              <button className="btn btn-outline" onClick={() => { setIsEditing(false); setSelectedMood(null); setNote(''); }} type="button">Cancelar</button>
            )}
          </div>

          {saved && (
            <div style={{ marginTop: 12, color: 'var(--primary-green)', fontWeight: 600 }}>Estado guardado. Gracias por registrar cómo te sientes.</div>
          )}
        </div>
      )}

      {todayEntry && !isEditing && (
        <div className={styles.currentMoodSection}>
          <h2 className={styles.sectionTitle}>Estado de Ánimo de Hoy</h2>
          <div className={styles.moodEntry}>
            <div className={styles.entryMood}>
              {moodOptions.find(m => m.value === todayEntry.mood)?.emoji}
            </div>
            <div className={styles.entryContent}>
              <div className={styles.entryDate}>Hoy</div>
              {todayEntry.note && (
                <div className={styles.entryNote}>{todayEntry.note}</div>
              )}
            </div>
            <div style={{ marginLeft: 12 }}>
              <button className="btn btn-outline" onClick={() => {
                // switch to edit mode
                setIsEditing(true);
                setSelectedMood(todayEntry.mood);
                setNote(todayEntry.note || '');
              }} type="button">Editar</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.historySection}>
        <div className={styles.historyCard}>
          <div className={styles.periodSelector}>
            <button
              className={`${styles.periodButton} ${period === 'week' ? styles.active : ''}`}
              onClick={() => setPeriod('week')}
            >
              Última Semana
            </button>
            <button
              className={`${styles.periodButton} ${period === 'month' ? styles.active : ''}`}
              onClick={() => setPeriod('month')}
            >
              Último Mes
            </button>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {averageMoodScore.toFixed(1)}
              </div>
              <div className={styles.statLabel}>Puntuación Promedio</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {moodOptions.find(m => m.value === mostCommonMood)?.emoji || '—'}
              </div>
              <div className={styles.statLabel}>Estado Más Común</div>
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Historial de Estado de Ánimo</h3>
          <div className={styles.moodHistory}>
            {periodEntries.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No hay entradas de estado de ánimo para este período.</p>
              </div>
            ) : (
              periodEntries.map(entry => (
                <div key={entry.id} className={styles.moodEntry}>
                  <div className={styles.entryMood}>
                    {moodOptions.find(m => m.value === entry.mood)?.emoji}
                  </div>
                  <div className={styles.entryContent}>
                    <div className={styles.entryDate}>
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                    {entry.note && (
                      <div className={styles.entryNote}>{entry.note}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
