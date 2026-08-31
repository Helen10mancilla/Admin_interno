import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Users, 
  Briefcase, 
  CheckSquare, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Zap,
  ChevronRight
} from 'lucide-react';
import type { Transaction, Project, Task, Client, ActiveTab } from '../../types';

interface DashboardOverviewProps {
  transactions: Transaction[];
  projects: Project[];
  tasks: Task[];
  clients: Client[];
  setActiveTab: (tab: ActiveTab) => void;
  onToggleTaskStatus: (taskId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  transactions,
  projects,
  tasks,
  clients,
  setActiveTab,
  onToggleTaskStatus
}) => {
  // Financial Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'ingreso' && t.status === 'pagado')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingIncome = transactions
    .filter(t => t.type === 'ingreso' && t.status === 'pendiente')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'egreso' && t.status === 'pagado')
    .reduce((sum, t) => sum + t.amount, 0);

  const payrollExpenses = transactions
    .filter(t => t.type === 'egreso' && t.category === 'Nómina' && t.status === 'pagado')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;
  const marginPercentage = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : '0';

  const activeProjects = projects.filter(p => p.status === 'en_progreso' || p.status === 'revision');
  const activeClients = clients.filter(c => c.status === 'activo' || c.status === 'vip');
  const pendingTasks = tasks.filter(t => t.status !== 'completado');

  const monthlyData = Array.from({ length: 8 }, (_, index) => {
    const month = index + 1;
    const monthTransactions = transactions.filter(t => {
      const [year, transactionMonth] = t.date.split('-');
      return year === String(new Date().getFullYear()) && Number(transactionMonth) === month;
    });

    return {
      month: new Date(new Date().getFullYear(), index).toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''),
      income: monthTransactions.filter(t => t.type === 'ingreso' && t.status === 'pagado').reduce((sum, t) => sum + t.amount, 0),
      expense: monthTransactions.filter(t => t.type === 'egreso' && t.status === 'pagado').reduce((sum, t) => sum + t.amount, 0)
    };
  });

  const maxChartVal = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense))) * 1.15 || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Executive Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(10, 15, 26, 0.8) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge badge-indigo">
              <Zap size={13} /> Sistema Operativo Activo
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Actualizado hace 2 min</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.4rem' }}>
            Bienvenido al Panel de Zyra Digital
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem', maxWidth: '650px' }}>
            Tienes <strong style={{ color: '#ffffff' }}>{activeProjects.length} trabajos en curso</strong>,{' '}
            <strong style={{ color: '#10b981' }}>${pendingIncome.toLocaleString()} USD por cobrar</strong> y{' '}
            <strong style={{ color: '#fb7185' }}>{pendingTasks.length} tareas operativas pendientes</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={() => setActiveTab('projects')}>
            <Briefcase size={16} /> Ver Trabajos Pendientes
          </button>
          <button className="btn-secondary" onClick={() => setActiveTab('financials')}>
            <Wallet size={16} /> Ir a Finanzas
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-4">
        {/* KPI 1: Total Income */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Ingresos Totales (Cobrados)
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
                ${totalIncome.toLocaleString()} COP
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--emerald-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
            <span style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={14} /> 0%
            </span>
            <span style={{ color: 'var(--text-dim)' }}>vs mes anterior</span>
          </div>
        </div>

        {/* KPI 2: Total Expenses */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Egresos Totales
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
                ${totalExpenses.toLocaleString()} COP
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--rose-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f43f5e'
            }}>
              <TrendingDown size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#fb7185', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <ArrowDownRight size={14} /> 0%
            </span>
            <span style={{ color: 'var(--text-dim)' }}>Nómina: ${payrollExpenses.toLocaleString()} COP</span>
          </div>
        </div>

        {/* KPI 3: Net Balance / Profit Margin */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Margen Neto Operativo
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: netBalance >= 0 ? '#34d399' : '#fb7185', marginTop: '0.25rem' }}>
                ${netBalance.toLocaleString()} COP
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}>
              <Wallet size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
            <span className="badge badge-indigo">{marginPercentage}% Margen</span>
            <span style={{ color: 'var(--text-dim)' }}>saludable</span>
          </div>
        </div>

        {/* KPI 4: Active Clients & Projects */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Cartera Activa
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
                {activeClients.length} Clientes
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--purple-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc'
            }}>
              <Users size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
            <span className="badge badge-purple">{activeProjects.length} Proyectos</span>
            <span style={{ color: 'var(--text-dim)' }}>en desarrollo</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
        
        {/* SVG Cashflow Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                Flujo Financiero (Ingresos vs Egresos 2026)
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Evolución mensual de facturación cobrada y costos de operación
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ color: 'var(--text-muted)' }}>Ingresos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e' }} />
                <span style={{ color: 'var(--text-muted)' }}>Egresos</span>
              </div>
            </div>
          </div>

          {/* SVG Bar / Area Chart Container */}
          <div style={{ height: '220px', width: '100%', position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 700 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              {/* Grid Lines */}
              {[0, 50, 100, 150, 200].map((y, i) => (
                <line key={i} x1="0" y1={y} x2="700" y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="4 4" />
              ))}

              {/* Bars for monthly data */}
              {monthlyData.map((d, index) => {
                const barWidth = 24;
                const gap = 88;
                const startX = index * gap + 40;
                
                const incomeH = (d.income / maxChartVal) * 160;
                const expenseH = (d.expense / maxChartVal) * 160;

                const incomeY = 180 - incomeH;
                const expenseY = 180 - expenseH;

                return (
                  <g key={d.month} className="chart-group">
                    {/* Income Bar */}
                    <rect
                      x={startX}
                      y={incomeY}
                      width={barWidth}
                      height={incomeH}
                      rx="4"
                      fill="url(#incomeGrad)"
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    {/* Expense Bar */}
                    <rect
                      x={startX + barWidth + 4}
                      y={expenseY}
                      width={barWidth}
                      height={expenseH}
                      rx="4"
                      fill="url(#expenseGrad)"
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    {/* Month Label */}
                    <text
                      x={startX + barWidth}
                      y="196"
                      fill="#94a3b8"
                      fontSize="11"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {d.month}
                    </text>
                  </g>
                );
              })}

              {/* Gradients */}
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="rgba(16, 185, 129, 0.2)" />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="rgba(244, 63, 94, 0.2)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Project Status Breakdown & Corporate Health */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                Distribución de Proyectos
              </h3>
              <button 
                onClick={() => setActiveTab('projects')}
                style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                Ver todos <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {[
                { label: 'En Desarrollo', count: projects.filter(p => p.status === 'en_progreso').length, color: '#6366f1' },
                { label: 'En Revisión Client', count: projects.filter(p => p.status === 'revision').length, color: '#f59e0b' },
                { label: 'Borrador / Propuesta', count: projects.filter(p => p.status === 'borrador').length, color: '#8b5cf6' },
                { label: 'Entregados & Entregables', count: projects.filter(p => p.status === 'completado').length, color: '#10b981' },
              ].map((item) => {
                const pct = projects.length > 0 ? Math.round((item.count / projects.length) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                      <span style={{ color: '#ffffff', fontWeight: 700 }}>{item.count} ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: '10px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Eficiencia Operativa</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.1rem' }}>
              0% <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sin actividad registrada</span>
            </div>
          </div>
        </div>

      </div>

      {/* Lower Section: Recent Financial Ledger & Urgent Corporate Tasks */}
      <div className="grid-3" style={{ gridTemplateColumns: '1.6fr 1.4fr' }}>
        
        {/* Recent Transactions Ledger Table */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>Últimas Transacciones</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Flujo reciente de facturas e inversiones</p>
            </div>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }} onClick={() => setActiveTab('financials')}>
              Ver Módulo Completo
            </button>
          </div>

          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Concepto / Entidad</th>
                  <th>Tipo</th>
                  <th>Categoría</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      Aún no hay transacciones registradas.
                    </td>
                  </tr>
                )}
                {transactions.slice(0, 5).map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>{t.title}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{t.clientOrVendor} • {t.date}</div>
                    </td>
                    <td>
                      <span className={`badge ${t.type === 'ingreso' ? 'badge-success' : 'badge-rose'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.category}</td>
                    <td style={{ fontWeight: 700, color: t.type === 'ingreso' ? '#34d399' : '#fb7185' }}>
                      {t.type === 'ingreso' ? '+' : '-'}${t.amount.toLocaleString()} USD
                    </td>
                    <td>
                      <span className={`badge ${t.status === 'pagado' ? 'badge-indigo' : 'badge-amber'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Urgent Corporate Tasks */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>Tareas Operativas Internas</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pendientes por resolver en Zyra Digital</p>
            </div>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }} onClick={() => setActiveTab('tasks')}>
              Ver Kanban
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tasks.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 1rem' }}>
                Aún no hay tareas operativas.
              </div>
            )}
            {tasks.slice(0, 4).map((task) => (
              <div 
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  background: task.status === 'completado' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <button
                    onClick={() => onToggleTaskStatus(task.id)}
                    style={{
                      background: task.status === 'completado' ? '#10b981' : 'transparent',
                      border: task.status === 'completado' ? 'none' : '2px solid var(--text-muted)',
                      borderRadius: '6px',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0
                    }}
                  >
                    {task.status === 'completado' && <CheckSquare size={14} />}
                  </button>
                  <div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: task.status === 'completado' ? 'var(--text-dim)' : '#ffffff',
                      textDecoration: task.status === 'completado' ? 'line-through' : 'none'
                    }}>
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span className="badge badge-purple" style={{ padding: '0.1rem 0.4rem', fontSize: '0.68rem' }}>{task.department}</span>
                      <span><Clock size={11} style={{ verticalAlign: 'middle' }} /> {task.dueDate}</span>
                    </div>
                  </div>
                </div>

                <span className={`badge ${task.priority === 'alta' ? 'badge-rose' : 'badge-amber'}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
