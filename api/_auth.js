// api/_auth.js — JWT verification helper
import jwt from 'jsonwebtoken';

export function verifyToken(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function requireAuth(req, res) {
  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ error: 'Non autorisé' });
    return null;
  }
  return user;
}

export function requireAdmin(req, res) {
  const user = requireAuth(req, res);
  if (!user) return null;
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Accès réservé à l\'admin' });
    return null;
  }
  return user;
}
