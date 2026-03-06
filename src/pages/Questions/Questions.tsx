import { useState } from 'react';
import { HelpCircle, Plus, Search, Circle, CheckCircle, FileText, Check, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { Question } from '../../types';
import styles from './Questions.module.css';

export function Questions() {
  const [questions, setQuestions] = useLocalStorage<Question[]>('questions', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ text: '' });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const filteredQuestions = questions.filter(question =>
    question.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddQuestion = () => {
    if (newQuestion.text.trim()) {
      const question: Question = {
        id: Date.now().toString(),
        text: newQuestion.text,
        category: 'General',
        isResolved: false,
        createdAt: new Date()
      };
      setQuestions(prev => [question, ...prev]);
      setNewQuestion({ text: '' });
      setShowAddForm(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddQuestion();
    }
  };

  const toggleResolved = (id: string) => {
    setQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, isResolved: !q.isResolved } : q)
    );
  };

  const addNote = (id: string, note: string) => {
    setQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, notes: note } : q)
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const startEditingNote = (id: string, currentNote: string = '') => {
    setEditingNoteId(id);
    setNoteText(currentNote);
  };

  const saveNote = (id: string) => {
    addNote(id, noteText);
    setEditingNoteId(null);
    setNoteText('');
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setNoteText('');
  };

  return (
    <div className={styles.questionsPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <HelpCircle className={styles.titleIcon} size={28} />
          Preguntas
        </h1>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={24} />
          <span style={{ display: window.innerWidth >= 768 ? 'inline' : 'none' }}>
            Agregar Pregunta
          </span>
        </button>
      </header>

      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Buscar preguntas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`input ${styles.searchInput}`}
        />
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Agregar Nueva Pregunta</h3>
          <input
            type="text"
            placeholder="¿Cuál es tu pregunta?"
            value={newQuestion.text}
            onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
            onKeyPress={handleKeyPress}
            className="input"
            style={{ marginBottom: 'var(--spacing-md)' }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button className="btn btn-primary" onClick={handleAddQuestion}>
              Agregar Pregunta
            </button>
            <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className={styles.questionsList}>
        {filteredQuestions.length === 0 ? (
          <div className={styles.emptyState}>
            <HelpCircle className={styles.emptyIcon} size={48} />
            <p>No se encontraron preguntas. ¡Agrega tu primera pregunta!</p>
          </div>
        ) : (
          filteredQuestions.map(question => (
            <div key={question.id} className={`${styles.questionCard} ${question.isResolved ? styles.resolved : ''}`}>
              <div className={styles.questionHeader}>
                <button 
                  className={styles.statusButton}
                  onClick={() => toggleResolved(question.id)}
                  title={question.isResolved ? 'Marcar como pendiente' : 'Marcar como resuelta'}
                >
                  {question.isResolved ? (
                    <CheckCircle className={`${styles.statusIcon} ${styles.resolved}`} size={20} />
                  ) : (
                    <Circle className={`${styles.statusIcon} ${styles.pending}`} size={20} />
                  )}
                </button>
                <div className={styles.questionContent}>
                  <div className={styles.questionText}>
                    {question.text}
                  </div>
                  <div className={styles.questionMeta}>
                    <span className={styles.categoryTag}>
                      {question.category}
                    </span>
                    <span className={styles.questionDate}>
                      {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button 
                  className={styles.deleteButton}
                  onClick={() => deleteQuestion(question.id)}
                  title="Eliminar pregunta"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              {question.notes && editingNoteId !== question.id && (
                <div className={styles.notes}>
                  <strong>Notas:</strong> {question.notes}
                </div>
              )}
              
              {editingNoteId === question.id && (
                <div className={styles.noteEditor}>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Escribe tu nota aquí..."
                    className={styles.noteTextarea}
                    rows={3}
                    autoFocus
                  />
                  <div className={styles.noteActions}>
                    <button
                      className={`${styles.actionButton} ${styles.save}`}
                      onClick={() => saveNote(question.id)}
                    >
                      Guardar
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={cancelEditingNote}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
              
              {editingNoteId !== question.id && (
                <div className={styles.questionActions}>
                  <button
                    className={`${styles.actionButton} ${question.isResolved ? '' : styles.resolve}`}
                    onClick={() => toggleResolved(question.id)}
                  >
                    <Check size={16} />
                    {question.isResolved ? 'Marcar Pendiente' : 'Marcar Resuelta'}
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => startEditingNote(question.id, question.notes || '')}
                  >
                    <FileText size={16} />
                    {question.notes ? 'Editar Nota' : 'Agregar Nota'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
