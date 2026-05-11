// src/components/UserModal.jsx
import { useState, useEffect } from 'react';

export default function UserModal({ user, onClose, onSave, mode }) {
  // mode: 'create' | 'edit' | 'reset_password'
  const [form, setForm] = useState({ nom: '', prenom: '', username: '', password: '', role: 'user' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && mode === 'edit') {
      setForm({ nom: user.nom, prenom: user.prenom, username: user.username, role: user.role, password: '' });
    } else {
      setForm({ nom: '', prenom: '', username: '', password: '', role: 'user' });
    }
  }, [user, mode]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (mode === 'reset_password') {
      if (!form.password) return alert('Entrez un nouveau mot de passe');
    } else {
      if (!form.nom || !form.prenom || !form.username) return alert('Champs obligatoires manquants');
      if (mode === 'create' && !form.password) return alert('Mot de passe obligatoire');
    }
    setSaving(true);
    await onSave(form, mode);
    setSaving(false);
  };

  const titles = { create: 'Nouvel utilisateur', edit: 'Modifier utilisateur', reset_password: 'Réinitialiser mot de passe' };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{titles[mode]}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {mode === 'reset_password' ? (
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Nouveau mot de passe" />
            </div>
          ) : (
            <div className="form-grid">
              <div className="form-group">
                <label>Nom *</label>
                <input value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="Nom" />
              </div>
              <div className="form-group">
                <label>Prénom *</label>
                <input value={form.prenom} onChange={e => set('prenom', e.target.value)} placeholder="Prénom" />
              </div>
              <div className="form-group">
                <label>Username *</label>
                <input value={form.username} onChange={e => set('username', e.target.value)} placeholder="username" />
              </div>
              <div className="form-group">
                <label>Rôle</label>
                <select value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="user">Utilisateur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {mode === 'create' && (
                <div className="form-group full">
                  <label>Mot de passe *</label>
                  <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Mot de passe" />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}
