import { useState, useEffect, useCallback } from 'react';
import { Expense, ExpenseFilters, EXPENSE_CATEGORIES } from '../types';
import {
  getExpensesApi,
  createExpenseApi,
  updateExpenseApi,
  deleteExpenseApi,
} from '../api/expenses';
import ExpenseModal from '../components/ExpenseModal';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 1,
    limit: 10,
    sortBy: 'date',
    sortOrder: 'desc',
    category: '',
    startDate: '',
    endDate: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
      );
      const res = await getExpensesApi(params as ExpenseFilters);
      setExpenses(res.data.expenses);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleFilterChange = (key: keyof ExpenseFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSave = async (data: Omit<Expense, '_id' | 'createdAt'>) => {
    if (editingExpense) {
      await updateExpenseApi(editingExpense._id, data);
    } else {
      await createExpenseApi(data);
    }
    await load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteExpenseApi(deleteId);
      setDeleteId(null);
      await load();
    } finally {
      setDeleting(false);
    }
  };

  const openAdd = () => { setEditingExpense(null); setShowModal(true); };
  const openEdit = (e: Expense) => { setEditingExpense(e); setShowModal(true); };

  const toggleSort = (field: 'date' | 'amount') => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
  };

  const SortIcon = ({ field }: { field: 'date' | 'amount' }) => {
    if (filters.sortBy !== field) return <span style={{ color: 'var(--border)' }}>↕</span>;
    return <span>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Expenses</h1>
          <p>{total} total record{total !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openAdd}>
          + Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="form-group">
          <label>Category</label>
          <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>From</label>
          <input type="date" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} />
        </div>
        <div className="form-group">
          <label>To</label>
          <input type="date" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Per page</label>
          <select value={filters.limit} onChange={(e) => handleFilterChange('limit', Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setFilters({ page: 1, limit: 10, sortBy: 'date', sortOrder: 'desc', category: '', startDate: '', endDate: '' })}
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <div className="icon">💸</div>
            <h3>No expenses found</h3>
            <p>Try adjusting your filters or add a new expense.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleSort('date')}
                >
                  Date <SortIcon field="date" />
                </th>
                <th
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleSort('amount')}
                >
                  Amount <SortIcon field="amount" />
                </th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp._id}>
                  <td style={{ fontWeight: 500 }}>{exp.title}</td>
                  <td><span className={`badge badge-${exp.category}`}>{exp.category}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(exp.date)}</td>
                  <td className="amount-cell">{fmt(exp.amount)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {exp.notes || '—'}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(exp)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(exp._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">
              Page {filters.page} of {totalPages} · {total} records
            </span>
            <div className="pagination-controls">
              <button
                className="btn btn-outline btn-sm"
                disabled={(filters.page ?? 1) <= 1}
                onClick={() => handleFilterChange('page', (filters.page ?? 1) - 1)}
              >
                ← Prev
              </button>
              <button
                className="btn btn-outline btn-sm"
                disabled={(filters.page ?? 1) >= totalPages}
                onClick={() => handleFilterChange('page', (filters.page ?? 1) + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <ExpenseModal
          expense={editingExpense}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingExpense(null); }}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Delete Expense</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-muted)' }}>
                Are you sure you want to delete this expense? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ width: 'auto' }} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
