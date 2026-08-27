import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  X
} from 'lucide-react';
import type { Client, ClientStatus, Project } from '../../types';

interface ClientCRMProps {
  clients: Client[];
  projects: Project[];
  onAddClient: (newClient: Omit<Client, 'id' | 'createdAt'>) => void;
}

export const ClientCRM: React.FC<ClientCRMProps> = ({ clients, projects, onAddClient }) => {
  const [filterStatus, setFilterStatus] = useState<'todos' | ClientStatus>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // New Client Form
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<ClientStatus>('activo');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const filteredClients = clients.filter(client => {
    const matchesStatus = filterStatus === 'todos' || client.status === filterStatus;
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !email) return;

    onAddClient({
      name,
      company,
      email,
      phone,
      status,
      totalSpent: 0,
      activeProjectsCount: 0,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`,
      notes,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    });

    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setNotes('');
    setTagsInput('');
    setShowAddModal(false);
  };

  const totalPortfolioValue = clients.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>Directorio CRM de Clientes</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Administración de cuentas corporativas, contratos y valor total de cartera
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Registrar Nuevo Cliente
        </button>
      </div>

      {/* CRM Stats Summary Bar */}
      <div className="grid-3">
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>CARTERA TOTAL DE CLIENTES</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
            {clients.length} Cuentas
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.2rem', fontWeight: 600 }}>
            {clients.filter(c => c.status === 'vip').length} Cuentas VIP Enterprise
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>FACTURACIÓN ACUMULADA CLIENTES</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
            ${totalPortfolioValue.toLocaleString()} COP
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Facturación histórica registrada
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>EN NEGOCIACIÓN / POTENCIAL</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.2rem' }}>
            {clients.filter(c => c.status === 'potencial').length} Prospects
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            En fase de propuesta comercial
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar por empresa, contacto, tags..."
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
          style={{ width: '170px', height: '38px', fontSize: '0.83rem' }}
        >
          <option value="todos">Estado: Todos</option>
          <option value="vip">⭐ VIP Enterprise</option>
          <option value="activo">Activo</option>
          <option value="potencial">Potencial (Lead)</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      {/* Client Cards Grid */}
      <div className="grid-3">
        {filteredClients.map((client) => {
          const clientProjects = projects.filter(p => p.clientId === client.id);
          const badgeClass = client.status === 'vip' ? 'badge-purple' :
                             client.status === 'activo' ? 'badge-success' :
                             client.status === 'potencial' ? 'badge-amber' : 'badge-rose';

          return (
            <div 
              key={client.id} 
              className="glass-panel glass-panel-hover" 
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => setSelectedClient(client)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                    <img 
                      src={client.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                      alt={client.name} 
                      style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }} 
                    />
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>{client.company}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{client.name}</div>
                    </div>
                  </div>

                  <span className={`badge ${badgeClass}`}>
                    {client.status === 'vip' ? '⭐ VIP' : client.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', margin: '1rem 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={14} color="#818cf8" /> {client.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={14} color="#818cf8" /> {client.phone}
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {client.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: '0.68rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '12px',
                      color: 'var(--text-muted)'
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Inversión Total</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399' }}>
                    ${client.totalSpent.toLocaleString()} COP
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Proyectos</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    {clientProjects.length} Activos
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Client Detail Drawer / Modal */}
      {selectedClient && (
        <div className="modal-overlay" onClick={() => setSelectedClient(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img 
                  src={selectedClient.avatarUrl} 
                  alt={selectedClient.name} 
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} 
                />
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>{selectedClient.company}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{selectedClient.name} — Cliente registrado desde {selectedClient.createdAt}</p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setSelectedClient(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="grid-2">
                <div className="glass-panel" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>INFORMACIÓN DE CONTACTO</div>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.88rem', color: '#ffffff', fontWeight: 600 }}>{selectedClient.email}</div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{selectedClient.phone}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>VALOR DE CARTERA</div>
                  <div style={{ marginTop: '0.4rem', fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
                    ${selectedClient.totalSpent.toLocaleString()} COP
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>Notas & Requerimientos Clave</h4>
                <div className="glass-panel" style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {selectedClient.notes || 'Sin notas registradas para este cliente.'}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>Proyectos Asociados</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {projects.filter(p => p.clientId === selectedClient.id).map(proj => (
                    <div key={proj.id} className="glass-panel" style={{ padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>{proj.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{proj.category} • Presupuesto ${proj.budget.toLocaleString()} COP</div>
                      </div>
                      <span className="badge badge-indigo">{proj.status} ({proj.progress}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setSelectedClient(null)}>Cerrar Detalle</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>
              Registrar Nuevo Cliente en CRM
            </h3>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nombre de la Empresa</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. TechCorp International"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="form-input"
                    style={{ marginTop: '0.3rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Persona de Contacto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Laura Gómez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    style={{ marginTop: '0.3rem' }}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    placeholder="contacto@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    style={{ marginTop: '0.3rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Teléfono</label>
                  <input
                    type="text"
                    placeholder="+52 55 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                    style={{ marginTop: '0.3rem' }}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estado de la Cuenta</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="form-select" style={{ marginTop: '0.3rem' }}>
                    <option value="activo">Activo</option>
                    <option value="vip">⭐ VIP Enterprise</option>
                    <option value="potencial">Potencial (Lead)</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Etiquetas / Tags (separados por coma)</label>
                  <input
                    type="text"
                    placeholder="Enterprise, SaaS, IA"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="form-input"
                    style={{ marginTop: '0.3rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Notas de la Cuenta</label>
                <textarea
                  placeholder="Observaciones sobre la empresa, expectativas del cliente..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-textarea"
                  style={{ marginTop: '0.3rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
