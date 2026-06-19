const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

let pool;

// MySQL butuh beberapa detik untuk siap saat container baru dibuat.
// Fungsi ini mencoba konek berkali-kali sebelum menyerah.
async function connectWithRetry(retries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      pool = mysql.createPool(dbConfig);
      await pool.query('SELECT 1');
      console.log('Berhasil terhubung ke MySQL');
      return;
    } catch (err) {
      console.log(`DB belum siap (percobaan ${attempt}/${retries}): ${err.message}`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('Gagal konek ke database setelah beberapa kali percobaan');
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/tasks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Judul tugas wajib diisi' });
    }
    const [result] = await pool.query('INSERT INTO tasks (title) VALUES (?)', [title.trim()]);
    res.status(201).json({ id: result.insertId, title: title.trim(), is_done: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_done } = req.body;
    await pool.query('UPDATE tasks SET is_done = ? WHERE id = ?', [is_done, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

connectWithRetry()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend berjalan di port ${PORT}`));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
