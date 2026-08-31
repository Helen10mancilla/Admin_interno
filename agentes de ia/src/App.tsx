import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import { FinancialHub } from './components/Financials/FinancialHub';
import { ClientCRM } from './components/Clients/ClientCRM';
import { ProjectBoard } from './components/Projects/ProjectBoard';
import { TaskManager } from './components/Tasks/TaskManager';
import { SettingsModal } from './components/Settings/SettingsModal';
import { QuickAddModal } from './components/QuickAddModal';
import { supabase } from './supabaseClient';
import { fetchAllData, dataService, toClient, toProject, toTask, toTransaction, toNotification } from './dataservice';

import type {
  Client,
  Project,
  Task,
  Transaction,
  NotificationItem,
  ActiveTab,
  TransactionStatus,
  ProjectStatus,
  TaskStatus
} from './types';

// Reemplaza una fila por id, o la agrega si es nueva. Usado por las
// suscripciones en tiempo real para mantener sincronizados a todos los usuarios.
function upsertById<T extends { id: string }>(list: T[], row: T): T[] {
  const exists = list.some(item => item.id === row.id);
  return exists ? list.map(item => (item.id === row.id ? row : item)) : [row, ...list];
}

function removeById<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter(item => item.id !== id);
}

// Ejecuta una mutación de Supabase y muestra el error en consola si falla,
// para que nunca se pierda un guardado en silencio.
async function runMutation(label: string, promise: PromiseLike<{ error: any }>) {
  const { error } = await promise;
  if (error) {
    console.error(`[Supabase] Error en ${label}:`, error.message, error);
    alert(`No se pudo guardar (${label}): ${error.message}`);
  }
  return error;
}

