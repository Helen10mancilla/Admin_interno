import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  X
} from 'lucide-react';
import type { NotificationItem, ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  notifications: NotificationItem[];
  markNotificationsAsRead: () => void;
  onOpenQuickAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  searchQuery,
  setSearchQuery,
  notifications,
  markNotificationsAsRead,
  onOpenQuickAddModal
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const tabTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard General', subtitle: 'Resumen ejecutivo de operaciones, ingresos y tareas pendientes' },
    financials: { title: 'Ingresos & Egresos', subtitle: 'Control financiero, flujo de caja y estado de facturación' },
    clients: { title: 'Gestión CRM de Clientes', subtitle: 'Directorio empresarial, contactos y valor de cartera' },
    projects: { title: 'Trabajos Pendientes & Proyectos', subtitle: 'Monitoreo de entregables, avance y fechas límite' },
    tasks: { title: 'Tareas Corporativas Internas', subtitle: 'Tablero operativo por departamentos y equipos' },
    settings: { title: 'Configuración & Respaldo', subtitle: 'Ajustes del sistema y exportación de datos' },
  };

  const currentTabInfo = tabTitles[activeTab];

  return (
    <header style={{
      padding: '1.25rem 2rem',
      background: 'rgba(10, 15, 26, 0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      gap: '1.5rem'
    }}>
      {/* Title & Subtitle */}
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          {currentTabInfo.title}
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
          {currentTabInfo.subtitle}
        </p>
      </div>

      {/* Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Global Search Bar */}
        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar proyectos, clientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.4rem', height: '38px', fontSize: '0.83rem', borderRadius: '10px' }}
          />
          {searchQuery && (
            <X 
              size={14} 
              color="var(--text-muted)" 
              onClick={() => setSearchQuery('')} 
              style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
            />
          )}
        </div>

        {/* Date Filter Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-color)',
          padding: '0.45rem 0.8rem',
          borderRadius: '10px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <Calendar size={14} color="var(--primary)" />
          <span>Agosto 2026</span>
        </div>

        {/* Notifications Button & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications && unreadCount > 0) {
                markNotificationsAsRead();
              }
            }}
            title="Notificaciones"
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--rose)',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #090d16'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="glass-panel" style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '340px',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
              padding: '1rem',
              zIndex: 100
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Notificaciones</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notifications.length} recientes</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{
                    display: 'flex',
                    gap: '0.75rem',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    background: n.read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(99, 102, 241, 0.08)',
                    borderLeft: `3px solid ${n.type === 'success' ? '#10b981' : n.type === 'warning' ? '#f59e0b' : '#6366f1'}`
                  }}>
                    <div style={{ marginTop: '0.1rem' }}>
                      {n.type === 'success' && <CheckCircle2 size={16} color="#10b981" />}
                      {n.type === 'warning' && <AlertCircle size={16} color="#f59e0b" />}
                      {n.type === 'info' && <Info size={16} color="#6366f1" />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>{n.title}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{n.message}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Button */}
        <button className="btn-primary" onClick={onOpenQuickAddModal}>
          <Plus size={18} />
          <span>Nuevo Registro</span>
        </button>
      </div>
    </header>
  );
};
