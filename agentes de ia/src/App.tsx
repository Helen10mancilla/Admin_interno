import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import { FinancialHub } from './components/Financials/FinancialHub';
import { ClientCRM } from './components/Clients/ClientCRM';
import { ProjectBoard } from './components/Projects/ProjectBoard';
import { TaskManager } from './components/Tasks/TaskManager';
import { SettingsModal } from './components/Settings/SettingsModal';
import { QuickAddModal } from './components/QuickAddModal';

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

import { 
  INITIAL_CLIENTS, 
  INITIAL_PROJECTS, 
  INITIAL_TASKS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_NOTIFICATIONS 
} from './mock/initialData';

const EMPTY_WORKSPACE_VERSION = 'empty-v1';
const STORAGE_KEYS = [
  'zyra_clients',
  'zyra_projects',
  'zyra_tasks',
  'zyra_transactions',
  'zyra_notifications'
];

const prepareEmptyWorkspace = () => {
  if (localStorage.getItem('zyra_workspace_version') !== EMPTY_WORKSPACE_VERSION) {
    STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    localStorage.setItem('zyra_workspace_version', EMPTY_WORKSPACE_VERSION);
  }
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Persistent State Loaders
  const [clients, setClients] = useState<Client[]>(() => {
    prepareEmptyWorkspace();
    const saved = localStorage.getItem('zyra_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('zyra_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('zyra_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('zyra_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('zyra_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('zyra_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('zyra_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('zyra_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('zyra_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('zyra_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Handlers for Data Mutations
  const handleAddClient = (newClientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...newClientData,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setClients([newClient, ...clients]);

    // Add Notification
    setNotifications([
      {
        id: `notif-${Date.now()}`,
        title: 'Nuevo Cliente Registrado',
        message: `${newClient.company} (${newClient.name}) añadido a la cartera CRM.`,
        time: 'Justo ahora',
        type: 'info',
        read: false
      },
      ...notifications
    ]);
  };

  const handleAddProject = (newProjData: Omit<Project, 'id'>) => {
    const newProj: Project = {
      ...newProjData,
      id: `proj-${Date.now()}`
    };
    setProjects([newProj, ...projects]);

    // Update Client activeProjectsCount
    setClients(clients.map(c => 
      c.id === newProj.clientId ? { ...c, activeProjectsCount: c.activeProjectsCount + 1 } : c
    ));
  };

  const handleUpdateProjectProgress = (id: string, progress: number, newStatus?: ProjectStatus) => {
    setProjects(projects.map(p => {
      if (p.id === id) {
        const status = newStatus || (progress === 100 ? 'completado' : p.status);
        return { ...p, progress, status };
      }
      return p;
    }));
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`
    };
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleToggleTaskStatus = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const isDone = t.status === 'completado';
        return { ...t, status: isDone ? 'por_hacer' : 'completado' };
      }
      return t;
    }));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map(st => 
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    }));
  };

  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`
    };
    setTransactions([newTx, ...transactions]);

    // If income and paid, update client spent
    if (newTx.type === 'ingreso' && newTx.status === 'pagado') {
      setClients(clients.map(c => 
        c.company.toLowerCase() === newTx.clientOrVendor.toLowerCase() 
          ? { ...c, totalSpent: c.totalSpent + newTx.amount }
          : c
      ));
    }
  };

  const handleUpdateTransactionStatus = (id: string, status: TransactionStatus) => {
    setTransactions(transactions.map(t => {
      if (t.id === id) {
        // If transitioning to paid income, update client totalSpent
        if (t.type === 'ingreso' && status === 'pagado' && t.status !== 'pagado') {
          setClients(clients.map(c => 
            c.company.toLowerCase() === t.clientOrVendor.toLowerCase()
              ? { ...c, totalSpent: c.totalSpent + t.amount }
              : c
          ));
        }
        return { ...t, status };
      }
      return t;
    }));
  };

  const handleResetData = () => {
    setClients(INITIAL_CLIENTS);
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    localStorage.setItem('zyra_workspace_version', EMPTY_WORKSPACE_VERSION);
  };

  const handleImportData = (data: { clients: Client[]; projects: Project[]; tasks: Task[]; transactions: Transaction[] }) => {
    setClients(data.clients);
    setProjects(data.projects);
    setTasks(data.tasks);
    setTransactions(data.transactions);
  };

  const markNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

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
