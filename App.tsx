import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Shield, Lock, Unlock, Plus, Search, Copy, Eye, EyeOff,
  Trash2, Edit3, Key, RefreshCw, Settings, LogOut, Clock,
  Globe, User, FileText, ChevronDown, ChevronRight, X,
  AlertTriangle, Check, Zap, Timer, ShieldCheck, Database
} from 'lucide-react';
import {
  isVaultInitialized, initializeVault, unlockVault, saveVault,
  deleteVault, changeMasterPassword, generatePassword, calculatePasswordStrength,
  generateId, type PasswordEntry, type VaultData, type GeneratorOptions
} from './crypto';
import HowItWorks from './HowItWorks';

// ---- Auto-lock timer settings ----
const AUTO_LOCK_OPTIONS = [
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '15 minutes', value: 900 },
  { label: '30 minutes', value: 1800 },
  { label: 'Never', value: 0 },
];

const CATEGORIES = ['Login', 'Finance', 'Social', 'Email', 'Work', 'Other'];

// ========== SETUP SCREEN ==========
function SetupScreen({ onSetup }: { onSetup: (key: CryptoKey) => void }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      const key = await initializeVault(password);
      onSetup(key);
    } catch {
      setError('Failed to create vault');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/25 mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">VaultGuard</h1>
          <p className="text-slate-400">Create your encrypted password vault</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 space-y-5">
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-sm text-slate-300">
                <p className="font-medium text-emerald-400 mb-1">AES-256 Encryption</p>
                <p className="text-slate-400 text-xs">Your vault is encrypted using AES-256-GCM with PBKDF2 key derivation (600,000 iterations). All data stays local.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Master Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 pr-12"
                placeholder="Enter a strong master password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: `${strength.score * 100}%` }} />
                  </div>
                  <span className={`text-xs font-medium ${strength.score < 0.5 ? 'text-red-400' : strength.score < 0.75 ? 'text-yellow-400' : 'text-emerald-400'}`}>{strength.label}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
              placeholder="Confirm your master password"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Deriving encryption key...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Create Vault
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ========== LOGIN SCREEN ==========
function LoginScreen({ onUnlock, onReset }: { onUnlock: (key: CryptoKey, data: VaultData) => void; onReset: () => void }) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { key, data } = await unlockVault(password);
      onUnlock(key, data);
    } catch {
      setError('Invalid master password');
    }
    setLoading(false);
  };

  const handleReset = () => {
    deleteVault();
    onReset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/25 mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">VaultGuard</h1>
          <p className="text-slate-400">Enter your master password to unlock</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Master Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 pr-12"
                placeholder="Enter your master password"
                autoFocus
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Decrypting vault...
              </>
            ) : (
              <>
                <Unlock className="w-5 h-5" />
                Unlock Vault
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button type="button" onClick={() => setShowReset(true)} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Forgot password? Reset vault
            </button>
          </div>
        </form>

        {showReset && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Reset Vault?</h3>
              </div>
              <p className="text-slate-400 text-sm mb-6">This will permanently delete all stored passwords. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowReset(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleReset} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl transition-colors">Delete All</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== PASSWORD GENERATOR MODAL ==========
function PasswordGeneratorModal({ onSelect, onClose }: { onSelect: (pw: string) => void; onClose: () => void }) {
  const [options, setOptions] = useState<GeneratorOptions>({
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: true,
  });
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);

  const regenerate = useCallback(() => {
    setGenerated(generatePassword(options));
    setCopied(false);
  }, [options]);

  useEffect(() => { regenerate(); }, [regenerate]);

  const strength = calculatePasswordStrength(generated);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Password Generator</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-700/50">
          <div className="flex items-center gap-2">
            <code className="flex-1 text-emerald-400 font-mono text-sm break-all select-all">{generated}</code>
            <button onClick={copyToClipboard} className="shrink-0 text-slate-400 hover:text-white p-1">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button onClick={regenerate} className="shrink-0 text-slate-400 hover:text-white p-1">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: `${strength.score * 100}%` }} />
            </div>
            <span className="text-xs font-medium text-slate-400">{strength.label}</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">Length</label>
              <span className="text-sm font-mono text-emerald-400">{options.length}</span>
            </div>
            <input
              type="range"
              min={4}
              max={64}
              value={options.length}
              onChange={e => setOptions({ ...options, length: parseInt(e.target.value) })}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'uppercase' as const, label: 'Uppercase (A-Z)' },
              { key: 'lowercase' as const, label: 'Lowercase (a-z)' },
              { key: 'numbers' as const, label: 'Numbers (0-9)' },
              { key: 'symbols' as const, label: 'Symbols (!@#)' },
              { key: 'excludeAmbiguous' as const, label: 'No ambiguous' },
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options[item.key]}
                  onChange={e => setOptions({ ...options, [item.key]: e.target.checked })}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
                <span className="text-sm text-slate-300">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl transition-colors">Cancel</button>
          <button onClick={() => { onSelect(generated); onClose(); }} className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white py-2.5 rounded-xl transition-colors">Use Password</button>
        </div>
      </div>
    </div>
  );
}

