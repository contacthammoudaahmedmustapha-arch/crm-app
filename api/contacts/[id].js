const { getPool } = require('../_db.js');
const { requireAuth } = require('../_auth.js');

module.exports = async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  const pool = getPool();

  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM contacts WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Contact introuvable' });
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const [rows] = await pool.query('SELECT * FROM contacts WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Contact introuvable' });

      const contact = rows[0];
      if (user.role !== 'admin' && contact.created_by !== user.username)
        return res.status(403).json({ error: 'Vous ne pouvez modifier que vos propres contacts' });

      const { nom, prenom, telephone, email, societe, domaine, fonction, interet, avis_visite, potentiel } = req.body;
      await pool.query(
        `UPDATE contacts SET nom=?, prenom=?, telephone=?, email=?, societe=?, domaine=?, fonction=?, interet=?, avis_visite=?, potentiel=? WHERE id=?`,
        [nom, prenom, telephone, email, societe, domaine, fonction, interet, avis_visite, potentiel, id]
      );
      return res.status(200).json({ message: 'Contact mis à jour' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  if (req.method === 'DELETE') {
    if (user.role !== 'admin')
      return res.status(403).json({ error: "Seul l'admin peut supprimer des contacts" });
    try {
      await pool.query('DELETE FROM contacts WHERE id = ?', [id]);
      return res.status(200).json({ message: 'Contact supprimé' });
    } catch (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(405).end();
};