export const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // --- Autenticación ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // --- Carga inicial + suscripción en tiempo real (solo si hay sesión) ---
  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    fetchAllData()
      .then(data => {
        if (cancelled) return;
        setClients(data.clients);
        setProjects(data.projects);
        setTasks(data.tasks);
        setTransactions(data.transactions);
        setNotifications(data.notifications);
        setDataLoaded(true);
      })
      .catch(err => {
        console.error('Error cargando datos de Supabase:', err);
      });

    const channel = supabase
      .channel('zyra-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, (payload) => {
        if (payload.eventType === 'DELETE') setClients(prev => removeById(prev, (payload.old as any).id));
        else setClients(prev => upsertById(prev, toClient(payload.new)));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        if (payload.eventType === 'DELETE') setProjects(prev => removeById(prev, (payload.old as any).id));
        else setProjects(prev => upsertById(prev, toProject(payload.new)));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'DELETE') setTasks(prev => removeById(prev, (payload.old as any).id));
        else setTasks(prev => upsertById(prev, toTask(payload.new)));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
        if (payload.eventType === 'DELETE') setTransactions(prev => removeById(prev, (payload.old as any).id));
        else setTransactions(prev => upsertById(prev, toTransaction(payload.new)));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload.eventType === 'DELETE') setNotifications(prev => removeById(prev, (payload.old as any).id));
        else setNotifications(prev => upsertById(prev, toNotification(payload.new)));
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [session]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword
    });
    setLoginLoading(false);

    if (error) {
      setLoginError('El usuario o la contraseña no son correctos.');
      return;
    }
    setLoginPassword('');
  };

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setDataLoaded(false);
  }, []);

  // --- Handlers de mutación: escriben en Supabase; el estado local se
  // actualiza vía la suscripción en tiempo real de arriba (para todos) ---

  const handleAddClient = (newClientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...newClientData,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    runMutation('agregar cliente', dataService.insertClient(newClient));

    runMutation('agregar notificación', dataService.insertNotification({
      id: `notif-${Date.now()}`,
      title: 'Nuevo Cliente Registrado',
      message: `${newClient.company} (${newClient.name}) añadido a la cartera CRM.`,
      time: 'Justo ahora',
      type: 'info',
      read: false
    }));
  };

  const handleAddProject = (newProjData: Omit<Project, 'id'>) => {
    const newProj: Project = {
      ...newProjData,
      id: `proj-${Date.now()}`
    };
    runMutation('agregar proyecto', dataService.insertProject(newProj));

    const relatedClient = clients.find(c => c.id === newProj.clientId);
    if (relatedClient) {
      runMutation('actualizar cliente', dataService.updateClient({
        ...relatedClient,
        activeProjectsCount: relatedClient.activeProjectsCount + 1
      }));
    }
  };

  const handleUpdateProjectProgress = (id: string, progress: number, newStatus?: ProjectStatus) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    const status =
      newStatus || (progress === 100 ? 'completado' : project.status === 'completado' ? 'en_progreso' : project.status);
    runMutation('actualizar progreso del proyecto', dataService.updateProject({ ...project, progress, status }));
  };

  const handleUpdateProject = (id: string, updatedProject: Omit<Project, 'id'>) => {
    runMutation('actualizar proyecto', dataService.updateProject({ ...updatedProject, id }));
  };

  const handleDeleteProject = (id: string) => {
    const projectToDelete = projects.find(p => p.id === id);
    runMutation('eliminar proyecto', dataService.deleteProject(id));

    if (projectToDelete) {
      const relatedClient = clients.find(c => c.id === projectToDelete.clientId);
      if (relatedClient) {
        runMutation('actualizar cliente', dataService.updateClient({
          ...relatedClient,
          activeProjectsCount: Math.max(0, relatedClient.activeProjectsCount - 1)
        }));
      }
    }
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`
    };
    runMutation('agregar tarea', dataService.insertTask(newTask));
  };

  const handleUpdateTaskStatus = (id: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    runMutation('actualizar estado de tarea', dataService.updateTask({ ...task, status }));
  };

  const handleToggleTaskStatus = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const isDone = task.status === 'completado';
    runMutation('actualizar tarea', dataService.updateTask({ ...task, status: isDone ? 'por_hacer' : 'completado' }));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    runMutation('actualizar subtarea', dataService.updateTask({ ...task, subtasks: updatedSubtasks }));
  };

  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`
    };
    runMutation('agregar transacción', dataService.insertTransaction(newTx));

    if (newTx.type === 'ingreso' && newTx.status === 'pagado') {
      const relatedClient = clients.find(
        c => c.company.toLowerCase() === newTx.clientOrVendor.toLowerCase()
      );
      if (relatedClient) {
        runMutation('actualizar cliente', dataService.updateClient({
          ...relatedClient,
          totalSpent: relatedClient.totalSpent + newTx.amount
        }));
      }
    }
  };

  const handleUpdateTransactionStatus = (id: string, status: TransactionStatus) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    if (tx.type === 'ingreso' && status === 'pagado' && tx.status !== 'pagado') {
      const relatedClient = clients.find(
        c => c.company.toLowerCase() === tx.clientOrVendor.toLowerCase()
      );
      if (relatedClient) {
        runMutation('actualizar cliente', dataService.updateClient({
          ...relatedClient,
          totalSpent: relatedClient.totalSpent + tx.amount
        }));
      }
    }

    runMutation('actualizar transacción', dataService.updateTransaction({ ...tx, status }));
  };

  const handleResetData = async () => {
    await Promise.all([
      supabase.from('clients').delete().neq('id', ''),
      supabase.from('projects').delete().neq('id', ''),
      supabase.from('tasks').delete().neq('id', ''),
      supabase.from('transactions').delete().neq('id', ''),
      supabase.from('notifications').delete().neq('id', ''),
    ]);
  };

  const handleImportData = async (data: {
    clients: Client[];
    projects: Project[];
    tasks: Task[];
    transactions: Transaction[];
  }) => {
    await Promise.all([
      ...data.clients.map(c => dataService.insertClient(c)),
      ...data.projects.map(p => dataService.insertProject(p)),
      ...data.tasks.map(t => dataService.insertTask(t)),
      ...data.transactions.map(t => dataService.insertTransaction(t)),
    ]);
  };

  const markNotificationsAsRead = () => {
    notifications.filter(n => !n.read).forEach(n => {
      dataService.updateNotification({ ...n, read: true });
    });
  };

  if (!authChecked) {
    return null;
  }

  if (!session) {
    return (
      <main className="login-screen">
        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-brand-mark">Z</div>
          <p className="login-eyebrow">ZYRA WORKSPACE</p>
          <h1 id="login-title">Acceso privado</h1>
          <p className="login-description">Inicia sesión para entrar al panel administrativo.</p>

          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="login-email">Correo</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              required
            />

            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Escribe tu contraseña"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              required
            />

            {loginError && <p className="login-error" role="alert">{loginError}</p>}
            <button className="btn-primary login-submit" type="submit" disabled={loginLoading}>
              {loginLoading ? 'Entrando…' : 'Entrar al panel'}
            </button>
          </form>
        </section>
      </main>
    );
  }

  if (!dataLoaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        Cargando panel de Zyra Digital…
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeProjectsCount={projects.filter(p => p.status === 'en_progreso' || p.status === 'revision').length}
        pendingTasksCount={tasks.filter(t => t.status !== 'completado').length}
      />

      {isSidebarOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Cerrar menú de navegación"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Workspace */}
      <div className="main-content">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notifications={notifications}
          markNotificationsAsRead={markNotificationsAsRead}
          onOpenQuickAddModal={() => setIsQuickAddOpen(true)}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onLogout={handleLogout}
          onNavigate={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
        />

        {/* View Component Router */}
        <main className="page-body">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              transactions={transactions}
              projects={projects}
              tasks={tasks}
              clients={clients}
              setActiveTab={setActiveTab}
              onToggleTaskStatus={handleToggleTaskStatus}
            />
          )}

          {activeTab === 'financials' && (
            <FinancialHub
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onUpdateTransactionStatus={handleUpdateTransactionStatus}
            />
          )}

          {activeTab === 'clients' && (
            <ClientCRM
              clients={clients}
              projects={projects}
              onAddClient={handleAddClient}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectBoard
              projects={projects}
              clients={clients}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onUpdateProjectProgress={handleUpdateProjectProgress}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskManager
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onToggleSubtask={handleToggleSubtask}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsModal
              clients={clients}
              projects={projects}
              tasks={tasks}
              transactions={transactions}
              onResetData={handleResetData}
              onImportData={handleImportData}
            />
          )}
        </main>
      </div>

      {/* Global Quick Add Action Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default App;
