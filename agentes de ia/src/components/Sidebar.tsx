import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Settings, 
  Zap, 
  TrendingUp
} from 'lucide-react';
import type { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeProjectsCount: number;
  pendingTasksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeProjectsCount,
  pendingTasksCount
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'financials' as ActiveTab, label: 'Ingresos & Egresos', icon: Wallet },
    { id: 'clients' as ActiveTab, label: 'Clientes (CRM)', icon: Users },
    { id: 'projects' as ActiveTab, label: 'Trabajos Pendientes', icon: Briefcase, count: activeProjectsCount },
    { id: 'tasks' as ActiveTab, label: 'Tareas Corporativas', icon: CheckSquare, count: pendingTasksCount },
    { id: 'settings' as ActiveTab, label: 'Configuración', icon: Settings },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'rgba(10, 15, 26, 0.95)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      flexShrink: 0
    }}>
      {/* Brand Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0 0.5rem 1.75rem 0.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
        }}>
          <Zap size={22} fill="white" />
        </div>
        <div>
          <div style={{ 
            fontSize: '1.15rem', 
            fontWeight: 800, 
            letterSpacing: '0.05em',
            color: '#ffffff'
          }}>
            ZYRA <span style={{ color: '#6366f1' }}>DIGITAL</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Internal Admin OS
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        <div style={{ 
          fontSize: '0.7rem', 
          fontWeight: 700, 
          color: 'var(--text-dim)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em',
          padding: '0.5rem 0.75rem' 
        }}>
          Navegación Principal
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.9rem',
                borderRadius: '10px',
                border: 'none',
                background: isActive 
                  ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)' 
                  : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={19} color={isActive ? '#818cf8' : '#94a3b8'} />
                <span>{item.label}</span>
              </div>

              {item.count !== undefined && item.count > 0 && (
                <span style={{
                  background: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px'
                }}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Financial Metric Card Widget */}
      <div className="glass-panel" style={{
        padding: '1rem',
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Rendimiento Q3</span>
          <TrendingUp size={16} color="#34d399" />
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
          +24.5% <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>Crecimiento</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
          Flujo de caja optimizado
        </div>
      </div>

      {/* User Footer */}
      <div style={{
        paddingTop: '1rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{ position: 'relative' }}>
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
            alt="Admin"
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
          />
          <span style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#10b981',
            border: '2px solid #090d16'
          }} />
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            Zyra Admin Core
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Super Administrador
          </div>
        </div>
      </div>
    </aside>
  );
};
