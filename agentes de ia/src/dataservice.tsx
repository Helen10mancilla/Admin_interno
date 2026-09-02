import { supabase } from './supabaseClient';
import type { Client, Project, Task, Transaction, NotificationItem } from './types';

/* ============================================================
 * Mappers: Supabase (snake_case) <-> App types (camelCase)
 * ============================================================ */

const toClient = (r: any): Client => ({
  id: r.id,
  name: r.name,
  company: r.company,
  email: r.email,
  phone: r.phone,
  status: r.status,
  totalSpent: Number(r.total_spent),
  activeProjectsCount: r.active_projects_count,
  avatarUrl: r.avatar_url ?? undefined,
  createdAt: r.created_at,
  notes: r.notes ?? undefined,
  tags: r.tags ?? [],
});

const fromClient = (c: Client) => ({
  id: c.id,
  name: c.name,
  company: c.company,
  email: c.email,
  phone: c.phone,
  status: c.status,
  total_spent: c.totalSpent,
  active_projects_count: c.activeProjectsCount,
  avatar_url: c.avatarUrl ?? null,
  created_at: c.createdAt,
  notes: c.notes ?? null,
  tags: c.tags,
});

const toProject = (r: any): Project => ({
  id: r.id,
  title: r.title,
  clientName: r.client_name,
  clientId: r.client_id,
  category: r.category,
  budget: Number(r.budget),
  status: r.status,
  progress: r.progress,
  startDate: r.start_date,
  endDate: r.end_date,
  priority: r.priority,
  assignedTo: r.assigned_to ?? [],
  description: r.description,
});

const fromProject = (p: Project) => ({
  id: p.id,
  title: p.title,
  client_name: p.clientName,
  client_id: p.clientId,
  category: p.category,
  budget: p.budget,
  status: p.status,
  progress: p.progress,
  start_date: p.startDate,
  end_date: p.endDate,
  priority: p.priority,
  assigned_to: p.assignedTo,
  description: p.description,
});

const toTask = (r: any): Task => ({
  id: r.id,
  title: r.title,
  department: r.department,
  priority: r.priority,
  status: r.status,
  assignedTo: r.assigned_to,
  dueDate: r.due_date,
  subtasks: r.subtasks ?? [],
  description: r.description ?? undefined,
});

const fromTask = (t: Task) => ({
  id: t.id,
  title: t.title,
  department: t.department,
  priority: t.priority,
  status: t.status,
  assigned_to: t.assignedTo,
  due_date: t.dueDate,
  subtasks: t.subtasks,
  description: t.description ?? null,
});

const toTransaction = (r: any): Transaction => ({
  id: r.id,
  title: r.title,
  type: r.type,
  amount: Number(r.amount),
  category: r.category,
  clientOrVendor: r.client_or_vendor,
  status: r.status,
  date: r.date,
  paymentMethod: r.payment_method,
  invoiceRef: r.invoice_ref ?? undefined,
});

const fromTransaction = (t: Transaction) => ({
  id: t.id,
  title: t.title,
  type: t.type,
  amount: t.amount,
  category: t.category,
  client_or_vendor: t.clientOrVendor,
  status: t.status,
  date: t.date,
  payment_method: t.paymentMethod,
  invoice_ref: t.invoiceRef ?? null,
});

const toNotification = (r: any): NotificationItem => ({
  id: r.id,
  title: r.title,
  message: r.message,
  time: r.time,
  createdAt: r.created_at ?? new Date().toISOString(),
  type: r.type,
  read: r.read,
});

const fromNotification = (n: NotificationItem) => ({
  id: n.id,
  title: n.title,
  message: n.message,
  time: n.time,
  created_at: n.createdAt,
  type: n.type,
  read: n.read,
});

/* ============================================================
 * Carga inicial de todas las tablas
 * ============================================================ */

export async function fetchAllData() {
  const [clients, projects, tasks, transactions, notifications] = await Promise.all([
    supabase.from('clients').select('*').order('created_at', { ascending: false }),
    supabase.from('projects').select('*'),
    supabase.from('tasks').select('*'),
    supabase.from('transactions').select('*').order('date', { ascending: false }),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }),
  ]);

  const firstError =
    clients.error || projects.error || tasks.error || transactions.error || notifications.error;
  if (firstError) throw firstError;

  return {
    clients: (clients.data ?? []).map(toClient),
    projects: (projects.data ?? []).map(toProject),
    tasks: (tasks.data ?? []).map(toTask),
    transactions: (transactions.data ?? []).map(toTransaction),
    notifications: (notifications.data ?? []).map(toNotification),
  };
}

/* ============================================================
 * Mutaciones (insert / update)
 * ============================================================ */

export const dataService = {
  insertClient: (c: Client) => supabase.from('clients').insert(fromClient(c)),
  updateClient: (c: Client) => supabase.from('clients').update(fromClient(c)).eq('id', c.id),

  insertProject: (p: Project) => supabase.from('projects').insert(fromProject(p)),
  updateProject: (p: Project) => supabase.from('projects').update(fromProject(p)).eq('id', p.id),
  deleteProject: (id: string) => supabase.from('projects').delete().eq('id', id),

  insertTask: (t: Task) => supabase.from('tasks').insert(fromTask(t)),
  updateTask: (t: Task) => supabase.from('tasks').update(fromTask(t)).eq('id', t.id),

  insertTransaction: (t: Transaction) => supabase.from('transactions').insert(fromTransaction(t)),
  updateTransaction: (t: Transaction) =>
    supabase.from('transactions').update(fromTransaction(t)).eq('id', t.id),

  insertNotification: (n: NotificationItem) =>
    supabase.from('notifications').insert(fromNotification(n)),
  updateNotification: (n: NotificationItem) =>
    supabase.from('notifications').update(fromNotification(n)).eq('id', n.id),
};

export { toClient, toProject, toTask, toTransaction, toNotification };