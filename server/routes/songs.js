const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/songs - List songs with filters, search, and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const { genre, artist, search, sort } = req.query;

    let query = 'SELECT * FROM songs_detailed WHERE 1=1';
    let params = [];

    if (genre) {
      query += ' AND (genre_id = ? OR genre_name LIKE ?)';
      params.push(genre, `%${genre}%`);
    }

    if (artist) {
      query += ' AND (artist_id = ? OR artist_name LIKE ?)';
      params.push(artist, `%${artist}%`);
    }

    if (search) {
      query += ' AND (title LIKE ? OR title_sinhala LIKE ? OR artist_name LIKE ? OR artist_name_sinhala LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (sort === 'popular') {
      query += ' ORDER BY plays DESC';
    } else if (sort === 'oldest') {
      query += ' ORDER BY uploaded_at ASC';
    } else if (sort === 'az') {
      query += ' ORDER BY title ASC';
    } else {
      query += ' ORDER BY uploaded_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [songs] = await db.query(query, params);
    const [totalRows] = await db.query('SELECT COUNT(*) as count FROM songs');

    res.json({
      success: true,
      page,
      limit,
      total: totalRows[0].count,
      songs
    });
  } catch (error) {
    console.error('Fetch songs error:', error);
    res.status(500).json({ message: 'Error retrieving songs' });
  }
});

// GET /api/songs/trending - Weekly top / trending songs
router.get('/trending', async (req, res) => {
  try {
    const [songs] = await db.query(
      'SELECT * FROM songs_detailed ORDER BY plays DESC LIMIT 10'
    );
    res.json({ success: true, songs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trending songs' });
  }
});

// GET /api/songs/latest - Recently uploaded songs
router.get('/latest', async (req, res) => {
  try {
    const [songs] = await db.query(
      'SELECT * FROM songs_detailed ORDER BY uploaded_at DESC LIMIT 12'
    );
    res.json({ success: true, songs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching latest songs' });
  }
});

// GET /api/songs/genres - Get all genres
router.get('/genres', async (req, res) => {
  try {
    const [genres] = await db.query('SELECT * FROM genres ORDER BY name ASC');
    res.json({ success: true, genres });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching genres' });
  }
});

// GET /api/songs/artists - Get all artists
router.get('/artists', async (req, res) => {
  try {
    const [artists] = await db.query('SELECT * FROM artists ORDER BY name ASC');
    res.json({ success: true, artists });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching artists' });
  }
});

// GET /api/songs/:id - Single song details
router.get('/:id', async (req, res) => {
  try {
    const [songs] = await db.query('SELECT * FROM songs_detailed WHERE id = ?', [req.params.id]);
    if (songs.length === 0) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Get related songs in same genre
    const song = songs[0];
    const [related] = await db.query(
      'SELECT * FROM songs_detailed WHERE genre_id = ? AND id != ? LIMIT 6',
      [song.genre_id, song.id]
    );

    res.json({ success: true, song, related });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving song' });
  }
});

// POST /api/songs/:id/play - Track song play count
router.post('/:id/play', async (req, res) => {
  try {
    const songId = req.params.id;
    await db.query('UPDATE songs SET plays = plays + 1 WHERE id = ?', [songId]);

    // Track listening history if user token present
    if (req.body.userId) {
      await db.query(
        'INSERT INTO listening_history (user_id, song_id) VALUES (?, ?)',
        [req.body.userId, songId]
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error updating play count' });
  }
});

module.exports = router;
