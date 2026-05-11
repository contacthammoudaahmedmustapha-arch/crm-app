// src/components/ContactModal.jsx
import { useState, useEffect } from 'react';

const empty = { nom: '', prenom: '', telephone: '', email: '', societe: '', domaine: '', fonction: '', interet: '', avis_visite: '', potentiel: '' };

export default function ContactModal({ contact, onClose, onSave }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(contact ? { ...empty, ...contact } : empty);
  }, [contact]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom) return alert('Nom et prénom obligatoires');
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{contact?.id ? 'Modifier le contact' : 'Nouveau contact'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
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
              <label>Téléphone</label>
              <input value={form.telephone} onChange={e => set('telephone', e.target.value)} placeholder="+216 XX XXX XXX" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@exemple.com" type="email" />
            </div>
            <div className="form-group">
              <label>Société</label>
              <input value={form.societe} onChange={e => set('societe', e.target.value)} placeholder="Nom de la société" />
            </div>
            <div className="form-group">
              <label>Domaine</label>
              <input value={form.domaine} onChange={e => set('domaine', e.target.value)} placeholder="Ex: Informatique" />
            </div>
            <div className="form-group">
              <label>Fonction</label>
              <input value={form.fonction} onChange={e => set('fonction', e.target.value)} placeholder="Ex: Directeur" />
            </div>
            <div className="form-group">
              <label>Intérêt</label>
              <input value={form.interet} onChange={e => set('interet', e.target.value)} placeholder="Intérêt principal" />
            </div>
            <div className="form-group">
              <label>Potentiel</label>
              <select value={form.potentiel} onChange={e => set('potentiel', e.target.value)}>
                <option value="">-- Choisir --</option>
                <option value="faible">Faible</option>
                <option value="moyen">Moyen</option>
                <option value="fort">Fort</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Avis de visite</label>
              <textarea value={form.avis_visite} onChange={e => set('avis_visite', e.target.value)} placeholder="Notes sur la visite..." rows={3} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Enregistrement...' : (contact?.id ? 'Modifier' : 'Ajouter')}
          </button>
        </div>
      </div>
    </div>
  );
}
