import { useState } from 'react';
import { CheckSquare, Plus, ChevronLeft, ChevronRight, Calendar, Clock, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { TodoItem } from '../../types';
import styles from './TodoList.module.css';

export function TodoList() {
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('todoItems', []);
  const [viewType, setViewType] = useState<'weekly' | 'monthly'>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newTodo, setNewTodo] = useState({
    text: '',
    priority: 'medium' as TodoItem['priority'],
    category: 'personal' as TodoItem['category']
  });

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getWeekEnd = (date: Date) => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  };

  const formatWeekRange = (date: Date) => {
    const start = getWeekStart(date);
    const end = getWeekEnd(date);
    return `${start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const getFilteredTodos = () => {
    if (viewType === 'weekly') {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = getWeekEnd(currentDate);
      
      return todos.filter(todo => {
        const todoDate = new Date(todo.createdAt);
        return todoDate >= weekStart && todoDate <= weekEnd;
      });
    } else {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      
      return todos.filter(todo => {
        const todoDate = new Date(todo.createdAt);
        return todoDate.getMonth() === month && todoDate.getFullYear() === year;
      });
    }
  };

  const handleAddTodo = () => {
    if (newTodo.text.trim()) {
      const todo: TodoItem = {
        id: Date.now().toString(),
        text: newTodo.text.trim(),
        isCompleted: false,
        priority: newTodo.priority,
        category: newTodo.category,
        createdAt: new Date()
      };

      setTodos(prev => [...prev, todo]);
      setNewTodo({ text: '', priority: 'medium', category: 'personal' });
    }
  };

  const handleToggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? {
              ...todo,
              isCompleted: !todo.isCompleted,
              completedAt: !todo.isCompleted ? new Date() : undefined
            }
          : todo
      )
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewType === 'weekly') {
        newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      } else {
        newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      }
      return newDate;
    });
  };

  const filteredTodos = getFilteredTodos();
  const completedTodos = filteredTodos.filter(todo => todo.isCompleted);
  const pendingTodos = filteredTodos.filter(todo => !todo.isCompleted);

  const getPriorityText = (priority: TodoItem['priority']) => {
    const priorityMap = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    return priorityMap[priority];
  };

  const getCategoryText = (category: TodoItem['category']) => {
    const categoryMap = {
      personal: 'Personal',
      work: 'Trabajo',
      study: 'Estudio',
      health: 'Salud',
      other: 'Otro'
    };
    return categoryMap[category];
  };

  return (
    <div className={styles.todoPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <CheckSquare className={styles.titleIcon} size={28} />
          Todo List
        </h1>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleButton} ${viewType === 'weekly' ? styles.active : ''}`}
            onClick={() => setViewType('weekly')}
          >
            <Calendar size={16} />
            Semanal
          </button>
          <button
            className={`${styles.toggleButton} ${viewType === 'monthly' ? styles.active : ''}`}
            onClick={() => setViewType('monthly')}
          >
            <Clock size={16} />
            Mensual
          </button>
        </div>
      </header>

      <div className={styles.periodSelector}>
        <button
          className={styles.periodButton}
          onClick={() => navigatePeriod('prev')}
        >
          <ChevronLeft size={20} />
        </button>
        <div className={styles.periodText}>
          {viewType === 'weekly' ? formatWeekRange(currentDate) : formatMonth(currentDate)}
        </div>
        <button
          className={styles.periodButton}
          onClick={() => navigatePeriod('next')}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{filteredTodos.length}</div>
          <div className={styles.statLabel}>Total</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{pendingTodos.length}</div>
          <div className={styles.statLabel}>Pendientes</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{completedTodos.length}</div>
          <div className={styles.statLabel}>Completadas</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {filteredTodos.length > 0 ? Math.round((completedTodos.length / filteredTodos.length) * 100) : 0}%
          </div>
          <div className={styles.statLabel}>Progreso</div>
        </div>
      </div>

      <div className={styles.todoContainer}>
        <div className={styles.addTodoForm}>
          <div className={styles.formGroup}>
            <input
              type="text"
              className={styles.todoInput}
              placeholder="Agregar nueva tarea..."
              value={newTodo.text}
              onChange={(e) => setNewTodo(prev => ({ ...prev, text: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
            />
            <button
              className={styles.addButton}
              onClick={handleAddTodo}
            >
              <Plus size={16} />
              Agregar
            </button>
          </div>
          <div className={styles.formRow}>
            <div className={styles.selectGroup}>
              <label className={styles.selectLabel}>Prioridad</label>
              <select
                className={styles.select}
                value={newTodo.priority}
                onChange={(e) => setNewTodo(prev => ({ ...prev, priority: e.target.value as TodoItem['priority'] }))}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div className={styles.selectGroup}>
              <label className={styles.selectLabel}>Categoría</label>
              <select
                className={styles.select}
                value={newTodo.category}
                onChange={(e) => setNewTodo(prev => ({ ...prev, category: e.target.value as TodoItem['category'] }))}
              >
                <option value="personal">Personal</option>
                <option value="work">Trabajo</option>
                <option value="study">Estudio</option>
                <option value="health">Salud</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.todoList}>
          {filteredTodos.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📝</div>
              <div className={styles.emptyText}>No hay tareas para este {viewType === 'weekly' ? 'semana' : 'mes'}</div>
              <div className={styles.emptySubtext}>Agrega una nueva tarea para comenzar</div>
            </div>
          ) : (
            <>
              {pendingTodos.map(todo => (
                <div key={todo.id} className={styles.todoItem}>
                  <div
                    className={`${styles.checkbox} ${todo.isCompleted ? styles.checked : ''}`}
                    onClick={() => handleToggleTodo(todo.id)}
                  />
                  <div className={styles.todoText}>{todo.text}</div>
                  <div className={`${styles.priorityBadge} ${styles[todo.priority]}`}>
                    {getPriorityText(todo.priority)}
                  </div>
                  <div className={styles.categoryBadge}>
                    {getCategoryText(todo.category)}
                  </div>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              {completedTodos.length > 0 && (
                <>
                  <div style={{ 
                    margin: 'var(--spacing-lg) 0 var(--spacing-md)',
                    padding: 'var(--spacing-sm) 0',
                    borderTop: '1px solid var(--border-light)',
                    fontSize: 'var(--font-size-small)',
                    color: 'var(--text-medium)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}>
                    Completadas ({completedTodos.length})
                  </div>
                  {completedTodos.map(todo => (
                    <div key={todo.id} className={`${styles.todoItem} ${styles.completed}`}>
                      <div
                        className={`${styles.checkbox} ${styles.checked}`}
                        onClick={() => handleToggleTodo(todo.id)}
                      />
                      <div className={styles.todoText}>{todo.text}</div>
                      <div className={`${styles.priorityBadge} ${styles[todo.priority]}`}>
                        {getPriorityText(todo.priority)}
                      </div>
                      <div className={styles.categoryBadge}>
                        {getCategoryText(todo.category)}
                      </div>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
