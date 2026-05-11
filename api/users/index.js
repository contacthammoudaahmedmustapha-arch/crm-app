const bcrypt = require('bcryptjs');
const { getPool } = require('../_db.js');
const { requireAdmin } = require('../_auth.js');

module.exports = async function handler(req, res) {
  const pool = getPool();

  if (req.method === 'GET') {
    const user = requireAdmin(req, res);
    if (!user) return;
    try {
      const [rows] = await pool.query(`
        SELECT u.id, u.nom, u.prenom, u.username, u.role, u.active, u.last_login,
               COUNT(c.id) AS nb_contacts
        FROM users u LEFT JOIN contacts c ON c.created_by = u.username
        GROUP BY u.id ORDER BY u.id ASC
      `);
      return res.status(200).json(rows);
    } catch (err) { return res.status(500).json({ error: 'Erreur serveur' }); }
  }

  if (req.method === 'POST') {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const { nom, prenom, username, password, role } = req.body;
    if (!nom || !prenom || !username || !password)
      return res.status(400).json({ error: 'Champs manquants' });
    try {
      const hashed = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO users (nom,prenom,username,password,role,active) VALUES (?,?,?,?,?,1)',
        [nom, prenom, username, hashed, role || 'user']
      );
      return res.status(201).json({ message: 'Utilisateur créé' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username déjà utilisé' });
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(405).end();
};