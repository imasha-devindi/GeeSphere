const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { adminMiddleware } = require('../middleware/authMiddleware');

// GET /api/admin/stats - Admin Dashboard High-level Statistics
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const [[{ totalSongs }]] = await db.query('SELECT COUNT(*) as totalSongs FROM songs');
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalPlays }]] = await db.query('SELECT COALESCE(SUM(plays), 0) as totalPlays FROM songs');
    const [[{ totalDownloads }]] = await db.query('SELECT COALESCE(SUM(downloads), 0) as totalDownloads FROM songs');

    const [topSongs] = await db.query('SELECT * FROM songs_detailed ORDER BY plays DESC LIMIT 5');
    const [recentUsers] = await db.query('SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5');

    res.json({
      success: true,
      stats: {
        totalSongs,
        totalUsers,
        totalPlays,
        totalDownloads
      },
      topSongs,
      recentUsers
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Error retrieving admin statistics' });
  }
});

// GET /api/admin/users - Get all registered users
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, full_name, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// DELETE /api/admin/songs/:id - Delete a song
router.delete('/songs/:id', adminMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM songs WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting song' });
  }
});

// PUT /api/admin/users/:id/toggle-status - Suspend or activate user
router.put('/users/:id/toggle-status', adminMiddleware, async (req, res) => {
  try {
    await db.query('UPDATE users SET is_active = NOT is_active WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status' });
  }
});

module.exports = router;
