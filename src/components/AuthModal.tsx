import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  authenticateUser,
  registerAuthAccount,
  generateSuggestedCredentials,
  getAuthAccounts,
} from '../utils/storage';
import {
  X,
  Shield,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  RefreshCw,
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login inputs
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<{
    type?: 'EMPTY_FIELDS' | 'NOT_FOUND' | 'WRONG_PASSWORD';
    message: string;
    hint?: string;
    actualPassword?: string;
  } | null>(null);

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<'user' | 'admin'>('user');
  const [regError, setRegError] = useState<string | null>(null);
  const [suggestedCreds, setSuggestedCreds] = useState<{
    suggestedId: string;
    suggestedPassword: string;
  } | null>(null);

  // Show pre-seeded accounts drawer for easy reference
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const verifiedAccounts = getAuthAccounts();

  // Generate initial suggested credentials when switching to register
  useEffect(() => {
    if (mode === 'REGISTER' && !regId && !regPassword) {
      handleGenerateSuggestions();
    }
  }, [mode]);

  const handleGenerateSuggestions = (customName?: string) => {
    const creds = generateSuggestedCredentials(customName || regName || 'driver');
    setSuggestedCreds(creds);
  };

  const handleApplySuggestions = () => {
    if (suggestedCreds) {
      setRegId(suggestedCreds.suggestedId);
      setRegPassword(suggestedCreds.suggestedPassword);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const result = authenticateUser(loginId, loginPassword);

    if (!result.success) {
      setLoginError({
        type: result.errorType,
        message: result.message || 'Login failed',
        hint: result.suggestedPasswordHint,
        actualPassword: result.actualPassword,
      });
      return;
    }

    if (result.user) {
      onLogin(result.user);
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regId.trim() || !regPassword.trim()) {
      setRegError('Please provide both User ID and Password.');
      return;
    }

    const email = regEmail.trim() || `${regId.toLowerCase()}@chargego.org`;
    const name = regName.trim() || regId;

    const newUserProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone: regPhone.trim() || '+91 98220 00000',
      role: regRole,
      preferredVehicleType: 'BOTH',
      createdAt: new Date().toISOString(),
      vehicles: [
        {
          id: `veh-${Date.now()}`,
          model: regRole === 'admin' ? 'Fleet Inspection Vehicle' : 'Tata Nexon.ev (40.5 kWh)',
          registrationNumber: 'MH 12 CG 4410',
          fuelType: 'EV',
          batteryOrTankSize: '40.5 kWh',
        },
      ],
    };

    const regResult = registerAuthAccount(regId, regPassword, newUserProfile);

    if (!regResult.success) {
      setRegError(regResult.error || 'Registration failed');
      return;
    }

    // Automatically sign in newly registered user
    onLogin(newUserProfile);
    onClose();
  };

  const handleFillAccount = (id: string, pass: string) => {
    setLoginId(id);
    setLoginPassword(pass);
    setLoginError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5 my-6 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#101A2C] text-emerald-400 flex items-center justify-center font-black text-lg shadow-sm">
              ⚡
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#101A2C]">
                {mode === 'LOGIN' ? 'Sign In to ChargeGo' : 'Create ChargeGo Account'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {mode === 'LOGIN'
                  ? 'Sign in securely with your verified ID and Password'
                  : 'Register your unique ID and password to access guaranteed slot reservations'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setLoginError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'LOGIN'
                ? 'bg-white text-[#101A2C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In with ID & Password
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setRegError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'REGISTER'
                ? 'bg-white text-[#101A2C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register New Account
          </button>
        </div>

        {/* MODE: LOGIN */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            {/* Error / Wrong Password Banner */}
            {loginError && (
              <div
                className={`p-3.5 rounded-2xl border text-xs space-y-1.5 animate-in fade-in duration-200 ${
                  loginError.type === 'WRONG_PASSWORD'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    {loginError.type === 'WRONG_PASSWORD'
                      ? 'Wrong Password Warning'
                      : 'Sign In Failed'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-700">
                  {loginError.message}
                </p>

                {loginError.type === 'WRONG_PASSWORD' && loginError.hint && (
                  <div className="mt-2 pt-2 border-t border-rose-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">
                      Password Format Hint: <strong className="font-mono text-rose-800">{loginError.hint}</strong>
                    </span>
                    {loginError.actualPassword && (
                      <button
                        type="button"
                        onClick={() => setLoginPassword(loginError.actualPassword!)}
                        className="text-rose-700 hover:text-rose-900 font-bold underline cursor-pointer ml-2"
                      >
                        Auto-Fix Password
                      </button>
                    )}
                  </div>
                )}

                {loginError.type === 'NOT_FOUND' && (
                  <div className="pt-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Only registered accounts can sign in.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setRegId(loginId);
                        setMode('REGISTER');
                      }}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Register &ldquo;{loginId}&rdquo; now →
                    </button>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                User ID (Registered Username or Email)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="Enter your registered User ID (e.g. rahul_patil)"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                  className="text-[11px] text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  {showDemoAccounts ? 'Hide Quick Sign-In IDs' : 'View Verified Demo IDs'}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="Enter your secret password"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Collapsible Verified Demo Accounts for instant evaluation */}
            {showDemoAccounts && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <span>Verified System Accounts</span>
                  <span className="text-[10px] text-emerald-700 font-normal">Click to auto-fill</span>
                </div>
                <div className="space-y-1.5">
                  {verifiedAccounts.map((acc) => (
                    <button
                      key={acc.loginId}
                      type="button"
                      onClick={() => handleFillAccount(acc.loginId, acc.password)}
                      className="w-full p-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-500 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer group"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{acc.profile.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase font-semibold">
                            {acc.profile.role}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ID: <span className="font-mono font-bold text-slate-800">{acc.loginId}</span> · Password:{' '}
                          <span className="font-mono text-emerald-700">{acc.password}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        Fill ↵
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 font-bold text-white bg-[#101A2C] hover:bg-slate-800 active:scale-98 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Sign In with ID & Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* MODE: REGISTER */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            {regError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {/* Smart Suggested ID & Password Strip */}
            <div className="p-3.5 bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 rounded-2xl border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Suggested ID & Secure Password</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleGenerateSuggestions(regName)}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate New</span>
                </button>
              </div>

              {suggestedCreds && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/90 p-2.5 rounded-xl border border-emerald-100">
                  <div className="space-y-0.5">
                    <div className="text-[11px] text-slate-700">
                      Suggested ID: <strong className="font-mono text-emerald-800">{suggestedCreds.suggestedId}</strong>
                    </div>
                    <div className="text-[11px] text-slate-700">
                      Suggested Password: <strong className="font-mono text-emerald-800">{suggestedCreds.suggestedPassword}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplySuggestions}
                    className="px-3 py-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer shrink-0"
                  >
                    Apply Both to Form
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => {
                  setRegName(e.target.value);
                  if (!regId) {
                    const clean = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 10);
                    if (clean) setRegId(`${clean}_${Math.floor(100 + Math.random() * 900)}`);
                  }
                }}
                placeholder="e.g. Amit Kulkarni"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">User ID (Unique ID)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const c = generateSuggestedCredentials(regName || 'user');
                      setRegId(c.suggestedId);
                    }}
                    className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Suggest ID
                  </button>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regId}
                    onChange={(e) => setRegId(e.target.value)}
                    placeholder="e.g. amit_902"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      const c = generateSuggestedCredentials(regName || 'user');
                      setRegPassword(c.suggestedPassword);
                    }}
                    className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Suggest Password
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Choose or use suggested"
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. amit@example.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number (Optional)</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98220 12345"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Role</label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="user">Driver / Customer (Book EV & CNG Slots)</option>
                <option value="admin">Station Administrator (Manage Hubs & Slots)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Register & Sign In to ChargeGo</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer switch */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          {mode === 'LOGIN' ? (
            <span>
              Don&apos;t have an ID yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setRegError(null);
                }}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Register with ID & Password
              </button>
            </span>
          ) : (
            <span>
              Already registered an ID?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setLoginError(null);
                }}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Sign In with ID & Password
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
