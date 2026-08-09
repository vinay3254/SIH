'use client';
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  Shield,
  Lock,
  User,
  AlertTriangle,
  ChevronRight,
  Copy,
  Check,
  Wifi,
  WifiOff,
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';


// ─── Zod schemas ────────────────────────────────────────────────────────────
const credentialsSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(64, 'Username too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

type CredentialsForm = z.infer<typeof credentialsSchema>;
type OTPForm = z.infer<typeof otpSchema>;

// ─── Demo credentials ────────────────────────────────────────────────────────
const demoCredentials = [
  { id: 'demo-analyst', role: 'Analyst', username: 'sa.reyes@lea-cyberunit.gov', password: 'Nightshade#2026!' },
  { id: 'demo-supervisor', role: 'Supervisor', username: 'ssv.okonkwo@lea-cyberunit.gov', password: 'Meridian#2026!' },
  { id: 'demo-admin', role: 'Admin', username: 'admin.petrov@lea-cyberunit.gov', password: 'TorAdmin#2026!' },
];

// ─── OTP digit input component ──────────────────────────────────────────────
function OTPInput({ onComplete }: { onComplete: (val: string) => void }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    const full = next.join('');
    if (full.length === 6) onComplete(full);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      onComplete(pasted);
      refs.current[5]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={`otp-digit-${i}`}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-10 h-12 text-center text-lg font-mono font-bold bg-gray-950 border border-gray-800 rounded-xl text-cyan-400 focus:outline-none focus:border-cyan-500 transition-colors"
          aria-label={`OTP digit ${i + 1}`}
          autoComplete="off"
        />
      ))}
    </div>
  );
}

