// api/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'nexiliance-default-jwt-secret-key-12345';

// Sign‑up
router.post('/signup', async (req, res) => {
  const { name, company, product, category, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  try {
    const existing = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'Account already exists' });
    const id = 'usr_' + Date.now();
    const hash = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();
    await db.run(
      'INSERT INTO users (id, name, company, product, category, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, company, product, category, email, hash, createdAt]
    );
    const token = jwt.sign({ email, id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user: { id, name, company, product, category, email } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ error: 'No account found' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Incorrect password' });
    const token = jwt.sign({ email: user.email, id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const { id, name, company, product, category } = user;
    res.json({ success: true, token, user: { id, name, company, product, category, email } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Current user info (protected)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await db.get('SELECT id, name, company, product, category, email FROM users WHERE email = ?', [req.user.email]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

module.exports = router;
