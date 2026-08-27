export type ClientStatus = 'activo' | 'potencial' | 'vip' | 'inactivo';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: ClientStatus;
  totalSpent: number;
  activeProjectsCount: number;
  avatarUrl?: string;
  createdAt: string;
  notes?: string;
  tags: string[];
}

export type ProjectStatus = 'borrador' | 'en_progreso' | 'revision' | 'completado';
export type PriorityLevel = 'alta' | 'media' | 'baja';

export interface Project {
  id: string;
  title: string;
  clientName: string;
  clientId: string;
  category: 'Desarrollo Web' | 'App Móvil' | 'Branding & Diseño' | 'Marketing Digital' | 'Consultoría IA';
  budget: number;
  status: ProjectStatus;
  progress: number; // 0 - 100
  startDate: string;
  endDate: string;
  priority: PriorityLevel;
  assignedTo: string[];
  description: string;
}

export type Department = 'Tech' | 'Design' | 'Marketing' | 'Admin';
export type TaskStatus = 'por_hacer' | 'en_progreso' | 'revision' | 'completado';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  department: Department;
  priority: PriorityLevel;
  status: TaskStatus;
  assignedTo: string;
  dueDate: string;
  subtasks: Subtask[];
  description?: string;
}

export type TransactionType = 'ingreso' | 'egreso';
export type TransactionStatus = 'pagado' | 'pendiente' | 'cancelado';

export interface Transaction {
  id: string;
  title: string;
  type: TransactionType;
  amount: number;
  category: 'Servicios Web' | 'Desarrollo Software' | 'Consultoría' | 'Consultoría IA' | 'Nómina' | 'Servidores & Cloud' | 'Herramientas SaaS' | 'Marketing & Ads' | 'Oficina & Impuestos';
  clientOrVendor: string;
  status: TransactionStatus;
  date: string;
  paymentMethod: 'Transferencia' | 'Tarjeta' | 'Stripe' | 'PayPal';
  invoiceRef?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

export type ActiveTab = 'dashboard' | 'financials' | 'clients' | 'projects' | 'tasks' | 'settings';
