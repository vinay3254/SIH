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
          className="w-12 h-14 text-center text-xl font-medium bg-white border border-black/10 rounded-[10px] text-[#1D1D1F] focus:outline-none focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
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
      className="p-1 rounded transition-colors text-[#0071E3] hover:text-[#0071E3]/80"
      title={`Copy ${value}`}
      aria-label={`Copy ${value}`}
      type="button"
    >
      {copied ? <Check size={14} className="text-[#28CD41]" /> : <Copy size={14} />}
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
      className="min-h-screen flex w-full flex-col lg:flex-row font-sans text-[#1D1D1F] relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #F5F5F7, #E8E8ED)',
      }}
    >
      {/* ── Left panel: brand / info (Optional, adjust as needed) ────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] xl:w-[520px] flex-shrink-0 p-12 relative overflow-hidden border-r border-black/5"
      >
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <AppLogo showText={false} />
            <div>
              <span
                className="text-xl font-semibold tracking-[-0.02em] block text-[#1D1D1F]"
              >
                SIH1745
              </span>
              <span
                className="text-xs font-medium tracking-wide text-[#6E6E73]"
              >
                TOR De-anonymization Platform
              </span>
            </div>
          </div>

          {/* Classification banner */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-semibold tracking-wide bg-[#FF3B30]/10 text-[#FF3B30]"
          >
            <Shield size={14} />
            Law Enforcement Access Only
          </div>

          {/* Feature highlights */}
          <div className="space-y-6">
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
               <div key={feat.id} className="flex items-start gap-4">
                 <span
                   className="text-xl flex-shrink-0 text-[#0071E3]"
                 >
                   {feat.icon}
                 </span>
                 <div>
                   <p
                     className="text-sm font-semibold mb-1 text-[#1D1D1F]"
                   >
                     {feat.title}
                   </p>
                   <p className="text-sm leading-relaxed text-[#6E6E73]">
                     {feat.desc}
                   </p>
                 </div>
               </div>
            ))}
          </div>
        </div>

        {/* Bottom: version + network status */}
        <div className="relative z-10 flex items-center justify-between mt-12">
          <span className="text-xs text-[#6E6E73]">
            v2.4.1 · Build 20260809
          </span>
          <div className={`flex items-center gap-1.5 text-xs font-medium ${isOnline ? 'text-[#28CD41]' : 'text-[#FF3B30]'}`}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isOnline ? 'Network: Secure' : 'Offline Mode'}
          </div>
        </div>
      </div>

      {/* ── Right panel: auth form ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <AppLogo showText={false} />
            <span
              className="text-xl font-semibold tracking-[-0.02em] text-[#1D1D1F]"
            >
              SIH1745
            </span>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[20px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div
                className={`flex items-center gap-1.5 text-xs font-medium ${step === 'credentials' ? 'text-[#1D1D1F]' : 'text-[#6E6E73]'}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors duration-300 ${
                    step === 'credentials' ? 'bg-[#1D1D1F] text-white' : 'bg-black/5 text-[#6E6E73]'
                  }`}
                >
                  {step === 'mfa' ? <Check size={10} /> : '1'}
                </span>
                Credentials
              </div>
              <ChevronRight size={14} className="text-black/20" />
              <div
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors duration-300 ${step === 'mfa' ? 'text-[#1D1D1F]' : 'text-[#6E6E73]'}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors duration-300 ${
                    step === 'mfa' ? 'bg-[#1D1D1F] text-white' : 'bg-black/5 text-[#6E6E73]'
                  }`}
                >
                  2
                </span>
                Verification
              </div>
            </div>

            {/* ── Step 1: Credentials ── */}
            {step === 'credentials' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-semibold mb-2 tracking-tight text-[#1D1D1F]">
                    Sign In
                  </h1>
                  <p className="text-sm text-[#6E6E73]">
                    Authorized law enforcement personnel only.
                  </p>
                </div>

                {/* Global error */}
                {authError && (
                  <div
                    className="flex items-start gap-2 p-3 rounded-xl mb-6 text-sm bg-[#FF3B30]/10 text-[#FF3B30]"
                    role="alert"
                  >
                    <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                    {authError}
                  </div>
                )}

                <form onSubmit={handleSubmit(onCredentialsSubmit)} className="space-y-4" noValidate>
                  {/* Username */}
                  <div>
                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E73]"
                      />
                      <input
                        id="username"
                        type="text"
                        autoComplete="username"
                        placeholder="Email or Username"
                        {...register('username')}
                        className={`w-full pl-10 pr-4 py-3.5 rounded-[10px] bg-[rgba(118,118,128,0.12)] border-none text-[15px] text-[#1D1D1F] placeholder:text-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 transition-all duration-300 ${errors.username ? 'ring-2 ring-[#FF3B30]/50' : ''}`}
                        aria-describedby={errors.username ? 'username-error' : undefined}
                        aria-invalid={!!errors.username}
                      />
                    </div>
                    {errors.username && (
                      <p
                        id="username-error"
                        className="text-xs mt-1.5 ml-1 text-[#FF3B30]"
                        role="alert"
                      >
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E73]"
                      />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Password"
                        {...register('password')}
                        className={`w-full pl-10 pr-10 py-3.5 rounded-[10px] bg-[rgba(118,118,128,0.12)] border-none text-[15px] text-[#1D1D1F] placeholder:text-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 transition-all duration-300 ${errors.password ? 'ring-2 ring-[#FF3B30]/50' : ''}`}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                        aria-invalid={!!errors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p
                        id="password-error"
                        className="text-xs mt-1.5 ml-1 text-[#FF3B30]"
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
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-[15px] font-medium bg-[#0071E3] hover:bg-[#0077ED] text-white transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm disabled:opacity-50 mt-6"
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                        />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Continue
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* Session policy notice */}
                <div
                  className="mt-6 p-4 rounded-[12px] bg-[rgba(118,118,128,0.05)]"
                >
                  <div className="flex items-start gap-3">
                    <Shield size={16} className="flex-shrink-0 mt-0.5 text-[#0071E3]" />
                    <div>
                      <p className="text-xs font-medium mb-1 text-[#1D1D1F]">
                        Session Policy
                      </p>
                      <p className="text-[11px] leading-relaxed text-[#6E6E73]">
                        Sessions auto-terminate after 60 minutes of inactivity. All access events are logged immutably. Unauthorized access is a federal offense under 18 U.S.C. § 1030.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Demo credentials panel */}
                <div
                  className="mt-8 rounded-[12px] overflow-hidden bg-white border border-black/5"
                >
                  <div
                    className="px-4 py-3 border-b border-black/5 flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-[#1D1D1F]">
                      Demo Accounts
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#FF9500]/10 text-[#FF9500]"
                    >
                      Eval Only
                    </span>
                  </div>
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-black/5">
                      {demoCredentials.map((cred) => (
                        <tr
                          key={cred.id}
                          className="hover:bg-black/[0.02] transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#0071E3]/10 text-[#0071E3]"
                            >
                              {cred.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="text-xs truncate max-w-[120px] text-[#1D1D1F]"
                                title={cred.username}
                              >
                                {cred.username}
                              </span>
                              <CopyButton value={cred.username} />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => autofillCredentials(cred.username, cred.password)}
                              className="text-[11px] px-3 py-1.5 rounded-full bg-black/5 hover:bg-[#0071E3] text-[#1D1D1F] hover:text-white font-medium transition-colors"
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
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                <div className="text-center mb-8">
                  <div
                    className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-[#0071E3]/10 text-[#0071E3] mb-4"
                  >
                    <Shield size={24} />
                  </div>
                  <h1 className="text-2xl font-semibold mb-2 tracking-tight text-[#1D1D1F]">
                    Two-Factor Authentication
                  </h1>
                  <p className="text-sm text-[#6E6E73]">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                {/* OTP input */}
                <div className="mb-8">
                  <OTPInput onComplete={(val) => setOtpValue(val)} />
                  {otpError && (
                    <p
                      className="text-xs mt-4 text-center text-[#FF3B30]"
                      role="alert"
                    >
                      {otpError}
                    </p>
                  )}
                </div>

                {/* Demo hint */}
                <p
                  className="text-xs text-center mb-6 text-[#6E6E73]"
                >
                  Demo: enter any 6 digits (e.g. 123456)
                </p>

                {/* Verify button */}
                <button
                  type="button"
                  onClick={onOTPSubmit}
                  disabled={isLoading || otpValue.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-[15px] font-medium bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify &amp; Continue
                    </>
                  )}
                </button>

                {/* Back link */}
                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setOtpValue(''); setOtpError(''); }}
                  className="w-full text-center text-sm mt-6 text-[#0071E3] hover:text-[#0077ED] transition-colors font-medium"
                >
                  Back to sign in
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginMFAClient;
