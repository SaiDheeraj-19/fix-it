
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from './Logo';

interface AdminLoginProps {
  onLogin: (password: string) => boolean;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(password)) {
      navigate('/admin');
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-[32px] bento-shadow overflow-hidden border border-white/10 p-8 sm:p-12 relative">
        <Link to="/" className="absolute top-6 left-6 size-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </Link>

        <div className="text-center mb-10 pt-4">
          <Link to="/" className="inline-block group">
            <div className="size-20 bg-primary/5 flex items-center justify-center text-primary mx-auto mb-2 overflow-hidden rounded-2xl border border-primary/10 p-4 transition-transform group-hover:scale-105">
              <Logo />
            </div>
            <h1 className="text-2xl font-black mb-2 transition-opacity group-hover:opacity-80">
              <span className="text-white">Fix</span>{" "}
              <span className="text-primary">It</span>
            </h1>
          </Link>
          <p className="text-sm text-white/40 font-medium">Owner Portal • Kurnool</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1 opacity-50">Access Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20">lock</span>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="••••••••"
                className={`
                  w-full h-14 pl-12 pr-4 rounded-2xl border border-white/10 bg-black focus:ring-2 focus:ring-primary text-sm font-bold text-white transition-all
                  ${error ? 'ring-2 ring-red-500 border-red-500' : ''}
                `}
              />
            </div>
            {error && <p className="text-[10px] text-red-500 font-bold mt-2 ml-1">Incorrect access key. Please try again.</p>}
          </div>

          <button 
            type="submit"
            className="w-full h-14 bg-primary text-black font-black text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] hover:bg-red-600"
          >
            Authenticate
            <span className="material-symbols-outlined font-bold">key</span>
          </button>
        </form>

        <p className="text-center text-[10px] text-white/20 mt-12 uppercase font-bold tracking-widest leading-relaxed">
          Authorized personnel only.<br/>Fix It Kurnool Admin Panel
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
