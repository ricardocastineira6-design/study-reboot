import { Brain, BookOpen, Calendar, Heart, CheckSquare, BarChart3, HelpCircle } from 'lucide-react';
import type { Page } from '../../types';
import styles from './TopNav.module.css';

interface TopNavProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export function TopNav({ currentPage, onPageChange }: TopNavProps) {
  const navItems = [
    { id: 'home' as Page, label: 'Inicio', icon: Brain },
    { id: 'questions' as Page, label: 'Preguntas', icon: HelpCircle },
    { id: 'notes' as Page, label: 'Notas', icon: BookOpen },
  { id: 'todolist' as Page, label: 'Tareas', icon: CheckSquare },
    { id: 'calendar' as Page, label: 'Calendario', icon: Calendar },
    { id: 'stats' as Page, label: 'Estadísticas', icon: BarChart3 },
  { id: 'mood' as Page, label: 'Estado de Ánimo', icon: Heart }
  ];

  return (
    <nav className={styles.topNav}>
      <div className={styles.container}>
        <button 
          className={styles.logo}
          onClick={() => onPageChange('home')}
        >
          <Brain className={styles.logoIcon} size={28} />
          MiEstudio
        </button>
        
        <div className={styles.navItems}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${currentPage === item.id ? styles.active : ''}`}
                onClick={() => onPageChange(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
