const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ai_research_scientist_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());

// PostgreSQL Pool Connection
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'Bhavani@2007',
  database: process.env.PGDATABASE || 'ai_research_scientist',
});

// Ensure users table exists on startup
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ PostgreSQL users table verified.');
  } catch (err) {
    console.error('❌ Failed to initialize database table:', err.message);
  }
}
initDb();

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session token.' });
    }
    req.user = decoded;
    next();
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AI Research Scientist Auth Service' });
});

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if email already registered
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [trimmedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password with salt
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user into PostgreSQL
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, full_name, email, created_at`,
      [full_name.trim(), trimmedEmail, password_hash]
    );

    const newUser = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, full_name: newUser.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        created_at: newUser.created_at,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error while creating account.' });
  }
});

// POST /api/auth/signin
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Query user
    const result = await pool.query(
      'SELECT id, full_name, email, password_hash, created_at FROM users WHERE email = $1',
      [trimmedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Signed in successfully.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Signin error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Auth check error:', err);
    return res.status(500).json({ error: 'Internal server error checking session.' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  return res.json({ message: 'Logged out successfully.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Authentication API listening on port ${PORT}`);
});
