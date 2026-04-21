export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Health'
  | 'Entertainment'
  | 'Utilities'
  | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Shopping',
  'Health',
  'Entertainment',
  'Utilities',
  'Other',
];

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedExpenses {
  expenses: Expense[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  category?: ExpenseCategory | '';
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryStat {
  category: string;
  total: number;
  count: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  total: number;
}

export interface Summary {
  totalThisMonth: number;
  totalThisYear: number;
  highestCategory: { name: string; total: number } | null;
  byCategory: CategoryStat[];
  monthlyTrend: MonthlyTrend[];
}
