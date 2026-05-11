// api/stats/index.js — Dashboard statistics (admin only)
import { getPool } from '../_db.js';
import { requireAdmin } from '../_auth.js';

export default async function handler(req, res) {
  const admin = requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== 'GET') return res.status(405).end();

  const pool = getPool();
  try {
    // Total contacts
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM contacts');

    // Contacts per user
    const [perUser] = await pool.query(`
      SELECT u.username, u.nom, u.prenom, COUNT(c.id) as nb_contacts
      FROM users u
      LEFT JOIN contacts c ON c.created_by = u.username
      GROUP BY u.id
      ORDER BY nb_contacts DESC
    `);

    // Contacts per potentiel
    const [perPotentiel] = await pool.query(`
      SELECT potentiel, COUNT(*) as count FROM contacts
      WHERE potentiel IS NOT NULL
      GROUP BY potentiel
    `);

    // Contacts over time (last 12 months)
    const [overTime] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
      FROM contacts
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);

    // Contacts per domain
    const [perDomain] = await pool.query(`
      SELECT domaine, COUNT(*) as count FROM contacts
      WHERE domaine IS NOT NULL AND domaine != ''
      GROUP BY domaine
      ORDER BY count DESC
      LIMIT 10
    `);

    return res.status(200).json({ total, perUser, perPotentiel, overTime, perDomain });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
