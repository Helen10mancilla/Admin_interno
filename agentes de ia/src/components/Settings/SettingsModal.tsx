import React, { useRef } from 'react';
import { 
  Building, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  Database
} from 'lucide-react';
import type { Client, Project, Task, Transaction } from '../../types';

interface SettingsModalProps {
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  transactions: Transaction[];
  onResetData: () => void;
  onImportData: (data: { clients: Client[]; projects: Project[]; tasks: Task[]; transactions: Transaction[] }) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  clients,
  projects,
  tasks,
  transactions,
  onResetData,
  onImportData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const fullData = {
      exportDate: new Date().toISOString(),
      company: 'Zyra Digital',
      version: '2.4.0',
      clients,
      projects,
      tasks,
      transactions
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `zyra_digital_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.clients && parsed.projects && parsed.tasks && parsed.transactions) {
            onImportData({
              clients: parsed.clients,
              projects: parsed.projects,
              tasks: parsed.tasks,
              transactions: parsed.transactions
            });
            alert('¡Respaldo importado exitosamente en Zyra Digital!');
          } else {
            alert('El archivo JSON no coincide con la estructura requerida.');
          }
        } catch (err) {
          alert('Error al leer el archivo JSON.');
        }
      };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>Configuración de Zyra Digital & Respaldo</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Ajustes de perfil empresarial, gestión de la base de datos local y exportación de información
        </p>
      </div>

      {/* Company Profile Card */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <Building size={20} color="#818cf8" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Perfil de la Empresa (Corporativo)</h3>
        </div>

        <div className="grid-2">
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nombre Comercial</label>
            <input type="text" readOnly value="Zyra Digital S.A. S." className="form-input" style={{ marginTop: '0.3rem' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Identificación Fiscal / RFC</label>
            <input type="text" readOnly value="ZDI260110-8A9" className="form-input" style={{ marginTop: '0.3rem' }} />
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Moneda Predeterminada</label>
            <input type="text" readOnly value="COP ($) / USD ($)" className="form-input" style={{ marginTop: '0.3rem' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Zona Horaria & Operación</label>
            <input type="text" readOnly value="América/Colombia (GMT-5 (UTC-5))" className="form-input" style={{ marginTop: '0.3rem' }} />
          </div>
        </div>
      </div>

      {/* Data Management & Backup Card */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <Database size={20} color="#34d399" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Gestión de Datos & Respaldos JSON</h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
          Toda la información del panel de <strong>Zyra Digital</strong> (Clientes, Proyectos, Ingresos/Egresos y Tareas) está sincronizada de manera segura en tu navegador (`localStorage`). Puedes exportar un respaldo completo en formato JSON para guardar tus datos o cargarlo en otro dispositivo.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={handleExportJSON}>
            <Download size={18} /> Exportar Respaldo Completo (.JSON)
          </button>

          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} /> Importar Archivo JSON
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />

          <button 
            className="btn-secondary" 
            onClick={() => {
              if (confirm('¿Estás seguro de restablecer los datos iniciales de Zyra Digital?')) {
                onResetData();
              }
            }}
            style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
          >
            <RotateCcw size={18} /> Restablecer Datos de Fábrica
          </button>
        </div>
      </div>

      {/* Security & System Info */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <ShieldCheck size={20} color="#c084fc" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Seguridad & Arquitectura</h3>
        </div>
        <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div>• <strong>Versión del Sistema:</strong> Zyra Digital OS v2.4.0 High-Performance Suite</div>
          <div>• <strong>Encriptación de Almacenamiento:</strong> Persistencia aislada por dominio de origen</div>
          <div>• <strong>Módulos Activos:</strong> Dashboard Overview, Financial Hub, Client CRM, Project Deliverables & Corporate Kanban</div>
        </div>
      </div>

    </div>
  );
};
