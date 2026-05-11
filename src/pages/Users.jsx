// src/pages/Users.jsx
import { useState, useEffect } from 'react';
import api from '../utils/api';
import UserModal from '../components/UserModal';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { user, mode }
  const { toasts, success, error } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch { error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async (form, mode) => {
    try {
      if (mode === 'create') {
        await api.post('/users', form);
        success('Utilisateur créé !');
      } else if (mode === 'edit') {
        await api.put(`/users/${modal.user.id}`, { action: 'edit', ...form });
        success('Utilisateur modifié !');
      } else if (mode === 'reset_password') {
        await api.put(`/users/${modal.user.id}`, { action: 'reset_password', password: form.password });
        success('Mot de passe réinitialisé !');
      }
      setModal(null);
      fetchUsers();
    } catch (err) {
      error(err.response?.data?.error || 'Erreur');
    }
  };

  const handleToggle = async (u) => {
    try {
      const { data } = await api.put(`/users/${u.id}`, { action: 'toggle' });
      success(`Utilisateur ${data.active ? 'activé' : 'désactivé'}`);
      fetchUsers();
    } catch { error('Erreur'); }
  };

  return (
    <div className="main-content">
      <Toast toasts={toasts} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">{users.length} utilisateur{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ user: null, mode: 'create' })}>
          + Ajouter utilisateur
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Chargement...</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom</th><th>Prénom</th><th>Username</th><th>Rôle</th>
                <th>Statut</th><th>Nb contacts</th><th>Dernière connexion</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.nom}</strong></td>
                  <td>{u.prenom}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{u.username}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td>
                    <span className={`badge ${u.active ? 'badge-active' : 'badge-inactive'}`}>
                      {u.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--accent)' }}>{u.nb_contacts}</strong>
                    <span style={{ color: 'var(--text2)', fontSize: 11 }}> contacts</span>
                  </td>
                  <td style={{ color: 'var(--text2)', fontSize: 12 }}>
                    {u.last_login ? new Date(u.last_login).toLocaleString('fr-FR') : 'Jamais'}
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-warning btn-sm" onClick={() => setModal({ user: u, mode: 'edit' })}>
                        ✎
                      </button>
                      <button
                        className={`btn btn-sm ${u.active ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggle(u)}
                      >
                        {u.active ? '⏸ Désactiver' : '▶ Activer'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal({ user: u, mode: 'reset_password' })}>
                        🔑 Reset MDP
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <UserModal
          user={modal.user}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
