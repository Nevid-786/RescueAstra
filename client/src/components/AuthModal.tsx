import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, ShieldCheck } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isRegister && !name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegister) {
        const res = await registerUser({ name, email, password });
        if (res.success && res.data) {
          login(res.data.token, res.data.user);
          onClose();
        } else {
          setErrorMessage(res.message || 'Registration failed.');
        }
      } else {
        const res = await loginUser({ email, password });
        if (res.success && res.data) {
          login(res.data.token, res.data.user);
          onClose();
        } else {
          setErrorMessage(res.message || 'Invalid email or password.');
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Authentication request failed.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header Tabs */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex space-x-2 font-mono text-xs">
            <button
              onClick={() => {
                setIsRegister(false);
                setErrorMessage(null);
              }}
              className={`px-3.5 py-1.5 rounded font-bold transition ${
                !isRegister
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => {
                setIsRegister(true);
                setErrorMessage(null);
              }}
              className={`px-3.5 py-1.5 rounded font-bold transition ${
                isRegister
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              CITIZEN REGISTER
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 font-mono text-xs text-slate-800">
          <div className="text-center pb-1">
            <h2 className="text-sm font-bold tracking-widest text-slate-900 uppercase">
              {isRegister ? 'REGISTER PUBLIC CITIZEN ACCOUNT' : 'COMMAND CENTER USER LOGIN'}
            </h2>
            <p className="text-[11px] text-slate-500 mt-1 font-sans">
              {isRegister
                ? 'Public self-registration creates a Citizen account to report missing persons'
                : 'Rescue Team Accounts (Commander) & Admins must log in with issued credentials'}
            </p>
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-300 p-2.5 rounded text-rose-800 text-[11px] flex items-center space-x-2 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Full Name (Register Only) */}
          {isRegister && (
            <div>
              <label className="block text-[10px] text-slate-600 mb-1 uppercase font-bold flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>FULL NAME *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ananya Roy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-[10px] text-slate-600 mb-1 uppercase font-bold flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>EMAIL ADDRESS *</span>
            </label>
            <input
              type="email"
              required
              placeholder="user@skypetrol.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] text-slate-600 mb-1 uppercase font-bold flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>PASSWORD (MIN 6 CHARS) *</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 text-white font-bold tracking-wider uppercase rounded shadow transition disabled:opacity-50 ${
              isRegister ? 'bg-purple-700 hover:bg-purple-800' : 'bg-slate-800 hover:bg-slate-900'
            }`}
          >
            {isLoading ? 'AUTHENTICATING...' : isRegister ? 'CREATE CITIZEN ACCOUNT' : 'SIGN IN TO COMMAND CENTER'}
          </button>

          {/* Credentials Notice */}
          <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 space-y-1 font-sans">
            <div className="flex items-center space-x-1 text-slate-800 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SYSTEM CREDENTIALS NOTICE</span>
            </div>
            <p>
              Rescue Team Accounts (Commander) & Admin credentials are issued by System Administration. Public self-registration assigns the Citizen role.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