// ─── Copy button ─────────────────────────────────────────────────────────────
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded transition-colors text-cyan-400 hover:text-cyan-300"
      title={`Copy ${value}`}
      aria-label={`Copy ${value}`}
      type="button"
    >
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
    </button>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export function LoginMFAClient() {
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isOnline] = useState(true); // Air-gapped: always true in isolated deployments

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CredentialsForm>({
    resolver: zodResolver(credentialsSchema),
  });

  // Backend integration point: POST /api/v1/auth/login with credentials
  const onCredentialsSubmit = async (data: CredentialsForm) => {
    setIsLoading(true);
    setAuthError('');
    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 1000));

      const validCreds = demoCredentials.find(
        (c) => c.username === data.username && c.password === data.password
      );

      if (!validCreds) {
        setAuthError(
          'Invalid credentials — use the demo accounts below to sign in'
        );
        setIsLoading(false);
        return;
      }

      toast?.success?.('Credentials verified — MFA required');
      setStep('mfa');
    } catch {
      setAuthError('Authentication service unreachable. Check VPN tunnel status.');
    } finally {
      setIsLoading(false);
    }
  };

  // Backend integration point: POST /api/v1/auth/verify-mfa with TOTP token
  const onOTPSubmit = async () => {
    if (otpValue.length !== 6) {
      setOtpError('Enter all 6 digits of your TOTP code');
      return;
    }
    setIsLoading(true);
    setOtpError('');
    try {
      await new Promise((r) => setTimeout(r, 800));

      // Demo: accept any 6-digit code
      if (!/^\d{6}$/.test(otpValue)) {
        setOtpError('Invalid OTP format — enter the 6-digit code from your authenticator app');
        setIsLoading(false);
        return;
      }

      toast?.success?.('Authentication successful');
      // Navigate to dashboard
      window.location.href = '/case-dashboard';
    } catch {
      setOtpError('MFA verification failed. Try again or contact your system administrator.');
    } finally {
      setIsLoading(false);
    }
  };

  const autofillCredentials = (username: string, password: string) => {
    setValue('username', username, { shouldValidate: false });
    setValue('password', password, { shouldValidate: false });
    toast?.info?.('Demo credentials loaded — click Sign In to continue');
  };

  return (
    <div
      className="min-h-screen flex w-full bg-gray-950 text-gray-100"
    >
      {/* ── Left panel: brand / info ─────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] xl:w-[520px] flex-shrink-0 p-10 relative overflow-hidden border-r border-gray-800 bg-gray-900"
      >
        {/* Glow blob */}
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20 bg-cyan-500 blur-3xl pointer-events-none"
        />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <AppLogo showText={false} />
            <div>
              <span
                className="font-mono text-lg font-bold tracking-wider block text-white"
              >
                SIH1745
              </span>
              <span
                className="text-xs font-semibold tracking-widest uppercase text-cyan-400"
              >
                TOR De-anonymization Platform
              </span>
            </div>
          </div>

          {/* Classification banner */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-semibold tracking-wider uppercase bg-rose-500/10 border border-rose-500/30 text-rose-400"
          >
            <Shield size={12} />
            Law Enforcement Access Only
          </div>

          {/* Feature highlights */}
          <div className="space-y-5">
            {[
              {
                id: 'feat-correlation',
                icon: '◈',
                title: 'TOR v3 Traffic Correlation',
                desc: 'Entry/exit timing analysis across guard and exit nodes to surface candidate operators.',
              },
              {
                id: 'feat-graph',
                icon: '◉',
                title: 'Entity Relationship Graph',
                desc: 'Interactive graph explorer linking onion addresses to infrastructure and related cases.',
              },
              {
                id: 'feat-custody',
                icon: '◎',
                title: 'Chain-of-Custody Audit',
                desc: 'Immutable, hash-chained audit trail for evidentiary admissibility in legal proceedings.',
              },
              {
                id: 'feat-confidence',
                icon: '◐',
                title: 'Explainable Confidence Scores',
                desc: 'Every candidate score is traceable to contributing signals. No black-box attribution.',
              },
            ].map((feat) => (
              <div key={feat.id} className="flex items-start gap-3">
                <span
                  className="text-lg flex-shrink-0 mt-0.5 text-cyan-400"
                >
                  {feat.icon}
                </span>
                <div>
                  <p
                    className="text-sm font-semibold mb-0.5 text-gray-200"
                  >
                    {feat.title}
                  </p>
                  <p className="text-xs leading-relaxed text-gray-400">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: version + network status */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-mono text-gray-500">
            v2.4.1 · Build 20260809
          </span>
          <div className={`flex items-center gap-1.5 text-xs ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isOnline ? 'Network: Secure' : 'Offline Mode'}
          </div>
        </div>
      </div>

      {/* ── Right panel: auth form ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo showText={false} />
            <span
              className="font-mono text-base font-bold tracking-wider text-white"
            >
              SIH1745
            </span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold ${step === 'credentials' ? 'text-white' : 'text-cyan-400'}`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 'credentials' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-cyan-300'
                }`}
              >
                {step === 'mfa' ? <Check size={10} /> : '1'}
              </span>
              Credentials
            </div>
            <ChevronRight size={14} className="text-gray-600" />
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold ${step === 'mfa' ? 'text-white' : 'text-gray-500'}`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 'mfa' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                2
              </span>
              MFA Verification
            </div>
          </div>

          {/* ── Step 1: Credentials ── */}
          {step === 'credentials' && (
            <div className="fade-in">
              <div
                className="rounded-2xl border p-6 mb-4 bg-gray-900 border-gray-800"
              >
                <h1 className="text-xl font-bold mb-1 text-white">
                  Investigator Sign In
                </h1>
                <p className="text-xs mb-6 text-gray-400">
                  Access is restricted to authorized law enforcement personnel. All sessions are logged.
                </p>

                {/* Global error */}
                {authError && (
                  <div
                    className="flex items-start gap-2 p-3 rounded-xl mb-4 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400"
                    role="alert"
                  >
                    <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                    {authError}
                  </div>
                )}

                <form onSubmit={handleSubmit(onCredentialsSubmit)} className="space-y-4" noValidate>
                  {/* Username */}
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-xs font-mono text-gray-300 mb-1.5"
                    >
                      Username / Badge Email
                    </label>
                    <div className="relative">
                      <User
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                      <input
                        id="username"
                        type="text"
                        autoComplete="username"
                        placeholder="sa.name@lea-cyberunit.gov"
                        {...register('username')}
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors ${errors.username ? 'border-rose-500' : ''}`}
                        aria-describedby={errors.username ? 'username-error' : undefined}
                        aria-invalid={!!errors.username}
                      />
                    </div>
                    {errors.username && (
                      <p
                        id="username-error"
                        className="text-xs mt-1 text-rose-400"
                        role="alert"
                      >
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-mono text-gray-300 mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••••••"
                        {...register('password')}
                        className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors ${errors.password ? 'border-rose-500' : ''}`}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                        aria-invalid={!!errors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p
                        id="password-error"
                        className="text-xs mt-1 text-rose-400"
                        role="alert"
                      >
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-600/30 disabled:opacity-60 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                        />
                        Verifying…
                      </>
                    ) : (
                      <>
                        Sign In
                        <ChevronRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Session policy notice */}
              <div
                className="rounded-xl border p-3 mb-4 bg-gray-900/60 border-gray-800"
              >
                <div className="flex items-start gap-2">
                  <Shield size={13} className="flex-shrink-0 mt-0.5 text-cyan-400" />
                  <div>
                    <p className="text-xs font-semibold mb-0.5 text-cyan-300">
                      Session Policy
                    </p>
                    <p className="text-xs leading-relaxed text-gray-400">
                      Sessions auto-terminate after 60 minutes of inactivity. All access events are logged immutably to the chain-of-custody audit trail. Unauthorized access is a federal offense under 18 U.S.C. § 1030.
                    </p>
                  </div>
                </div>
              </div>

              {/* Demo credentials panel */}
              <div
                className="rounded-xl border overflow-hidden bg-gray-900 border-gray-800"
              >
                <div
                  className="px-3 py-2 border-b border-gray-800 flex items-center gap-2"
                >
                  <span className="text-xs font-semibold text-cyan-300">
                    Demo Credentials
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  >
                    Dev/Eval Only
                  </span>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-800 text-[10px] uppercase font-mono text-gray-500">
                      {['Role', 'Username', 'Password', ''].map((h, i) => (
                        <th
                          key={`cred-th-${i}`}
                          className="px-3 py-1.5 font-medium"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {demoCredentials.map((cred) => (
                      <tr
                        key={cred.id}
                        className="hover:bg-gray-950/60 transition-colors"
                      >
                        <td className="px-3 py-2">
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono"
                          >
                            {cred.role}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <span
                              className="text-xs font-mono truncate max-w-[140px] text-gray-200"
                              title={cred.username}
                            >
                              {cred.username}
                            </span>
                            <CopyButton value={cred.username} />
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <span
                              className="text-xs font-mono text-gray-500"
                            >
                              ••••••••
                            </span>
                            <CopyButton value={cred.password} />
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => autofillCredentials(cred.username, cred.password)}
                            className="text-[10px] px-2 py-1 rounded bg-gray-800 hover:bg-cyan-600 text-gray-200 hover:text-white font-semibold transition-colors"
                          >
                            Use
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Step 2: MFA ── */}
          {step === 'mfa' && (
            <div className="fade-in">
              <div
                className="rounded-2xl border p-6 mb-4 bg-gray-900 border-gray-800"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  >
                    <Shield size={20} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">
                      MFA Verification
                    </h1>
                    <p className="text-xs text-gray-400">
                      Enter the 6-digit code from your authenticator app
                    </p>
                  </div>
                </div>

                {/* MFA info banner */}
                <div
                  className="flex items-start gap-2 p-3 rounded-xl mb-5 text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-300"
                >
                  <Lock size={13} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Open your TOTP authenticator app (Google Authenticator, Authy, or FreeOTP) and enter the current 6-digit code for{' '}
                    <span className="font-bold text-white">
                      SIH1745 LEA Platform
                    </span>
                    .
                  </span>
                </div>

                {/* OTP input */}
                <div className="mb-4">
                  <label
                    className="block text-xs font-mono font-semibold mb-3 text-center tracking-widest uppercase text-cyan-400"
                  >
                    One-Time Passcode
                  </label>
                  <OTPInput onComplete={(val) => setOtpValue(val)} />
                  {otpError && (
                    <p
                      className="text-xs mt-3 text-center text-rose-400"
                      role="alert"
                    >
                      {otpError}
                    </p>
                  )}
                </div>

                {/* Demo hint */}
                <p
                  className="text-[10px] text-center mb-4 text-gray-500 font-mono"
                >
                  Demo: enter any 6 digits (e.g. 123456)
                </p>

                {/* Verify button */}
                <button
                  type="button"
                  onClick={onOTPSubmit}
                  disabled={isLoading || otpValue.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition-all shadow-lg shadow-cyan-600/30"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Verifying MFA…
                    </>
                  ) : (
                    <>
                      <Shield size={15} />
                      Verify &amp; Access Platform
                    </>
                  )}
                </button>

                {/* Back link */}
                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setOtpValue(''); setOtpError(''); }}
                  className="w-full text-center text-xs mt-3 py-2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  ← Back to credentials
                </button>
              </div>

              {/* Session policy notice */}
              <div
                className="rounded-xl border p-3 bg-gray-900/60 border-gray-800"
              >
                <p className="text-xs leading-relaxed text-gray-400">
                  <span className="font-semibold text-cyan-300">Data handling notice: </span>
                  No case data is stored client-side. Session tokens are scoped per case. This session will auto-expire after 60 minutes of inactivity and will be recorded in the immutable audit log.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginMFAClient;
