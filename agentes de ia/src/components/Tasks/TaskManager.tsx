import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  User, 
  ChevronRight, 
  ChevronLeft,
  Trash2
} from 'lucide-react';
import type { Task, TaskStatus, Department, PriorityLevel, Subtask } from '../../types';

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (newTask: Omit<Task, 'id'>) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  onToggleSubtask
}) => {
  const [filterDepartment, setFilterDepartment] = useState<'todos' | Department>('todos');
  const [filterPriority, setFilterPriority] = useState<'todos' | PriorityLevel>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<Department>('Tech');
  const [priority, setPriority] = useState<PriorityLevel>('alta');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [subtasksList, setSubtasksList] = useState<string[]>(['']);

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'por_hacer', label: 'Por Hacer', color: '#8b5cf6' },
    { status: 'en_progreso', label: 'En Progreso', color: '#6366f1' },
    { status: 'revision', label: 'En Revisión', color: '#f59e0b' },
    { status: 'completado', label: 'Completado', color: '#10b981' }
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesDept = filterDepartment === 'todos' || task.department === filterDepartment;
    const matchesPriority = filterPriority === 'todos' || task.priority === filterPriority;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesPriority && matchesSearch;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assignedTo) return;

    const formattedSubtasks: Subtask[] = subtasksList
      .filter((s: string) => s.trim().length > 0)
      .map((s: string, idx: number) => ({ id: `st-${Date.now()}-${idx}`, text: s.trim(), completed: false }));

    onAddTask({
      title,
      department,
      priority,
      status: 'por_hacer',
      assignedTo,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      subtasks: formattedSubtasks,
      description
    });

    setTitle('');
    setAssignedTo('');
    setDescription('');
    setSubtasksList(['']);
    setShowAddModal(false);
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'por_hacer') return 'en_progreso';
    if (current === 'en_progreso') return 'revision';
    if (current === 'revision') return 'completado';
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'completado') return 'revision';
    if (current === 'revision') return 'en_progreso';
    if (current === 'en_progreso') return 'por_hacer';
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>Tareas Corporativas (Tablero Kanban)</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Organización interna de Zyra Digital por departamento y nivel de prioridad
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Nueva Tarea Corporativa
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar por título de tarea o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.4rem', height: '38px', fontSize: '0.83rem' }}
          />
        </div>

        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value as any)}
          className="form-select"
          style={{ width: '170px', height: '38px', fontSize: '0.83rem' }}
        >
          <option value="todos">Departamento: Todos</option>
          <option value="Tech">💻 Tech / Eng</option>
          <option value="Design">🎨 Design / UX</option>
          <option value="Marketing">📈 Marketing / Sales</option>
          <option value="Admin">💼 Admin / Legal</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as any)}
          className="form-select"
          style={{ width: '160px', height: '38px', fontSize: '0.83rem' }}
        >
          <option value="todos">Prioridad: Todas</option>
          <option value="alta">🔥 Alta</option>
          <option value="media">⚡ Media</option>
          <option value="baja">🌱 Baja</option>
        </select>
      </div>

      {/* Kanban Board Grid (4 Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', alignItems: 'flex-start' }}>
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.status);

          return (
            <div key={col.status} className="glass-panel" style={{ padding: '1.2rem', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
              
              {/* Column Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                paddingBottom: '0.65rem',
                borderBottom: `2px solid ${col.color}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>{col.label}</span>
                </div>
                <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff' }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Column Task Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                {colTasks.map(task => {
                  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
                  const prev = getPrevStatus(task.status);
                  const next = getNextStatus(task.status);

                  return (
                    <div 
                      key={task.id} 
                      className="glass-panel glass-panel-hover"
                      style={{
                        padding: '1rem',
                        background: 'rgba(20, 28, 46, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.09)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span className="badge badge-purple" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                          {task.department}
                        </span>
                        <span className={`badge ${task.priority === 'alta' ? 'badge-rose' : 'badge-amber'}`} style={{ fontSize: '0.68rem' }}>
                          {task.priority}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', lineHeight: '1.35', marginBottom: '0.4rem' }}>
                        {task.title}
                      </h4>

                      {task.description && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks Checklist */}
                      {task.subtasks.length > 0 && (
                        <div style={{
                          margin: '0.65rem 0',
                          padding: '0.6rem',
                          background: 'rgba(0, 0, 0, 0.2)',
                          borderRadius: '8px'
                        }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.3rem', fontWeight: 600 }}>
                            SUBTAREAS ({completedSubtasks}/{task.subtasks.length})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {task.subtasks.map(st => (
                              <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                                <input
                                  type="checkbox"
                                  checked={st.completed}
                                  onChange={() => onToggleSubtask(task.id, st.id)}
                                  style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                                />
                                <span style={{
                                  color: st.completed ? 'var(--text-dim)' : 'var(--text-muted)',
                                  textDecoration: st.completed ? 'line-through' : 'none'
                                }}>
                                  {st.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Card Footer */}
                      <div style={{
                        marginTop: '0.75rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <User size={12} color="#818cf8" /> {task.assignedTo}
                        </div>

                        {/* Status Move Controls */}
                        <div style={{ display: 'flex', gap: '0.2rem' }}>
                          {prev && (
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, prev)}
                              className="btn-icon"
                              style={{ width: '24px', height: '24px' }}
                              title={`Mover a ${prev}`}
                            >
                              <ChevronLeft size={14} />
                            </button>
                          )}
                          {next && (
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, next)}
                              className="btn-icon"
                              style={{ width: '24px', height: '24px', background: 'var(--primary-light)', color: '#818cf8' }}
                              title={`Mover a ${next}`}
                            >
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>
              Crear Nueva Tarea Corporativa
            </h3>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Título de la Tarea</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Revisión del contrato PCI-DSS con auditor"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  style={{ marginTop: '0.3rem' }}
                />
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Departamento</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value as any)} className="form-select" style={{ marginTop: '0.3rem' }}>
                    <option value="Tech">Tech / Ingeniería</option>
                    <option value="Design">Diseño / UX</option>
                    <option value="Marketing">Marketing / Ventas</option>
                    <option value="Admin">Administración / Finanzas</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Prioridad</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="form-select" style={{ marginTop: '0.3rem' }}>
                    <option value="alta">🔥 Alta Prioridad</option>
                    <option value="media">⚡ Media Prioridad</option>
                    <option value="baja">🌱 Baja Prioridad</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Responsable Asignado</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Mateo Silva"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="form-input"
                    style={{ marginTop: '0.3rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fecha Límite</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="form-input"
                    style={{ marginTop: '0.3rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Subtareas (Checklist)</label>
                {subtasksList.map((st: string, idx: number) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                    <input
                      type="text"
                      placeholder={`Subtarea ${idx + 1}...`}
                      value={st}
                      onChange={(e) => {
                        const updated = [...subtasksList];
                        updated[idx] = e.target.value;
                        setSubtasksList(updated);
                      }}
                      className="form-input"
                    />
                    {subtasksList.length > 1 && (
                      <button 
                        type="button" 
                        className="btn-icon" 
                        onClick={() => setSubtasksList(subtasksList.filter((_: string, i: number) => i !== idx))}
                      >
                        <Trash2 size={14} color="#f43f5e" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSubtasksList([...subtasksList, ''])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#818cf8',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '0.4rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Plus size={14} /> Añadir Otra Subtarea
                </button>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Descripción Corta</label>
                <textarea
                  placeholder="Detalles sobre el objetivo de la tarea..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  style={{ marginTop: '0.3rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Tarea</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
