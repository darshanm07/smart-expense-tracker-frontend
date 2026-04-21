import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getSummaryApi } from '../api/expenses';
import { Summary } from '../types';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Shopping: '#ec4899',
  Health: '#22c55e',
  Entertainment: '#8b5cf6',
  Utilities: '#06b6d4',
  Other: '#6b7280',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSummaryApi();
      setSummary(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!summary) return null;

  const trendData = summary.monthlyTrend.map((m) => ({
    name: MONTH_NAMES[m.month - 1],
    total: m.total,
  }));

  const pieData = summary.byCategory.map((c) => ({
    name: c.category,
    value: c.total,
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Your expense overview</p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card primary">
          <div className="label">This Month</div>
          <div className="value">{fmt(summary.totalThisMonth)}</div>
          <div className="sub">Total expenses</div>
        </div>
        <div className="summary-card success">
          <div className="label">This Year</div>
          <div className="value">{fmt(summary.totalThisYear)}</div>
          <div className="sub">Year to date</div>
        </div>
        <div className="summary-card warning">
          <div className="label">Top Category</div>
          <div className="value" style={{ fontSize: 20 }}>
            {summary.highestCategory?.name || '—'}
          </div>
          <div className="sub">
            {summary.highestCategory ? fmt(summary.highestCategory.total) : 'No data yet'}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Spending (Last 6 Months)</h3>
          {trendData.length === 0 ? (
            <div className="empty-state"><p>No data yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h3>Spending by Category</h3>
          {pieData.length === 0 ? (
            <div className="empty-state"><p>No data yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {summary.byCategory.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600 }}>Category Breakdown</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {summary.byCategory.map((c) => (
                <tr key={c.category}>
                  <td><span className={`badge badge-${c.category}`}>{c.category}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.count} expenses</td>
                  <td className="amount-cell">{fmt(c.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
