# 🎵 GeeSphere — Sri Lanka's Free Music Streaming Platform

A full-stack music streaming web application inspired by Spotify, built for Sri Lankan music lovers. Stream pop, baila, folk, unplugged, and movie soundtrack collections — with lyrics, playlists, favorites, and YouTube audio import.

![GeeSphere](https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80)

---

## ✨ Features

- 🎵 **Stream Music** — High-quality audio playback with queue management
- 🔍 **Search & Browse** — Filter by genre, sort by popularity or date
- ❤️ **Favorites** — Like and save your favorite tracks
- 📋 **Playlists** — Create, manage, and play custom playlists
- 📺 **YouTube Import** — Admin can import songs directly from YouTube URLs
- 📁 **Manual Upload** — Upload MP3 files up to 200MB
- 📖 **Lyrics Viewer** — View song lyrics in a beautiful modal
- 😴 **Sleep Timer** — Auto-stop playback after a set time
- ⬇️ **MP3 Download** — Download tracks for offline use
- 🔀 **Shuffle & Repeat** — Full playback controls
- 🛡️ **Admin Panel** — Manage songs, artists, uploads

---

## 🛠️ Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons |
| Backend  | Node.js, Express.js |
| Database | MySQL (via XAMPP) |
| Auth     | JWT (jsonwebtoken), bcryptjs |
| Audio    | yt-dlp (YouTube extraction), HTML5 Audio API |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [XAMPP](https://www.apachefriends.org/) (MySQL)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp/releases/latest) *(for YouTube import)*

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/GeeSphere.git
cd GeeSphere
```

### 2. Set up the database

1. Start **XAMPP MySQL**
2. Open phpMyAdmin or MySQL CLI
3. Create a database named `geesphere`
4. Import the schema:

```bash
mysql -u root geesphere < database/schema.sql
```

### 3. Configure the server environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and fill in your values:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          # your MySQL password
DB_NAME=geesphere
JWT_SECRET=change_this_to_a_long_random_secret
```

### 4. Download yt-dlp *(for YouTube import)*

Download **yt-dlp.exe** from [GitHub Releases](https://github.com/yt-dlp/yt-dlp/releases/latest) and place it in:

```
server/bin/yt-dlp.exe
```

### 5. Install dependencies

```bash
# From project root — installs everything
npm install
npm install --prefix server
npm install --prefix client
```

### 6. Start the application

```bash
# Start both backend + frontend together
npm start
```

Or separately:

```bash
# Backend (port 5000)
cd server && node index.js

# Frontend (port 5173)
cd client && npx vite
```

---

## 🔑 Default Admin Credentials

```
Username : admin
Password : admin123
```

> ⚠️ Change the admin password after first login in production!

---

## 📁 Project Structure

```
GeeSphere/
├── client/                 # React frontend (Vite + Tailwind)
│   └── src/
│       ├── components/     # Sidebar, AudioPlayer, SongCard, etc.
│       ├── context/        # Auth, Player, Theme contexts
│       └── pages/          # Home, Browse, Search, Playlist, etc.
│
├── server/                 # Express.js backend
│   ├── bin/                # yt-dlp binary (not committed)
│   ├── config/             # Database connection
│   ├── middleware/         # JWT auth middleware
│   ├── routes/             # API routes
│   ├── uploads/            # User uploads (not committed)
│   └── index.js            # Server entry point
│
├── database/
│   └── schema.sql          # Full MySQL schema + seed data
│
└── package.json            # Root scripts (concurrently)
```

---

## 🔒 Security Notes

- `.env` is **never committed** — use `.env.example` as template
- Uploaded files (`uploads/`) are **excluded from git**
- `yt-dlp.exe` binary is **excluded from git** (too large, download separately)
- JWT tokens expire after **30 days**

---

## 📜 License

MIT License — feel free to use, modify, and distribute.

---

> Built with ❤️ for Sri Lankan music lovers 🇱🇰
