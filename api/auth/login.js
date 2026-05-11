// api/auth/login.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Champs manquants' });

  const pool = getPool();
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND active = 1',
      [username]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: 'Identifiants invalides' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: 'Identifiants invalides' });

    // Update last_login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, nom: user.nom, prenom: user.prenom },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      user: { id: user.id, username: user.username, role: user.role, nom: user.nom, prenom: user.prenom }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
