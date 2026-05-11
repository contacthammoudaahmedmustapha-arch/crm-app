const { getPool } = require('../_db.js');
const { requireAuth } = require('../_auth.js');

module.exports = async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  const pool = getPool();

  if (req.method === 'GET') {
    const { search } = req.query;
    let query, params;
    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      query = `SELECT * FROM contacts WHERE (nom LIKE ? OR prenom LIKE ? OR societe LIKE ? OR telephone LIKE ?) ORDER BY created_at DESC`;
      params = [s, s, s, s];
    } else {
      query = 'SELECT * FROM contacts ORDER BY created_at DESC';
      params = [];
    }
    try {
      const [rows] = await pool.query(query, params);
      return res.status(200).json(rows);
    } catch (err) { console.error(err); return res.status(500).json({ error: 'Erreur serveur' }); }
  }

  if (req.method === 'POST') {
    const { nom, prenom, telephone, email, societe, domaine, fonction, interet, avis_visite, potentiel } = req.body;
    try {
      const [result] = await pool.query(
        `INSERT INTO contacts (nom,prenom,telephone,email,societe,domaine,fonction,interet,avis_visite,potentiel,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW())`,
        [nom, prenom, telephone, email, societe, domaine, fonction, interet, avis_visite, potentiel, user.username]
      );
      return res.status(201).json({ id: result.insertId, message: 'Contact créé' });
    } catch (err) { console.error(err); return res.status(500).json({ error: 'Erreur serveur' }); }
  }

  return res.status(405).end();
};