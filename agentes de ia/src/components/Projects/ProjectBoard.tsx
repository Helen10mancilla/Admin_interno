import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar,
  Pencil,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import type { Project, ProjectStatus, PriorityLevel, Client } from '../../types';

interface ProjectBoardProps {
  projects: Project[];
  clients: Client[];
  onAddProject: (newProject: Omit<Project, 'id'>) => void;
  onUpdateProject: (id: string, project: Omit<Project, 'id'>) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProjectProgress: (id: string, progress: number, status?: ProjectStatus) => void;
}

export const ProjectBoard: React.FC<ProjectBoardProps> = ({
  projects,
  clients,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onUpdateProjectProgress
}) => {
  const [filterStatus, setFilterStatus] = useState<'todos' | ProjectStatus>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [category, setCategory] = useState<Project['category']>('Desarrollo Web');
  const [budget, setBudget] = useState<number | ''>('');
  const [priority, setPriority] = useState<PriorityLevel>('alta');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  const filteredProjects = projects.filter(proj => {
    const matchesStatus = filterStatus === 'todos' || proj.status === filterStatus;
    const matchesSearch = proj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          proj.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          proj.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientId || !budget) return;

    const client = clients.find(c => c.id === clientId);

    const projectData: Omit<Project, 'id'> = {
      title,
      clientId,
      clientName: client ? client.company : 'Cliente General',
      category,
      budget: Number(budget),
      status: 'en_progreso' as ProjectStatus,
      progress: 10,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '2026-10-30',
      priority,
      assignedTo: ['Dev Team'],
      description
    };

    if (editingProject) {
      onUpdateProject(editingProject.id, { ...projectData, progress: editingProject.progress, status: editingProject.status });
    } else {
      onAddProject(projectData);
    }

    closeProjectModal();
  };

  const closeProjectModal = () => {
    setTitle('');
    setClientId('');
    setBudget('');
    setDescription('');
    setEditingProject(null);
    setShowAddModal(false);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setTitle(project.title);
    setClientId(project.clientId);
    setCategory(project.category);
    setBudget(project.budget);
    setPriority(project.priority);
    setStartDate(project.startDate);
    setEndDate(project.endDate);
    setDescription(project.description);
    setShowAddModal(true);
  };

  const totalContractedBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const averageProgress = projects.length > 0
    ? (projects.reduce((sum, project) => sum + project.progress, 0) / projects.length).toFixed(1)
    : '0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>Trabajos Pendientes & Proyectos</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Monitoreo continuo de entregables, avance porcentual y asignación de equipo
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Crear Nuevo Trabajo / Proyecto
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-3">
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>PROYECTOS EN CURSO</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
            {projects.filter(p => p.status === 'en_progreso' || p.status === 'revision').length} Activos
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.2rem', fontWeight: 600 }}>
            {projects.filter(p => p.status === 'revision').length} En aprobación con cliente
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>VALOR CONTRATADO TOTAL</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
            ${totalContractedBudget.toLocaleString()} COP
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Suma de presupuestos asignados
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUMPLIMIENTO DE AVANCE</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#818cf8', marginTop: '0.2rem' }}>
            {averageProgress}% Promedio
          </div>
          <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '0.2rem', fontWeight: 600 }}>
            {projects.length > 0 ? 'Avance de los proyectos registrados' : 'Sin proyectos registrados'}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar por proyecto, cliente, servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.4rem', height: '38px', fontSize: '0.83rem' }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="form-select"
          style={{ width: '180px', height: '38px', fontSize: '0.83rem' }}
        >
          <option value="todos">Estado: Todos</option>
          <option value="en_progreso">⚡ En Desarrollo</option>
          <option value="revision">👀 En Revisión</option>
          <option value="borrador">📝 Borrador</option>
          <option value="completado">✅ Completado</option>
        </select>
      </div>

      {/* Projects Cards Grid */}
      <div className="grid-2">
        {filteredProjects.length === 0 && (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
            Aún no hay proyectos. Crea el primero para comenzar a organizar tu trabajo.
          </div>
        )}
        {filteredProjects.map((project) => {
          const isHighPriority = project.priority === 'alta';
          const isCompleted = project.status === 'completado';

          return (
            <div
              key={project.id} 
              className="glass-panel glass-panel-hover"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.2rem', borderColor: isCompleted ? 'rgba(16, 185, 129, 0.45)' : undefined }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                  <div>
                    <span className="badge badge-indigo" style={{ marginBottom: '0.4rem' }}>{project.category}</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {project.title}
                      {isCompleted && <CheckCircle2 size={18} color="#34d399" aria-label="Trabajo completado" />}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Cliente: <strong style={{ color: '#ffffff' }}>{project.clientName}</strong>
                    </div>
                  </div>

                  <span className={`badge ${isHighPriority ? 'badge-rose' : 'badge-amber'}`}>
                    {project.priority} prioridad
                  </span>
                </div>

                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: '1.45', margin: '0.75rem 0' }}>
                  {project.description}
                </p>

                {/* Progress Bar & Slider */}
                <div style={{ margin: '1rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Avance del proyecto:</span>
                    <span style={{ color: '#ffffff', fontWeight: 800 }}>{project.progress}%</span>
                  </div>

                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${project.progress}%`,
                      height: '100%',
                      background: isCompleted ? '#10b981' : 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                      borderRadius: '10px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>

                  {/* Progress Controls */}
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                    {[25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => onUpdateProjectProgress(project.id, pct, pct === 100 ? 'completado' : 'en_progreso')}
                        style={{
                          background: project.progress === pct ? (pct === 100 ? '#059669' : 'var(--primary)') : 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        {pct === 100 ? <><CheckCircle2 size={13} /> {isCompleted ? 'Finalizado' : 'Finalizar'}</> : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div style={{
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={14} color="#818cf8" /> {project.endDate}
                  </span>
                  <span>•</span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>
                    ${project.budget.toLocaleString()} COP
                  </span>
                </div>

                <span className={`badge ${isCompleted ? 'badge-success' : 'badge-indigo'}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              <div className="project-actions">
                <button className="btn-secondary project-action-button" onClick={() => openEditModal(project)}>
                  <Pencil size={15} /> Modificar
                </button>
                <button
                  className="btn-secondary project-action-button project-delete-button"
                  onClick={() => {
                    if (confirm(`¿Eliminar el trabajo "${project.title}"?`)) onDeleteProject(project.id);
                  }}
                >
                  <Trash2 size={15} /> Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>
              {editingProject ? 'Modificar Trabajo / Proyecto' : 'Crear Nuevo Trabajo / Proyecto'}
            </h3>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Título del Proyecto / Entregable</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Rediseño de Plataforma Web & Agente IA"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  style={{ marginTop: '0.3rem' }}
                />
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cliente Asignado</label>
                  <select value={clientId} onChange={(e) => setClientId(e.target.value)} required className="form-select" style={{ marginTop: '0.3rem' }}>
                    <option value="">Seleccionar cliente...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company} ({c.name})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Categoría del Trabajo</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="form-select" style={{ marginTop: '0.3rem' }}>
                    <option value="Desarrollo Web">Desarrollo Web</option>
                    <option value="App Móvil">App Móvil</option>
                    <option value="Consultoría IA">Consultoría IA</option>
                    <option value="Branding & Diseño">Branding & Diseño</option>
                    <option value="Marketing Digital">Marketing Digital</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Presupuesto (COP)</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej. 15000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : '')}
                    className="form-input"
                    style={{ marginTop: '0.3rem' }}
                  />
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
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fecha de Inicio</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input"
                    style={{ marginTop: '0.3rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fecha Límite de Entrega</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-input"
                    style={{ marginTop: '0.3rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Descripción y Alcance</label>
                <textarea
                  placeholder="Detalles sobre entregables, tecnologías clave, requerimientos..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  style={{ marginTop: '0.3rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={closeProjectModal}>Cancelar</button>
                <button type="submit" className="btn-primary">{editingProject ? 'Guardar Cambios' : 'Guardar Proyecto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
