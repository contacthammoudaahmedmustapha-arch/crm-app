// src/pages/Contacts.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ContactModal from '../components/ContactModal';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import * as XLSX from 'xlsx';

const BADGE = { faible: 'badge-faible', moyen: 'badge-moyen', fort: 'badge-fort' };
const PER_PAGE = 25;

export default function Contacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | contact object (new={}) | existing
  const [page, setPage] = useState(1);
  const { toasts, success, error } = useToast();
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchContacts = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/contacts', { params: q ? { search: q } : {} });
      setContacts(data);
      setFiltered(data);
      setPage(1);
    } catch { error('Erreur lors du chargement'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  // jQuery AJAX live search
  useEffect(() => {
    const $input = window.$(searchRef.current);
    $input.on('input.crm', function() {
      const q = $(this).val().trim();
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        // Client-side filter for instant feedback
        if (!q) {
          setFiltered(contacts);
          setPage(1);
          return;
        }
        const lower = q.toLowerCase();
        const result = contacts.filter(c =>
          (c.nom || '').toLowerCase().includes(lower) ||
          (c.prenom || '').toLowerCase().includes(lower) ||
          (c.societe || '').toLowerCase().includes(lower) ||
          (c.telephone || '').toLowerCase().includes(lower)
        );
        setFiltered(result);
        setPage(1);
      }, 200);
    });
    return () => { $input.off('input.crm'); clearTimeout(debounceRef.current); };
  }, [contacts]);

  const handleSave = async (form) => {
    try {
      if (form.id) {
        await api.put(`/contacts/${form.id}`, form);
        success('Contact modifié !');
      } else {
        await api.post('/contacts', form);
        success('Contact ajouté !');
      }
      setModal(null);
      fetchContacts(searchRef.current?.value || '');
    } catch (err) {
      error(err.response?.data?.error || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce contact ?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      success('Contact supprimé');
      fetchContacts();
    } catch (err) {
      error(err.response?.data?.error || 'Erreur');
    }
  };

  const exportXlsx = () => {
    const data = filtered.map(c => ({
      Nom: c.nom, Prénom: c.prenom, Téléphone: c.telephone, Email: c.email,
      Société: c.societe, Domaine: c.domaine, Fonction: c.fonction,
      Intérêt: c.interet, 'Avis de visite': c.avis_visite,
      Potentiel: c.potentiel, 'Créé par': c.created_by,
      'Date création': c.created_at ? new Date(c.created_at).toLocaleString('fr-FR') : ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
    XLSX.writeFile(wb, `contacts_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const canEdit = (c) => user?.role === 'admin' || c.created_by === user?.username;
  const canDelete = () => user?.role === 'admin';

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="main-content">
      <Toast toasts={toasts} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle">{filtered.length} contact{filtered.length !== 1 ? 's' : ''} {filtered.length !== contacts.length ? `(filtré sur ${contacts.length})` : 'au total'}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {user?.role === 'admin' && (
            <button className="btn btn-success" onClick={exportXlsx}>
              ↓ Export XLSX
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setModal({})}>
            + Ajouter contact
          </button>
        </div>
      </div>

      {/* Search toolbar */}
      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            ref={searchRef}
            className="search-input"
            placeholder="Rechercher par nom, prénom, société ou téléphone..."
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading"><div className="spinner" /> Chargement...</div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nom</th><th>Prénom</th><th>Téléphone</th><th>Email</th>
                  <th>Société</th><th>Domaine</th><th>Fonction</th>
                  <th>Potentiel</th><th>Créé par</th><th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr className="no-results"><td colSpan={11}>Aucun contact trouvé</td></tr>
                ) : paginated.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.nom}</strong></td>
                    <td>{c.prenom}</td>
                    <td>{c.telephone}</td>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</td>
                    <td>{c.societe}</td>
                    <td>{c.domaine}</td>
                    <td>{c.fonction}</td>
                    <td>
                      {c.potentiel && (
                        <span className={`badge ${BADGE[c.potentiel] || ''}`}>{c.potentiel}</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>{c.created_by}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : ''}
                    </td>
                    <td>
                      <div className="td-actions">
                        {canEdit(c) && (
                          <button className="btn btn-warning btn-sm" onClick={() => setModal(c)}>✎ Modifier</button>
                        )}
                        {canDelete() && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>✕</button>
                        )}
                        {!canEdit(c) && !canDelete() && (
                          <span style={{ color: 'var(--text2)', fontSize: 12 }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <span className="page-info">{(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} / {filtered.length}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={p} className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(p)}>{p}</button>
                );
              })}
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>›</button>
            </div>
          )}
        </>
      )}

      {modal !== null && (
        <ContactModal contact={modal} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  );
}
