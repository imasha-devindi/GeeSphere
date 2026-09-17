import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import api from '../services/api';

const PlayerContext = createContext();

export const getFullMediaUrl = (url) => {
  if (!url) return '/uploads/covers/default-cover.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `http://localhost:5000${cleanPath}`;
};

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'one', 'all'
  const [showLyrics, setShowLyrics] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(null);

  const audioRef = useRef(new Audio());
  const timerRef = useRef(null);

  // Initialize Audio Listeners
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => handleNextSong();
    const handleError = (e) => {
      console.error('Audio Element Error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [queueIndex, queue, repeatMode, isShuffle]);

  // Volume Changes
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Sleep Timer Handler
  useEffect(() => {
    if (sleepTimerMinutes && sleepTimerMinutes > 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        pauseSong();
        setSleepTimerMinutes(null);
        alert('⏰ GeeSphere Sleep Timer expired. Playback paused.');
      }, sleepTimerMinutes * 60 * 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sleepTimerMinutes]);

  const resetPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setCurrentSong(null);
    setQueue([]);
    setQueueIndex(-1);
    setCurrentTime(0);
    setDuration(0);
    setShowLyrics(false);
  };

  const playSong = (song, songQueue = []) => {
    if (!song) return;

    if (songQueue.length > 0) {
      setQueue(songQueue);
      const idx = songQueue.findIndex(s => s.id === song.id);
      setQueueIndex(idx !== -1 ? idx : 0);
    } else if (!queue.some(s => s.id === song.id)) {
      setQueue([song]);
      setQueueIndex(0);
    }

    setCurrentSong(song);
    const mediaUrl = getFullMediaUrl(song.mp3_path);
    audioRef.current.src = mediaUrl;
    audioRef.current.load();

    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        api.post(`/songs/${song.id}/play`, {}).catch(() => {});
      })
      .catch(err => {
        console.error('Playback failed:', err);
        setIsPlaying(false);
      });
  };

  const togglePlayPause = () => {
    if (!currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Play error:', err));
    }
  };

  const pauseSong = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const handleNextSong = () => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    if (queue.length === 0) return;

    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
    }

    if (nextIndex < queue.length) {
      setQueueIndex(nextIndex);
      playSong(queue[nextIndex], queue);
    } else if (repeatMode === 'all') {
      setQueueIndex(0);
      playSong(queue[0], queue);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevSong = () => {
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      setQueueIndex(prevIndex);
      playSong(queue[prevIndex], queue);
    }
  };

  const seekTo = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <PlayerContext.Provider value={{
      currentSong,
      isPlaying,
      queue,
      currentTime,
      duration,
      volume,
      isMuted,
      isShuffle,
      repeatMode,
      showLyrics,
      sleepTimerMinutes,
      playSong,
      togglePlayPause,
      pauseSong,
      resetPlayer,
      nextSong: handleNextSong,
      prevSong: handlePrevSong,
      seekTo,
      setVolume,
      setIsMuted: () => setIsMuted(!isMuted),
      toggleShuffle: () => setIsShuffle(!isShuffle),
      toggleRepeatMode: () => {
        const modes = ['off', 'one', 'all'];
        const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
        setRepeatMode(next);
      },
      setShowLyrics,
      setSleepTimerMinutes
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
