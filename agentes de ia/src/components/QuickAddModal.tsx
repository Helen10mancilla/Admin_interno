import React from 'react';
import { Wallet, Users, Briefcase, CheckSquare, X } from 'lucide-react';
import type { ActiveTab } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  setActiveTab
}) => {
  if (!isOpen) return null;

  const options = [
    {
      id: 'financials',
      title: 'Movimiento Financiero',
      subtitle: 'Registrar nuevo Ingreso (+) o Egreso (-)',
      icon: Wallet,
      color: '#10b981'
    },
    {
      id: 'clients',
      title: 'Nuevo Cliente',
      subtitle: 'Agregar empresa a la cartera CRM',
      icon: Users,
      color: '#8b5cf6'
    },
    {
      id: 'projects',
      title: 'Trabajo / Proyecto',
      subtitle: 'Asignar nuevo proyecto y fecha límite',
      icon: Briefcase,
      color: '#6366f1'
    },
    {
      id: 'tasks',
      title: 'Tarea Corporativa',
      subtitle: 'Añadir pendiente al tablero Kanban',
      icon: CheckSquare,
      color: '#f59e0b'
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '540px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>Acción Rápida — Zyra Digital</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>¿Qué tipo de registro deseas agregar al sistema?</p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.id}
                onClick={() => {
                  setActiveTab(opt.id as ActiveTab);
                  onClose();
                }}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '1rem 1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.03)'
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: `${opt.color}20`,
                  border: `1px solid ${opt.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: opt.color
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{opt.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{opt.subtitle}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
