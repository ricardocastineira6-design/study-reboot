import { useState, useEffect } from 'react';
import { FileText, Plus, Search, X, Check, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { Note } from '../../types';
import styles from './Notes.module.css';

export function Notes() {
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  // Migración para notas existentes que no tienen isCompleted
  useEffect(() => {
    const needsMigration = notes.some(note => note.isCompleted === undefined);
    if (needsMigration) {
      const migratedNotes = notes.map(note => ({
        ...note,
        isCompleted: note.isCompleted ?? false
      }));
      setNotes(migratedNotes);
    }
  }, [notes, setNotes]);

  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filter === 'pending') return matchesSearch && !note.isCompleted;
      if (filter === 'completed') return matchesSearch && note.isCompleted;
      return matchesSearch;
    })
    .sort((a, b) => {
      // Ordenar por completado (pendientes primero) y luego por fecha
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleSave = () => {
    if (formData.title.trim() && formData.content.trim()) {
      if (editingNote) {
        // Update existing note
        setNotes(prev =>
          prev.map(note =>
            note.id === editingNote.id
              ? { ...note, ...formData, updatedAt: new Date() }
              : note
          )
        );
      } else {
        // Create new note
        const newNote: Note = {
          id: Date.now().toString(),
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: 'General',
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setNotes(prev => [newNote, ...prev]);
      }
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setFormData({ title: '', content: '' });
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content
    });
    setShowModal(true);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, isCompleted: !note.isCompleted, updatedAt: new Date() }
          : note
      )
    );
  };

  return (
    <div className={styles.notesPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <FileText className={styles.titleIcon} size={28} />
          Notas
        </h1>
        <button 
          className={styles.addButton}
          onClick={() => setShowModal(true)}
        >
          <Plus size={24} />
          <span className={styles.addButtonText}>
            Agregar Nota
          </span>
        </button>
      </header>

      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Buscar notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterContainer}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas ({notes.length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pendientes ({notes.filter(note => !note.isCompleted).length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completadas ({notes.filter(note => note.isCompleted).length})
          </button>
        </div>
      </div>

      <div className={styles.notesList}>
        {filteredNotes.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText className={styles.emptyIcon} size={48} />
            {notes.length === 0 ? (
              <p>No se encontraron notas. ¡Crea tu primera nota!</p>
            ) : (
              <p>
                No hay notas {filter === 'pending' ? 'pendientes' : filter === 'completed' ? 'completadas' : ''} 
                {searchTerm && ` que coincidan con "${searchTerm}"`}.
              </p>
            )}
          </div>
        ) : (
          filteredNotes.map(note => (
            <div 
              key={note.id} 
              className={`${styles.noteCard} ${note.isCompleted ? styles.noteCompleted : ''}`}
            >
              <div className={styles.noteHeader}>
                <button
                  className={`${styles.actionButton} ${styles.completeButton} ${note.isCompleted ? styles.completed : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleComplete(note.id);
                  }}
                  title={note.isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
                >
                  <Check size={16} />
                </button>
                
                <h3 
                  className={styles.noteTitle}
                  onClick={() => handleEditNote(note)}
                >
                  {note.title}
                </h3>
                
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  title="Eliminar nota"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div 
                className={styles.noteContent}
                onClick={() => handleEditNote(note)}
              >
                {note.content}
              </div>
              <div className={styles.noteMeta}>
                <span className={styles.noteDate}>
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingNote ? 'Editar Nota' : 'Crear Nueva Nota'}
              </h2>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input"
                placeholder="Ingresa el título de la nota..."
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Contenido</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="input textarea"
                placeholder="Escribe el contenido de tu nota aquí..."
                rows={8}
              />
            </div>

            <div className={styles.modalActions}>
              {editingNote && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    handleDeleteNote(editingNote.id);
                    handleCloseModal();
                  }}
                >
                  Eliminar
                </button>
              )}
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editingNote ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
