const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware');

// --- FAVORITES ---
// GET /api/user/favorites
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const [favorites] = await db.query(
      `SELECT s.* FROM favorites f 
       JOIN songs_detailed s ON f.song_id = s.id 
       WHERE f.user_id = ? 
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, favorites });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites' });
  }
});

// POST /api/user/favorites/toggle
router.post('/favorites/toggle', authMiddleware, async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.user.id;

    const [existing] = await db.query(
      'SELECT id FROM favorites WHERE user_id = ? AND song_id = ?',
      [userId, songId]
    );

    if (existing.length > 0) {
      await db.query('DELETE FROM favorites WHERE user_id = ? AND song_id = ?', [userId, songId]);
      res.json({ success: true, isFavorite: false, message: 'Removed from favorites' });
    } else {
      await db.query('INSERT INTO favorites (user_id, song_id) VALUES (?, ?)', [userId, songId]);
      res.json({ success: true, isFavorite: true, message: 'Added to favorites' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating favorite' });
  }
});

// --- PLAYLISTS ---
// GET /api/user/playlists
router.get('/playlists', authMiddleware, async (req, res) => {
  try {
    const [playlists] = await db.query(
      `SELECT p.*, COUNT(ps.id) AS song_count 
       FROM playlists p 
       LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id 
       WHERE p.user_id = ? 
       GROUP BY p.id 
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, playlists });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playlists' });
  }
});

// POST /api/user/playlists - Create Playlist
router.post('/playlists', authMiddleware, async (req, res) => {
  try {
    const { name, description, is_public } = req.body;
    if (!name) return res.status(400).json({ message: 'Playlist name is required' });

    const [result] = await db.query(
      'INSERT INTO playlists (user_id, name, description, is_public) VALUES (?, ?, ?, ?)',
      [req.user.id, name, description || null, is_public ? 1 : 0]
    );

    res.status(201).json({
      success: true,
      message: 'Playlist created',
      playlistId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating playlist' });
  }
});

// GET /api/user/playlists/:id - Get Playlist Details & Songs
router.get('/playlists/:id', async (req, res) => {
  try {
    const [playlists] = await db.query('SELECT * FROM playlists WHERE id = ?', [req.params.id]);
    if (playlists.length === 0) return res.status(404).json({ message: 'Playlist not found' });

    const [songs] = await db.query(
      `SELECT s.*, ps.added_at 
       FROM playlist_songs ps 
       JOIN songs_detailed s ON ps.song_id = s.id 
       WHERE ps.playlist_id = ? 
       ORDER BY ps.position ASC`,
      [req.params.id]
    );

    res.json({ success: true, playlist: playlists[0], songs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playlist' });
  }
});

// POST /api/user/playlists/:id/songs - Add Song to Playlist
router.post('/playlists/:id/songs', authMiddleware, async (req, res) => {
  try {
    const { songId } = req.body;
    const playlistId = req.params.id;

    await db.query(
      'INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)',
      [playlistId, songId]
    );

    res.json({ success: true, message: 'Song added to playlist' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Song already in playlist' });
    }
    res.status(500).json({ message: 'Error adding song to playlist' });
  }
});

// DELETE /api/user/playlists/:id - Delete Playlist
router.delete('/playlists/:id', authMiddleware, async (req, res) => {
  try {
    const playlistId = req.params.id;
    const [rows] = await db.query('SELECT id FROM playlists WHERE id = ? AND user_id = ?', [playlistId, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Playlist not found' });

    await db.query('DELETE FROM playlist_songs WHERE playlist_id = ?', [playlistId]);
    await db.query('DELETE FROM playlists WHERE id = ?', [playlistId]);
    res.json({ success: true, message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting playlist' });
  }
});

// DELETE /api/user/playlists/:id/songs/:songId - Remove Song from Playlist
router.delete('/playlists/:id/songs/:songId', authMiddleware, async (req, res) => {
  try {
    const { id: playlistId, songId } = req.params;
    const [rows] = await db.query('SELECT id FROM playlists WHERE id = ? AND user_id = ?', [playlistId, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Playlist not found' });

    await db.query('DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?', [playlistId, songId]);
    res.json({ success: true, message: 'Song removed from playlist' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing song' });
  }
});

// --- COMMENTS & RATINGS ---
// GET /api/user/songs/:songId/comments
router.get('/songs/:songId/comments', async (req, res) => {
  try {
    const [comments] = await db.query(
      `SELECT c.*, u.full_name, u.profile_image 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.song_id = ? 
       ORDER BY c.created_at DESC`,
      [req.params.songId]
    );
    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// POST /api/user/songs/:songId/comments
router.post('/songs/:songId/comments', authMiddleware, async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ message: 'Comment text required' });

    await db.query(
      'INSERT INTO comments (user_id, song_id, comment) VALUES (?, ?, ?)',
      [req.user.id, req.params.songId, comment]
    );

    res.json({ success: true, message: 'Comment added' });
  } catch (error) {
    res.status(500).json({ message: 'Error posting comment' });
  }
});

// --- DOWNLOAD FILE ---
// GET /api/user/download/:songId
router.get('/download/:songId', authMiddleware, async (req, res) => {
  try {
    const [songs] = await db.query(
      'SELECT s.*, a.name as artist_name FROM songs s LEFT JOIN artists a ON s.artist_id = a.id WHERE s.id = ?',
      [req.params.songId]
    );

    if (songs.length === 0) return res.status(404).json({ message: 'Song not found' });
    const song = songs[0];

    if (!song.allow_download) {
      return res.status(403).json({ message: 'Download is disabled for this song' });
    }

    // Increment downloads count
    await db.query('UPDATE songs SET downloads = downloads + 1 WHERE id = ?', [song.id]);

    const relativePath = song.mp3_path.startsWith('/') ? song.mp3_path.slice(1) : song.mp3_path;
    const filePath = path.join(__dirname, '..', relativePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Audio file not found on server' });
    }

    const filename = `${song.artist_name || 'Artist'} - ${song.title}.mp3`;
    res.download(filePath, filename);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Download failed' });
  }
});

module.exports = router;
