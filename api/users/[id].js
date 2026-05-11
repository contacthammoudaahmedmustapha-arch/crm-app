const bcrypt = require('bcryptjs');
const { getPool } = require('../_db.js');
const { requireAdmin } = require('../_auth.js');

module.exports = async function handler(req, res) {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  const { id } = req.query;
  const pool = getPool();

  if (req.method === 'PUT') {
    const { action, nom, prenom, username, role, password } = req.body;
    try {
      if (action === 'toggle') {
        const [rows] = await pool.query('SELECT active FROM users WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });
        const newActive = rows[0].active ? 0 : 1;
        await pool.query('UPDATE users SET active = ? WHERE id = ?', [newActive, id]);
        return res.status(200).json({ message: `Utilisateur ${newActive ? 'activé' : 'désactivé'}`, active: newActive });
      }
      if (action === 'reset_password') {
        if (!password) return res.status(400).json({ error: 'Mot de passe manquant' });
        const hashed = await bcrypt.hash(password, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);
        return res.status(200).json({ message: 'Mot de passe réinitialisé' });
      }
      await pool.query('UPDATE users SET nom=?,prenom=?,username=?,role=? WHERE id=?', [nom, prenom, username, role, id]);
      return res.status(200).json({ message: 'Utilisateur mis à jour' });
    } catch (err) { console.error(err); return res.status(500).json({ error: 'Erreur serveur' }); }
  }

  return res.status(405).end();
};