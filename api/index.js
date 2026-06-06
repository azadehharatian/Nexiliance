const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'nexiliance-default-jwt-secret-key-12345';

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Auth API endpoints
app.post('/api/auth/signup', async (req, res) => {
  const { name, company, product, category, email, password } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const existing = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const id = 'usr_' + Date.now();
    const hash = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();

    await db.run(
      'INSERT INTO users (id, name, company, product, category, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, company, product, category, email, hash, createdAt]
    );

    const userData = { id, name, company, product, category, email };
    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, user: userData, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    const userData = {
      id: user.id,
      name: user.name,
      company: user.company,
      product: user.product,
      category: user.category,
      email: user.email
    };
    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, user: userData, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.get('SELECT id, name, company, product, category, email FROM users WHERE email = ?', [req.user.email]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assessment API endpoints
app.get('/api/assessment', authenticateToken, async (req, res) => {
  try {
    const rows = await db.query('SELECT question_id, response_value FROM assessments WHERE user_email = ?', [req.user.email]);
    const answers = {};
    rows.forEach(r => {
      answers[r.question_id] = r.response_value;
    });
    res.json(answers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assessment', authenticateToken, async (req, res) => {
  const { answers } = req.body;
  if (!answers) return res.status(400).json({ error: 'Answers body is required' });

  try {
    const email = req.user.email;
    await db.run('DELETE FROM assessments WHERE user_email = ?', [email]);
    for (const [qId, val] of Object.entries(answers)) {
      await db.run(
        'INSERT INTO assessments (user_email, question_id, response_value) VALUES (?, ?, ?)',
        [email, qId, val]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vulnerabilities API endpoints
app.get('/api/vulns', authenticateToken, async (req, res) => {
  try {
    const vulns = await db.query('SELECT * FROM vulnerabilities WHERE user_email = ?', [req.user.email]);
    res.json(vulns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vulns', authenticateToken, async (req, res) => {
  const { id, cve, component, severity, status, reported, due } = req.body;
  if (!cve || !component || !severity || !status) {
    return res.status(400).json({ error: 'Missing required vulnerability details' });
  }

  try {
    const vId = id || 'v_' + Date.now();
    await db.run(
      'INSERT INTO vulnerabilities (id, user_email, cve, component, severity, status, reported, due) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [vId, req.user.email, cve, component, severity, status, reported, due]
    );
    res.status(201).json({ success: true, id: vId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/vulns/:id', authenticateToken, async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    const result = await db.run(
      'UPDATE vulnerabilities SET status = ? WHERE id = ? AND user_email = ?',
      [status, req.params.id, req.user.email]
    );
    res.json({ success: true, updated: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vulns/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.run(
      'DELETE FROM vulnerabilities WHERE id = ? AND user_email = ?',
      [req.params.id, req.user.email]
    );
    res.json({ success: true, deleted: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend static files locally
app.use(express.static(path.join(__dirname, '../')));

// Export app for serverless deployment
module.exports = app;

// Run standalone server if started directly
if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  db.initDb().then(() => {
    app.listen(PORT, () => {
      console.log(`Nexiliance backend running locally at http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('Database initialization failed:', err);
  });
} else {
  // Ensure DB initialized in serverless functions
  db.initDb().catch(err => {
    console.error('Database initialization failed in serverless startup:', err);
  });
}
