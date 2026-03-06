import './styles/globals.css';
import { useState } from 'react';
import { Home } from './pages/Home/Home';
import { Notes } from './pages/Notes/Notes';
import { Mood } from './pages/Mood/Mood';
import { Questions } from './pages/Questions/Questions';
import { Calendar } from './pages/Calendar/Calendar';
import { Stats } from './pages/Stats/Stats';
import { TodoList } from './pages/TodoList/TodoList';
import { TopNav } from './components/Navigation/TopNav';
import { BottomNav } from './components/Navigation/BottomNav';
import type { Page } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return (
    <div>
      <TopNav currentPage={currentPage} onPageChange={setCurrentPage} />

      <main>
  {currentPage === 'home' && <Home onPageChange={setCurrentPage} />}
  {currentPage === 'notes' && <Notes />}
  {currentPage === 'mood' && <Mood />}
  {currentPage === 'questions' && <Questions />}
  {currentPage === 'calendar' && <Calendar />}
  {currentPage === 'stats' && <Stats />}
  {currentPage === 'todolist' && <TodoList />}
      </main>

      <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
}

export default App;
