const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

/*
TODO ITEM DATA MODEL & ENDPOINT PLAN (renamed from Task to Item)

Table: items
  - id INTEGER PRIMARY KEY AUTOINCREMENT
  - title TEXT NOT NULL
  - description TEXT
  - due_date DATE
  - priority TEXT DEFAULT 'P3'
  - completed BOOLEAN DEFAULT 0
  - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Endpoints:
  - GET    /api/items           (list, filter, search, sort)
  - POST   /api/items           (create)
  - GET    /api/items/:id       (detail)
  - PUT    /api/items/:id       (replace/edit)
  - PATCH  /api/items/:id       (mark complete/incomplete)
  - DELETE /api/items/:id       (delete)

Features:
  - Filtering by completion
  - Search by keyword (title/description)
  - Sort by due date, then creation date
*/

// Create items table (fresh in-memory build each startup)
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    priority TEXT DEFAULT 'P3',
    completed BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);


console.log('In-memory database initialized for TODO items');

// --- ITEM API ENDPOINTS ---

// Helper: build dynamic WHERE clause for filtering/search
function buildItemQuery({ completed, search }) {
  let where = [];
  let params = {};
  if (completed === 'true' || completed === 'false') {
    where.push('completed = @completed');
    params.completed = completed === 'true' ? 1 : 0;
  }
  if (search) {
    where.push('(title LIKE @kw OR description LIKE @kw)');
    params.kw = `%${search}%`;
  }
  return {
    where: where.length ? 'WHERE ' + where.join(' AND ') : '',
    params,
  };
}

// GET /api/items (list, filter, search, sort)
app.get('/api/items', (req, res) => {
  try {
    const { completed, search } = req.query;
    const { where, params } = buildItemQuery({ completed, search });
    const sql = `SELECT * FROM items ${where} ORDER BY due_date IS NULL, due_date ASC, created_at ASC`;
    const items = db.prepare(sql).all(params);
    const normalized = items.map(i => ({ ...i, priority: ['P1','P2','P3'].includes(i.priority) ? i.priority : 'P3' }));
    res.json(normalized);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// POST /api/items (create)
app.post('/api/items', (req, res) => {
  try {
    const { title, description, due_date, priority } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Item title is required' });
    }
    const safePriority = ['P1','P2','P3'].includes(priority) ? priority : 'P3';
    const stmt = db.prepare('INSERT INTO items (title, description, due_date, priority) VALUES (?, ?, ?, ?)');
    const result = stmt.run(title, description || '', due_date || null, safePriority);
    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// GET /api/items/:id (detail)
app.get('/api/items/:id', (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// PUT /api/items/:id (edit)
app.put('/api/items/:id', (req, res) => {
  try {
    const { title, description, due_date, priority } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Item title is required' });
    }
    const safePriority = ['P1','P2','P3'].includes(priority) ? priority : 'P3';
    const stmt = db.prepare('UPDATE items SET title = ?, description = ?, due_date = ?, priority = ? WHERE id = ?');
    const result = stmt.run(title, description || '', due_date || null, safePriority, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Item not found' });
    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// PATCH /api/items/:id (mark complete/incomplete)
app.patch('/api/items/:id', (req, res) => {
  try {
    const { completed } = req.body;
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be boolean' });
    }
    const stmt = db.prepare('UPDATE items SET completed = ? WHERE id = ?');
    const result = stmt.run(completed ? 1 : 0, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Item not found' });
    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item completion:', error);
    res.status(500).json({ error: 'Failed to update item completion' });
  }
});

// DELETE /api/items/:id (delete)
app.delete('/api/items/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM items WHERE id = ?');
    const result = stmt.run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Item not found' });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = { app, db };
