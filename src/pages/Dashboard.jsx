// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#4f7cff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="main-content"><div className="loading"><div className="spinner" /> Chargement...</div></div>;
  if (!stats) return <div className="main-content"><p style={{ color: 'var(--text2)' }}>Erreur de chargement</p></div>;

  const potentielData = stats.perPotentiel.map(p => ({
    name: p.potentiel ? p.potentiel.charAt(0).toUpperCase() + p.potentiel.slice(1) : 'Non défini',
    value: p.count
  }));

  const timeData = stats.overTime.map(t => ({
    mois: t.month,
    contacts: t.count
  }));

  const userData = stats.perUser.map(u => ({
    name: `${u.prenom} ${u.nom}`,
    contacts: u.nb_contacts
  }));

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Vue d'ensemble de votre CRM</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Contacts totaux</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.perUser.length}</div>
          <div className="stat-label">Utilisateurs actifs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {stats.perPotentiel.find(p => p.potentiel === 'fort')?.count || 0}
          </div>
          <div className="stat-label">Potentiel fort</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {stats.overTime.length > 0 ? stats.overTime[stats.overTime.length - 1]?.count || 0 : 0}
          </div>
          <div className="stat-label">Ce mois-ci</div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="chart-grid">
        <div className="card">
          <div className="chart-title">Contacts par utilisateur</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={userData} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text2)', fontSize: 11 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: 'var(--text2)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
              <Bar dataKey="contacts" fill="url(#grad1)" radius={[4,4,0,0]} />
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f7cff" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="chart-title">Répartition par potentiel</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={potentielData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {potentielData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
              <Legend wrapperStyle={{ color: 'var(--text2)', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart row 2 — contacts over time */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="chart-title">Évolution des contacts (12 derniers mois)</div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={timeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="mois" tick={{ fill: 'var(--text2)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--text2)', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
            <Line type="monotone" dataKey="contacts" stroke="#4f7cff" strokeWidth={2.5} dot={{ fill: '#4f7cff', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top domains */}
      {stats.perDomain?.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="chart-title">Top domaines</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.perDomain.map(d => ({ name: d.domaine || '(vide)', count: d.count }))} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text2)', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text2)', fontSize: 11 }} width={75} />
              <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
              <Bar dataKey="count" fill="#10b981" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per user table */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="chart-title">Détail par commercial</div>
        <div className="table-wrap" style={{ marginTop: 12, border: 'none' }}>
          <table>
            <thead>
              <tr><th>Utilisateur</th><th>Username</th><th>Nb contacts</th><th>% du total</th></tr>
            </thead>
            <tbody>
              {stats.perUser.map((u, i) => (
                <tr key={i}>
                  <td><strong>{u.prenom} {u.nom}</strong></td>
                  <td style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{u.username}</td>
                  <td><strong>{u.nb_contacts}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ height: 6, width: 100, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${stats.total > 0 ? Math.round(u.nb_contacts / stats.total * 100) : 0}%`,
                          background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                          borderRadius: 3
                        }} />
                      </div>
                      <span style={{ color: 'var(--text2)', fontSize: 12 }}>
                        {stats.total > 0 ? Math.round(u.nb_contacts / stats.total * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
