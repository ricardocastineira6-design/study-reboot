import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, BookOpen, FileText, Clock, Copy, ArrowRight, Trash2, Settings } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useCalendarNotifications } from '../../hooks/useCalendarNotifications';
import { NotificationSettings } from '../../components/NotificationSettings/NotificationSettings';
import { NotificationWelcome } from '../../components/NotificationWelcome/NotificationWelcome';
import type { CalendarEvent } from '../../types';
import styles from './Calendar.module.css';

export function Calendar() {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('calendarEvents', []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMoveForm, setShowMoveForm] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [eventToMove, setEventToMove] = useState<CalendarEvent | null>(null);
  
  // Hook para notificaciones de calendario
  const { scheduleEventNotification } = useCalendarNotifications();
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    type: 'other' as CalendarEvent['type'],
    category: 'personal' as CalendarEvent['category'],
    description: ''
  });

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  // Generate calendar days
  const calendarDays = [];
  const currentCalendarDate = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(currentCalendarDate));
    currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
  }

  const getEventIcon = (event: CalendarEvent) => {
    // Si es categoría estudio, mostrar ícono de estudio
    if (event.category === 'estudio') {
      switch (event.type) {
        case 'exam': return BookOpen;
        case 'assignment': return FileText;
        case 'study': return Clock;
        default: return BookOpen; // Ícono por defecto para estudios
      }
    } else {
      // Para eventos personales, usar ícono de calendario
      return CalendarIcon;
    }
  };

  const handleAddEvent = () => {
    if (newEvent.title.trim() && newEvent.date) {
      // Determinar el tipo automáticamente basado en la categoría
      const eventType: CalendarEvent['type'] = newEvent.category === 'estudio' ? 'study' : 'other';
      
      const event: CalendarEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time || undefined,
        type: eventType,
        category: newEvent.category,
        description: newEvent.description || undefined
      };
      setEvents(prev => [...prev, event]);
      
      // Programar notificación para el nuevo evento
      scheduleEventNotification(event);
      
      setNewEvent({ 
        title: '', 
        date: '', 
        time: '', 
        type: 'other', 
        category: 'personal',
        description: '' 
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const handleDuplicateEvent = (event: CalendarEvent) => {
    const duplicatedEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
      title: `${event.title} (Copia)`
    };
    setEvents(prev => [...prev, duplicatedEvent]);
  };

  const handleMoveEvent = (event: CalendarEvent) => {
    setEventToMove(event);
    setShowMoveForm(true);
  };

  const handleConfirmMove = (newDate: string, newCategory: CalendarEvent['category']) => {
    if (eventToMove && newDate) {
      setEvents(prev => 
        prev.map(event => 
          event.id === eventToMove.id 
            ? { ...event, date: newDate, category: newCategory }
            : event
        )
      );
      setShowMoveForm(false);
      setEventToMove(null);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const upcomingEvents = events
    .filter(event => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);

  // Migración para eventos existentes sin categoría
  useEffect(() => {
    const needsMigration = events.some(event => !event.category);
    if (needsMigration) {
      const migratedEvents = events.map(event => ({
        ...event,
        category: event.category || 'estudio' as CalendarEvent['category']
      }));
      setEvents(migratedEvents);
    }
  }, [events, setEvents]);

  return (
    <div className={styles.calendarPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <CalendarIcon className={styles.titleIcon} size={28} />
          Calendario
        </h1>
        <div className={styles.headerButtons}>
          <button 
            className={styles.settingsButton}
            onClick={() => setShowNotificationSettings(!showNotificationSettings)}
            title="Configurar notificaciones"
          >
            <Settings size={20} />
          </button>
          <button 
            className={styles.addButton}
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={20} />
            Agregar Evento
          </button>
        </div>
      </header>

      <NotificationWelcome />

      {showNotificationSettings && (
        <NotificationSettings />
      )}

      {showAddForm && (
        <div className={`${styles.addEventForm} ${styles[newEvent.category]}`}>
          <h3 className={styles.formTitle}>
            Agregar Nuevo Evento
          </h3>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Título del evento</label>
            <input
              type="text"
              placeholder="Título del evento"
              value={newEvent.title}
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              className="input"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Fecha</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                className="input"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Hora (opcional)</label>
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Categoría</label>
            <select
              value={newEvent.category}
              onChange={(e) => setNewEvent(prev => ({ ...prev, category: e.target.value as CalendarEvent['category'] }))}
              className="input"
            >
              <option value="estudio">📚 Estudios</option>
              <option value="personal">👤 Personal</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Descripción (opcional)</label>
            <textarea
              placeholder="Descripción del evento..."
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              className="input textarea"
              rows={3}
            />
          </div>

          <div className={styles.formActions}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowAddForm(false)}
            >
              Cancelar
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleAddEvent}
            >
              Agregar Evento
            </button>
          </div>
        </div>
      )}

      <div className={styles.calendarContainer}>
        <div className={styles.calendarHeader}>
          <button className={styles.navButton} onClick={() => navigateMonth('prev')}>
            <ChevronLeft size={20} />
          </button>
          <h2 className={styles.monthYear}>
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button className={styles.navButton} onClick={() => navigateMonth('next')}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className={styles.calendarGrid}>
          {dayNames.map(day => (
            <div key={day} className={styles.dayHeader}>
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => {
            const dateString = day.toISOString().split('T')[0];
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isToday = dateString === today;
            const isSelected = dateString === selectedDate;
            const dayEvents = getEventsForDate(dateString);

            return (
              <div
                key={index}
                className={`${styles.dayCell} ${
                  !isCurrentMonth ? styles.otherMonth : ''
                } ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
                onClick={() => setSelectedDate(dateString)}
              >
                <div className={styles.dayNumber}>{day.getDate()}</div>
                {dayEvents.length > 0 && (
                  <div className={styles.dayEvents}>
                    {dayEvents.slice(0, 3).map((event) => {
                      const Icon = getEventIcon(event);
                      return (
                        <div
                          key={event.id}
                          className={`${styles.dayEventCard} ${styles[event.category]}`}
                          onClick={(e) => e.stopPropagation()}
                          title={`${event.title}${event.time ? ` a las ${event.time}` : ''}${event.description ? `\n${event.description}` : ''}`}
                        >
                          <div className={styles.dayEventContent}>
                            <Icon size={10} className={styles.dayEventIcon} />
                            <span className={styles.dayEventTitle}>
                              {event.title.length > 15 ? event.title.slice(0, 15) + '...' : event.title}
                            </span>
                            {event.time && (
                              <span className={styles.dayEventTime}>
                                {event.time.slice(0, 5)}
                              </span>
                            )}
                          </div>
                          <div className={styles.dayEventActions}>
                            <button
                              className={styles.dayEventAction}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveEvent(event);
                              }}
                              title="Mover"
                            >
                              <ArrowRight size={8} />
                            </button>
                            <button
                              className={styles.dayEventAction}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateEvent(event);
                              }}
                              title="Duplicar"
                            >
                              <Copy size={8} />
                            </button>
                            <button
                              className={styles.dayEventAction}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(event.id);
                              }}
                              title="Eliminar"
                            >
                              <Trash2 size={8} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className={styles.moreEventsIndicator}>
                        +{dayEvents.length - 3} más
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.eventsList}>
        <h3 className={styles.eventsTitle}>
          <CalendarIcon size={20} />
          Próximos Eventos
        </h3>
        {upcomingEvents.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay eventos próximos. ¡Agrega tu primer evento!</p>
          </div>
        ) : (
          upcomingEvents.map(event => {
            const Icon = getEventIcon(event);
            return (
              <div key={event.id} className={`${styles.eventCard} ${styles[event.category]}`}>
                <div className={styles.eventContent}>
                  <div className={`${styles.eventTypeIcon} ${styles[event.type]}`}>
                    <Icon size={20} />
                  </div>
                  <div className={styles.eventInfo}>
                    <div className={styles.eventHeader}>
                      <div className={styles.eventTitle}>{event.title}</div>
                      <span className={`${styles.categoryTag} ${styles[event.category]}`}>
                        {event.category === 'estudio' ? '📚' : '👤'}
                      </span>
                    </div>
                    <div className={styles.eventDate}>
                      {new Date(event.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} 
                      {event.time && ` a las ${event.time}`}
                    </div>
                    {event.description && (
                      <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--text-medium)', marginTop: 'var(--spacing-xs)' }}>
                        {event.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.eventActions}>
                  <button
                    className={styles.eventActionButton}
                    onClick={() => handleMoveEvent(event)}
                    title="Mover evento"
                  >
                    <ArrowRight size={16} />
                  </button>
                  <button
                    className={styles.eventActionButton}
                    onClick={() => handleDuplicateEvent(event)}
                    title="Duplicar evento"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    className={styles.eventActionButton}
                    onClick={() => handleDeleteEvent(event.id)}
                    title="Eliminar evento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showMoveForm && eventToMove && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Mover Evento: {eventToMove.title}</h3>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Nueva fecha</label>
              <input
                type="date"
                defaultValue={eventToMove.date}
                id="moveDate"
                className="input"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nueva categoría</label>
              <select
                defaultValue={eventToMove.category}
                id="moveCategory"
                className="input"
              >
                <option value="estudio">📚 Estudios</option>
                <option value="personal">👤 Personal</option>
              </select>
            </div>

            <div className={styles.modalActions}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowMoveForm(false);
                  setEventToMove(null);
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  const dateInput = document.getElementById('moveDate') as HTMLInputElement;
                  const categoryInput = document.getElementById('moveCategory') as HTMLSelectElement;
                  handleConfirmMove(dateInput.value, categoryInput.value as CalendarEvent['category']);
                }}
              >
                Mover Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
