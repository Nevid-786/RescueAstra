import React, { useState } from 'react';
import { ShieldAlert, UserPlus, Key, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { createResponderAccount } from '../services/api';

export const AdminPanel: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'RESCUE_TEAM' | 'ADMIN'>('RESCUE_TEAM');

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCreateResponder = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    if (!name || !email || !password) {
      setErrorMessage('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createResponderAccount({ name, email, password, role });
      if (res.success) {
        setStatusMessage(`Successfully provisioned ${role} account for ${name} (${email}).`);
        setName('');
        setEmail('');
        setPassword('');
      } else {
        setErrorMessage(res.message || 'Failed to create responder account.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error communicating with administration server.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden p-6 space-y-6 font-sans text-slate-800">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded text-indigo-700">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-mono font-bold tracking-widest text-slate-900 uppercase">
                ADMINISTRATIVE PROVISIONING & USER MANAGEMENT
              </h1>
              <span className="bg-rose-100 border border-rose-300 text-rose-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                ADMIN PRIVILEGES REQUIRED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Create official Rescue Team Commander credentials & dispatch operator accounts. Public registration is restricted to Citizen accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Main Admin Content: Provisioning Form */}
      <div className="max-w-xl mx-auto w-full bg-white border border-slate-200 rounded-lg p-6 space-y-5 font-mono shadow-sm">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            <span>PROVISION NEW RESPONDER ACCOUNT</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-1 font-sans">
            Issued credentials gain full access to Command GIS Telemetry & Rescue Survivor Management.
          </p>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded flex items-center space-x-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded flex items-center space-x-2 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleCreateResponder} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] text-slate-600 mb-1 uppercase font-bold">
              RESPONDER FULL NAME *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Commander Vikram"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-600 mb-1 uppercase font-bold">
              OFFICIAL EMAIL ADDRESS *
            </label>
            <input
              type="email"
              required
              placeholder="commander@skypetrol.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-600 mb-1 uppercase font-bold">
              INITIAL TEMPORARY PASSWORD (MIN 6 CHARS) *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-600 mb-1 uppercase font-bold">
              ASSIGNED SYSTEM ROLE *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 font-medium cursor-pointer"
            >
              <option value="RESCUE_TEAM">RESCUE TEAM / COMMANDER</option>
              <option value="ADMIN">SYSTEM ADMINISTRATOR</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wider uppercase rounded shadow transition disabled:opacity-50"
            >
              {isSubmitting ? 'PROVISIONING ACCOUNT...' : 'PROVISION RESPONDER CREDENTIALS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
