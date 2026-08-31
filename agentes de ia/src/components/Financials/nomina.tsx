import React from 'react';
import { BriefcaseBusiness, CreditCard, Users, Clock3 } from 'lucide-react';
import type { Transaction } from '../../types';

interface NominaPanelProps {
  payrollTransactions: Transaction[];
  onAddPayroll: () => void;
}

export const NominaPanel: React.FC<NominaPanelProps> = ({ payrollTransactions, onAddPayroll }) => {
  const paidPayroll = payrollTransactions
    .filter((t) => t.status === 'pagado')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingPayroll = payrollTransactions
    .filter((t) => t.status === 'pendiente')
    .reduce((sum, t) => sum + t.amount, 0);

  const payrollCount = payrollTransactions.length;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>Control de Nómina</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Pagos a colaboradores, comisiones y compensaciones pendientes del periodo
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={onAddPayroll} style={{ padding: '0.55rem 0.9rem', fontSize: '0.78rem' }}>
            + Registrar nómina
          </button>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.16), rgba(99,102,241,0.16))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399',
            border: '1px solid rgba(52,211,153,0.25)'
          }}>
            <BriefcaseBusiness size={20} />
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pagado</span>
            <CreditCard size={16} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399' }}>
            ${paidPayroll.toLocaleString()} COP
          </div>
        </div>

        <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pendiente</span>
            <Clock3 size={16} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24' }}>
            ${pendingPayroll.toLocaleString()} COP
          </div>
        </div>

        <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Registros</span>
            <Users size={16} color="#818cf8" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
            {payrollCount}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {payrollTransactions.length === 0 ? (
          <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.12)', color: 'var(--text-muted)' }}>
            Aún no hay pagos de nómina registrados.
          </div>
        ) : (
          payrollTransactions.slice(0, 5).map((tx) => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.8rem 0.9rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>{tx.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{tx.clientOrVendor} • {tx.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <span style={{ fontWeight: 800, color: '#fb7185' }}>-${tx.amount.toLocaleString()} COP</span>
                <span className={`badge ${tx.status === 'pagado' ? 'badge-success' : tx.status === 'pendiente' ? 'badge-amber' : 'badge-rose'}`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
