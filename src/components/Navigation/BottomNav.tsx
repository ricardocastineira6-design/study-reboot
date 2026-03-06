import { Home, HelpCircle, FileText, Calendar, Heart, BarChart3, CheckSquare } from 'lucide-react';
import type { Page } from '../../types';
import styles from './BottomNav.module.css';

interface BottomNavProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export function BottomNav({ currentPage, onPageChange }: BottomNavProps) {
  const navItems = [
    { id: 'home' as Page, label: 'Inicio', icon: Home },
    { id: 'questions' as Page, label: 'Preguntas', icon: HelpCircle },
    { id: 'notes' as Page, label: 'Notas', icon: FileText },
  { id: 'todolist' as Page, label: 'Tareas', icon: CheckSquare },
    { id: 'calendar' as Page, label: 'Calendario', icon: Calendar },
    { id: 'stats' as Page, label: 'Estadísticas', icon: BarChart3 },
  { id: 'mood' as Page, label: 'Estado de Ánimo', icon: Heart }
  ];

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navContainer}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${currentPage === item.id ? styles.active : ''}`}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className={styles.navIcon} size={24} />
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
