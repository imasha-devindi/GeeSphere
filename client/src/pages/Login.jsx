import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Disc3, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-4 space-y-8">
      {/* Logo */}
      <div className="text-center space-y-3">
        <div
          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-2xl"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
        >
          <Disc3 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">GeeSphere</h1>
          <p className="text-sm text-neutral-500 mt-1">Your Musical Universe</p>
        </div>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-7 space-y-5 shadow-2xl"
        style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h2 className="text-xl font-bold text-white text-center">Sign in to continue</h2>

        {error && (
          <div
            className="p-3 rounded-xl text-xs text-center font-medium"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 rounded-xl pl-10 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition-all focus:ring-2 focus:ring-violet-500"
                style={{ background: '#282828', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 rounded-xl pl-10 pr-10 text-sm text-white placeholder-neutral-600 outline-none transition-all focus:ring-2 focus:ring-violet-500"
                style={{ background: '#282828', border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 shadow-lg mt-2"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
          >
            {loading ? 'Signing In…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="pt-3 block">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-violet-400 hover:text-violet-300 transition-colors">
              Sign up for free
            </Link>
          </span>
        </p>
      </div>
    </div>
  );
};