// ========== ADD/EDIT ENTRY MODAL ==========
function EntryModal({
  entry,
  onSave,
  onClose,
}: {
  entry?: PasswordEntry;
  onSave: (entry: PasswordEntry) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<PasswordEntry>(
    entry || {
      id: generateId(),
      title: '',
      username: '',
      password: '',
      url: '',
      notes: '',
      category: 'Login',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  );
  const [showPw, setShowPw] = useState(false);
  const [showGen, setShowGen] = useState(false);
  const [copied, setCopied] = useState('');

  const strength = calculatePasswordStrength(form.password);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, updatedAt: Date.now() });
    onClose();
  };

  const copyField = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">{entry ? 'Edit Entry' : 'New Entry'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
            <input
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="e.g., Gmail, Netflix"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Username / Email</label>
            <div className="relative">
              <input
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 pr-10"
                placeholder="username@example.com"
              />
              {form.username && (
                <button type="button" onClick={() => copyField('username', form.username)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {copied === 'username' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 pr-24"
                placeholder="Enter or generate a password"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-slate-400 hover:text-white p-1">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => copyField('password', form.password)} className="text-slate-400 hover:text-white p-1">
                  {copied === 'password' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => setShowGen(true)} className="text-slate-400 hover:text-white p-1">
                  <Zap className="w-4 h-4" />
                </button>
              </div>
            </div>
            {form.password && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${strength.color}`} style={{ width: `${strength.score * 100}%` }} />
                </div>
                <span className="text-xs text-slate-400">{strength.label}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">URL</label>
            <input
              value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white py-2.5 rounded-xl transition-colors">
              {entry ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>
        </form>

        {showGen && (
          <PasswordGeneratorModal
            onSelect={pw => setForm({ ...form, password: pw })}
            onClose={() => setShowGen(false)}
          />
        )}
      </div>
    </div>
  );
}

// ========== SETTINGS MODAL ==========
function SettingsModal({
  autoLockTime,
  onAutoLockChange,
  onChangeMasterPw,
  onDeleteVault,
  onClose,
}: {
  autoLockTime: number;
  onAutoLockChange: (v: number) => void;
  onChangeMasterPw: () => void;
  onDeleteVault: () => void;
  onClose: () => void;
}) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
              <Settings className="w-5 h-5 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Timer className="w-4 h-4" /> Auto-Lock Timer
            </label>
            <select
              value={autoLockTime}
              onChange={e => onAutoLockChange(parseInt(e.target.value))}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {AUTO_LOCK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <p className="text-xs text-slate-500 mt-1">Vault auto-locks after inactivity</p>
          </div>

          <div className="border-t border-slate-700/50 pt-4">
            <button onClick={onChangeMasterPw} className="w-full flex items-center gap-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl px-4 py-3 text-white transition-colors">
              <Key className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-medium">Change Master Password</span>
            </button>
          </div>

          <div className="border-t border-slate-700/50 pt-4">
            {!showDelete ? (
              <button onClick={() => setShowDelete(true)} className="w-full flex items-center gap-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 transition-colors">
                <Trash2 className="w-5 h-5" />
                <span className="text-sm font-medium">Delete Vault</span>
              </button>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-sm text-red-300 mb-3">Are you sure? This permanently deletes all data.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDelete(false)} className="flex-1 bg-slate-700 text-white py-2 rounded-lg text-sm">Cancel</button>
                  <button onClick={onDeleteVault} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm">Delete Everything</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== CHANGE PASSWORD MODAL ==========
function ChangePasswordModal({ onSuccess, onClose }: { onSuccess: (key: CryptoKey) => void; onClose: () => void }) {
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = calculatePasswordStrength(newPw);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) { setError('New password must be at least 8 characters'); return; }
    if (newPw !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      const key = await changeMasterPassword(current, newPw);
      onSuccess(key);
      onClose();
    } catch {
      setError('Current password is incorrect');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">Change Master Password</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label>
            <input type="password" value={current} onChange={e => setCurrent(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
            {newPw && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${strength.color}`} style={{ width: `${strength.score * 100}%` }} />
                </div>
                <span className="text-xs text-slate-400">{strength.label}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-2.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Encrypting...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== CATEGORY ICON ==========
function CategoryIcon({ category }: { category: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    Login: <User className="w-4 h-4" />,
    Finance: <Database className="w-4 h-4" />,
    Social: <Globe className="w-4 h-4" />,
    Email: <FileText className="w-4 h-4" />,
    Work: <Key className="w-4 h-4" />,
    Other: <Lock className="w-4 h-4" />,
  };
  const colorMap: Record<string, string> = {
    Login: 'bg-blue-500/20 text-blue-400',
    Finance: 'bg-green-500/20 text-green-400',
    Social: 'bg-pink-500/20 text-pink-400',
    Email: 'bg-amber-500/20 text-amber-400',
    Work: 'bg-purple-500/20 text-purple-400',
    Other: 'bg-slate-500/20 text-slate-400',
  };
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[category] || colorMap.Other}`}>
      {iconMap[category] || iconMap.Other}
    </div>
  );
}

// ========== MAIN DASHBOARD ==========
function Dashboard({
  vaultKey,
  vaultData,
  setVaultData,
  onLock,
  autoLockTime,
  setAutoLockTime,
  setVaultKey,
}: {
  vaultKey: CryptoKey;
  vaultData: VaultData;
  setVaultData: (data: VaultData) => void;
  onLock: () => void;
  autoLockTime: number;
  setAutoLockTime: (v: number) => void;
  setVaultKey: (k: CryptoKey) => void;
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editEntry, setEditEntry] = useState<PasswordEntry | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [remainingTime, setRemainingTime] = useState(autoLockTime);
  const lastActivityRef = useRef(Date.now());

  // Auto-lock timer
  useEffect(() => {
    if (autoLockTime === 0) return;

    const resetTimer = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = autoLockTime - elapsed;
      setRemainingTime(Math.max(0, remaining));
      if (remaining <= 0) {
        onLock();
      }
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      clearInterval(interval);
    };
  }, [autoLockTime, onLock]);

  const persistVault = useCallback(async (data: VaultData) => {
    setVaultData(data);
    await saveVault(vaultKey, data);
  }, [vaultKey, setVaultData]);

  const handleSaveEntry = (entry: PasswordEntry) => {
    const existing = vaultData.entries.findIndex(e => e.id === entry.id);
    let newEntries: PasswordEntry[];
    if (existing >= 0) {
      newEntries = [...vaultData.entries];
      newEntries[existing] = entry;
    } else {
      newEntries = [entry, ...vaultData.entries];
    }
    persistVault({ ...vaultData, entries: newEntries });
  };

  const handleDeleteEntry = (id: string) => {
    const newEntries = vaultData.entries.filter(e => e.id !== id);
    persistVault({ ...vaultData, entries: newEntries });
    setExpandedId(null);
  };

  const copyToClipboard = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleDeleteVault = () => {
    deleteVault();
    window.location.reload();
  };

  // Filter entries
  const filtered = vaultData.entries.filter(e => {
    const matchesSearch = !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.username.toLowerCase().includes(search.toLowerCase()) ||
      e.url.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Category counts
  const categoryCounts = CATEGORIES.map(c => ({
    name: c,
    count: vaultData.entries.filter(e => e.category === c).length,
  })).filter(c => c.count > 0);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white hidden sm:block">VaultGuard</h1>
          </div>

          <div className="flex items-center gap-2">
            {autoLockTime > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-700/50 rounded-lg px-2.5 py-1.5 mr-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono">{formatTime(remainingTime)}</span>
              </div>
            )}
            <button onClick={() => setShowHowItWorks(true)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors flex items-center gap-1.5 text-sm" title="How It Works">
              <ShieldCheck className="w-5 h-5" />
              <span className="hidden md:inline text-xs font-medium">How It Works</span>
            </button>
            <button onClick={() => setShowGenerator(true)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors" title="Password Generator">
              <Zap className="w-5 h-5" />
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors" title="Settings">
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={onLock} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors" title="Lock Vault">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{vaultData.entries.length}</div>
            <div className="text-xs text-slate-400 mt-1">Total Entries</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-emerald-400">{vaultData.entries.filter(e => calculatePasswordStrength(e.password).score >= 0.75).length}</div>
            <div className="text-xs text-slate-400 mt-1">Strong Passwords</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-amber-400">{vaultData.entries.filter(e => { const s = calculatePasswordStrength(e.password).score; return s >= 0.3 && s < 0.75; }).length}</div>
            <div className="text-xs text-slate-400 mt-1">Fair Passwords</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-400">{vaultData.entries.filter(e => calculatePasswordStrength(e.password).score < 0.3).length}</div>
            <div className="text-xs text-slate-400 mt-1">Weak Passwords</div>
          </div>
        </div>

        {/* How It Works Banner */}
        <div 
          onClick={() => setShowHowItWorks(true)}
          className="mb-6 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-purple-500/10 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 cursor-pointer hover:border-emerald-500/40 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm sm:text-base">How Your Passwords Are Protected</h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Learn about AES-256 encryption, PBKDF2 key derivation, and the full security pipeline →</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 group-hover:bg-emerald-500/30 transition-colors">
              <Eye className="w-3.5 h-3.5" />
              Explore
            </div>
          </div>
        </div>

        {/* Search & Add */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
              placeholder="Search passwords..."
            />
          </div>
          <button
            onClick={() => setShowAddEntry(true)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Entry</span>
          </button>
        </div>

        {/* Category Filter */}
        {categoryCounts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                !selectedCategory ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700'
              }`}
            >
              All ({vaultData.entries.length})
            </button>
            {categoryCounts.map(c => (
              <button
                key={c.name}
                onClick={() => setSelectedCategory(selectedCategory === c.name ? null : c.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === c.name ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700'
                }`}
              >
                {c.name} ({c.count})
              </button>
            ))}
          </div>
        )}

        {/* Entries List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/50 mb-4">
              <Lock className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-400 mb-1">
              {vaultData.entries.length === 0 ? 'No passwords yet' : 'No results found'}
            </h3>
            <p className="text-sm text-slate-500">
              {vaultData.entries.length === 0 ? 'Add your first password entry to get started' : 'Try a different search term'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(entry => {
              const isExpanded = expandedId === entry.id;
              const pwStrength = calculatePasswordStrength(entry.password);
              const showPw = showPasswords[entry.id];

              return (
                <div key={entry.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all hover:border-slate-600/50">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <CategoryIcon category={entry.category} />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{entry.title}</div>
                      <div className="text-sm text-slate-400 truncate">{entry.username || 'No username'}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`w-2 h-2 rounded-full ${pwStrength.color}`} title={`Password: ${pwStrength.label}`} />
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-700/30 pt-3 space-y-3">
                      {entry.username && (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-slate-500 mb-0.5">Username</div>
                            <div className="text-sm text-white font-mono">{entry.username}</div>
                          </div>
                          <button onClick={() => copyToClipboard(`user-${entry.id}`, entry.username)} className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-700/50 rounded-lg">
                            {copiedField === `user-${entry.id}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      )}

                      {entry.password && (
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-slate-500 mb-0.5">Password</div>
                            <div className="text-sm text-white font-mono truncate">
                              {showPw ? entry.password : '•'.repeat(Math.min(entry.password.length, 20))}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <div className="w-20 h-1 bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${pwStrength.color}`} style={{ width: `${pwStrength.score * 100}%` }} />
                              </div>
                              <span className="text-xs text-slate-500">{pwStrength.label}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => setShowPasswords(prev => ({ ...prev, [entry.id]: !prev[entry.id] }))} className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-700/50 rounded-lg">
                              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button onClick={() => copyToClipboard(`pw-${entry.id}`, entry.password)} className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-700/50 rounded-lg">
                              {copiedField === `pw-${entry.id}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {entry.url && (
                        <div>
                          <div className="text-xs text-slate-500 mb-0.5">URL</div>
                          <a href={entry.url.startsWith('http') ? entry.url : `https://${entry.url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-400 hover:underline truncate block">{entry.url}</a>
                        </div>
                      )}

                      {entry.notes && (
                        <div>
                          <div className="text-xs text-slate-500 mb-0.5">Notes</div>
                          <div className="text-sm text-slate-300 whitespace-pre-wrap">{entry.notes}</div>
                        </div>
                      )}

                      <div className="text-xs text-slate-600">
                        Updated {new Date(entry.updatedAt).toLocaleDateString()} at {new Date(entry.updatedAt).toLocaleTimeString()}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button onClick={() => setEditEntry(entry)} className="flex items-center gap-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/30 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => handleDeleteEntry(entry.id)} className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-sm transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Encryption Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-600">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>AES-256-GCM encrypted • PBKDF2 key derivation • All data stored locally</span>
        </div>
      </main>

      {/* Modals */}
      {showAddEntry && <EntryModal onSave={handleSaveEntry} onClose={() => setShowAddEntry(false)} />}
      {editEntry && <EntryModal entry={editEntry} onSave={handleSaveEntry} onClose={() => setEditEntry(null)} />}
      {showSettings && (
        <SettingsModal
          autoLockTime={autoLockTime}
          onAutoLockChange={setAutoLockTime}
          onChangeMasterPw={() => { setShowSettings(false); setShowChangePw(true); }}
          onDeleteVault={handleDeleteVault}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showChangePw && <ChangePasswordModal onSuccess={setVaultKey} onClose={() => setShowChangePw(false)} />}
      {showGenerator && <PasswordGeneratorModal onSelect={() => {}} onClose={() => setShowGenerator(false)} />}
      {showHowItWorks && <HowItWorks onClose={() => setShowHowItWorks(false)} />}
    </div>
  );
}

// ========== APP ROOT ==========
export function App() {
  const [screen, setScreen] = useState<'loading' | 'setup' | 'login' | 'dashboard'>('loading');
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);
  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [autoLockTime, setAutoLockTime] = useState(() => {
    const saved = localStorage.getItem('vaultguard_autolock');
    return saved ? parseInt(saved) : 300; // default 5 minutes
  });

  useEffect(() => {
    localStorage.setItem('vaultguard_autolock', autoLockTime.toString());
  }, [autoLockTime]);

  useEffect(() => {
    setScreen(isVaultInitialized() ? 'login' : 'setup');
  }, []);

  const handleSetup = (key: CryptoKey) => {
    setVaultKey(key);
    setVaultData({ entries: [], version: 1 });
    setScreen('dashboard');
  };

  const handleUnlock = (key: CryptoKey, data: VaultData) => {
    setVaultKey(key);
    setVaultData(data);
    setScreen('dashboard');
  };

  const handleLock = useCallback(() => {
    setVaultKey(null);
    setVaultData(null);
    setScreen('login');
  }, []);

  const handleReset = () => {
    setScreen('setup');
  };

  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (screen === 'setup') return <SetupScreen onSetup={handleSetup} />;
  if (screen === 'login') return <LoginScreen onUnlock={handleUnlock} onReset={handleReset} />;

  if (screen === 'dashboard' && vaultKey && vaultData) {
    return (
      <Dashboard
        vaultKey={vaultKey}
        vaultData={vaultData}
        setVaultData={setVaultData}
        onLock={handleLock}
        autoLockTime={autoLockTime}
        setAutoLockTime={setAutoLockTime}
        setVaultKey={setVaultKey}
      />
    );
  }

  return null;
}
