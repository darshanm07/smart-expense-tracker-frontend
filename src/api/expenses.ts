import api from './axios';
import {
  AuthResponse,
  PaginatedExpenses,
  Expense,
  ExpenseFilters,
  Summary,
} from '../types';

// Auth
export const registerApi = (name: string, email: string, password: string) =>
  api.post<AuthResponse>('/auth/register', { name, email, password });

export const loginApi = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password });

// Expenses
export const getExpensesApi = (filters: ExpenseFilters) =>
  api.get<PaginatedExpenses>('/expenses', { params: filters });

export const createExpenseApi = (data: Omit<Expense, '_id' | 'createdAt'>) =>
  api.post<Expense>('/expenses', data);

export const updateExpenseApi = (id: string, data: Omit<Expense, '_id' | 'createdAt'>) =>
  api.put<Expense>(`/expenses/${id}`, data);

export const deleteExpenseApi = (id: string) =>
  api.delete(`/expenses/${id}`);

export const getSummaryApi = (startDate?: string, endDate?: string) =>
  api.get<Summary>('/expenses/summary', { params: { startDate, endDate } });
