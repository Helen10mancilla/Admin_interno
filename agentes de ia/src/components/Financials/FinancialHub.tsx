import React, { useState } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  DollarSign, 
  CheckCircle2, 
  Clock
} from 'lucide-react';
import type { Transaction, TransactionType, TransactionStatus } from '../../types';

interface FinancialHubProps {
  transactions: Transaction[];
  onAddTransaction: (newTx: Omit<Transaction, 'id'>) => void;
  onUpdateTransactionStatus: (id: string, status: TransactionStatus) => void;
}

export const FinancialHub: React.FC<FinancialHubProps> = ({
  transactions,
  onAddTransaction,
  onUpdateTransactionStatus
}) => {
  const [filterType, setFilterType] = useState<'todos' | TransactionType>('todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | TransactionStatus>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TransactionType>('ingreso');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<Transaction['category']>('Servicios Web');
  const [clientOrVendor, setClientOrVendor] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('pagado');
  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('Transferencia');
  const [invoiceRef, setInvoiceRef] = useState('');

  // Metrics
  const paidIncome = transactions
    .filter(t => t.type === 'ingreso' && t.status === 'pagado')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingIncome = transactions
    .filter(t => t.type === 'ingreso' && t.status === 'pendiente')
    .reduce((sum, t) => sum + t.amount, 0);

  const paidExpenses = transactions
    .filter(t => t.type === 'egreso' && t.status === 'pagado')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = paidIncome - paidExpenses;

  // Filtered List
  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'todos' || t.type === filterType;
    const matchesStatus = filterStatus === 'todos' || t.status === filterStatus;
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.clientOrVendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.invoiceRef && t.invoiceRef.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesStatus && matchesSearch;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !clientOrVendor) return;

    onAddTransaction({
      title,
      type,
      amount: Number(amount),
      category,
      clientOrVendor,
      status,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      invoiceRef: invoiceRef || `INV-${Math.floor(1000 + Math.random() * 9000)}`
    });

    // Reset Form
    setTitle('');
    setAmount('');
    setClientOrVendor('');
    setInvoiceRef('');
    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>Módulo de Ingresos & Egresos</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Control del libro contable, seguimiento de pagos y facturas pendientes de cobro
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Registrar Movimiento Financiero
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid-4">
        {/* Card 1: Ingresos Pagados */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>INGRESOS COBRADOS</span>
            <TrendingUp size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
            ${paidIncome.toLocaleString()} COP
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Liquidez efectiva ingresada
          </div>
        </div>

        {/* Card 2: Pendiente por Cobrar */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>POR COBRAR (PENDIENTE)</span>
            <Clock size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>
            ${pendingIncome.toLocaleString()} COP
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Facturas pendientes de clientes
          </div>
        </div>

        {/* Card 3: Egresos Totales */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>EGRESOS & OPERACIÓN</span>
            <TrendingDown size={20} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fb7185' }}>
            ${paidExpenses.toLocaleString()} COP
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Nómina, SaaS, Infraestructura
          </div>
        </div>

        {/* Card 4: Balance Neto */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>BALANCE OPERATIVO</span>
            <DollarSign size={20} color="#818cf8" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
            ${netBalance.toLocaleString()} COP
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.2rem', fontWeight: 600 }}>
            Utilidad neta positiva
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar por concepto o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.4rem', height: '38px', fontSize: '0.83rem' }}
          />
        </div>

        {/* Filter Type */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="form-select"
          style={{ width: '150px', height: '38px', fontSize: '0.83rem' }}
        >
          <option value="todos">Tipo: Todos</option>
          <option value="ingreso">Ingresos (+)</option>
          <option value="egreso">Egresos (-)</option>
        </select>

        {/* Filter Status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="form-select"
          style={{ width: '160px', height: '38px', fontSize: '0.83rem' }}
        >
          <option value="todos">Estado: Todos</option>
          <option value="pagado">Pagados</option>
          <option value="pendiente">Pendientes</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>Libro de Registro Financiero</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{filteredTransactions.length} registros encontrados</span>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Factura / Ref</th>
                <th>Concepto / Título</th>
                <th>Cliente / Proveedor</th>
                <th>Categoría</th>
                <th>Método</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#818cf8', fontWeight: 600 }}>
                      {tx.invoiceRef || 'N/A'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#ffffff' }}>{tx.title}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>{tx.clientOrVendor}</td>
                  <td>
                    <span className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>{tx.category}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{tx.paymentMethod}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{tx.date}</td>
                  <td style={{ fontWeight: 800, fontSize: '0.95rem', color: tx.type === 'ingreso' ? '#34d399' : '#fb7185' }}>
                    {tx.type === 'ingreso' ? '+' : '-'}${tx.amount.toLocaleString()} USD
                  </td>
                  <td>
                    <span className={`badge ${tx.status === 'pagado' ? 'badge-success' : tx.status === 'pendiente' ? 'badge-amber' : 'badge-rose'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td>
                    {tx.status === 'pendiente' ? (
                      <button
                        onClick={() => onUpdateTransactionStatus(tx.id, 'pagado')}
                        className="btn-secondary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', color: '#34d399' }}
                      >
                        <CheckCircle2 size={13} /> Marcar Pagado
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>
              Registrar Nuevo Movimiento Financiero
            </h3>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tipo de Movimiento</label>
                  <select value={type} onChange={(e) => setType(e.target.value as any)} className="form-select" style={{ marginTop: '0.3rem' }}>
                    <option value="ingreso">Ingreso (+)</option>
                    <option value="egreso">Egreso (-)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Monto (USD)</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="form-input"
                    style={{ marginTop: '0.3rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Concepto / Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Desarrollo de Landing Page B2B"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  style={{ marginTop: '0.3rem' }}
                />
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cliente o Proveedor</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Nexus Tech Corp"
                    value={clientOrVendor}
                    onChange={(e) => setClientOrVendor(e.target.value)}
                    className="form-input"
                    style={{ marginTop: '0.3rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Categoría</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="form-select" style={{ marginTop: '0.3rem' }}>
                    <option value="Servicios Web">Servicios Web</option>
                    <option value="Desarrollo Software">Desarrollo Software</option>
                    <option value="Consultoría IA">Consultoría IA</option>
                    <option value="Nómina">Nómina</option>
                    <option value="Servidores & Cloud">Servidores & Cloud</option>
                    <option value="Herramientas SaaS">Herramientas SaaS</option>
                    <option value="Marketing & Ads">Marketing & Ads</option>
                    <option value="Oficina & Impuestos">Oficina & Impuestos</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estado de Pago</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="form-select" style={{ marginTop: '0.3rem' }}>
                    <option value="pagado">Pagado / Cobrado</option>
                    <option value="pendiente">Pendiente de Cobro</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Método de Pago</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} className="form-select" style={{ marginTop: '0.3rem' }}>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Stripe">Stripe</option>
                    <option value="Tarjeta">Tarjeta Corporativa</option>
                    <option value="PayPal">PayPal</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Referencia de Factura (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. INV-2026-099"
                  value={invoiceRef}
                  onChange={(e) => setInvoiceRef(e.target.value)}
                  className="form-input"
                  style={{ marginTop: '0.3rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
