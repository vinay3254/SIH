const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());

// Demo User Accounts (LE Agency Cyber Unit)
const USERS = [
  {
    id: 'user-001',
    email: 'sa.reyes@lea-cyberunit.gov',
    passwordHash: 'Nightshade#2026!', // In production hashed via bcrypt
    name: 'SA Reyes, Marcus',
    role: 'Analyst',
    mfaSecret: 'JBSWY3DPEHPK3PXP',
    isActive: true,
  },
  {
    id: 'user-002',
    email: 'ssv.okonkwo@lea-cyberunit.gov',
    passwordHash: 'Meridian#2026!',
    name: 'SSV Okonkwo, Adaeze',
    role: 'Supervisor',
    mfaSecret: 'JBSWY3DPEHPK3PXQ',
    isActive: true,
  },
  {
    id: 'user-003',
    email: 'admin.petrov@lea-cyberunit.gov',
    passwordHash: 'TorAdmin#2026!',
    name: 'Admin Petrov, Dmitri',
    role: 'Admin',
    mfaSecret: 'JBSWY3DPEHPK3PXR',
    isActive: true,
  },
];

const sessions = new Map();

// Middleware: correlation_id injection & request logging
app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || `corr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
});

// GET /healthz
app.get('/healthz', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId,
  });
});

// POST /api/v1/auth/login — Credentials validation (Step 1)
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(
    (u) => (u.email.toLowerCase() === username.toLowerCase() || u.name.toLowerCase() === username.toLowerCase()) && u.passwordHash === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials or inactive agency account' });
  }

  const mfaSessionToken = `mfa_token_${crypto.randomBytes(16).toString('hex')}`;
  sessions.set(mfaSessionToken, { userId: user.id, status: 'mfa_pending', createdAt: Date.now() });

  res.json({
    success: true,
    mfaRequired: true,
    mfaSessionToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// POST /api/v1/auth/verify-otp — MFA TOTP Verification (Step 2)
app.post('/api/v1/auth/verify-otp', (req, res) => {
  const { mfaSessionToken, otp } = req.body;
  const pendingSession = sessions.get(mfaSessionToken);

  if (!pendingSession || pendingSession.status !== 'mfa_pending') {
    return res.status(401).json({ error: 'Invalid or expired MFA session' });
  }

  const user = USERS.find((u) => u.id === pendingSession.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // In production verify TOTP HMAC-SHA1. Accept 6-digit code or test override '123456'
  if (otp.length !== 6) {
    return res.status(400).json({ error: 'OTP must be 6 digits' });
  }

  const accessToken = `jwt_token_${crypto.randomBytes(32).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // 8 hours

  sessions.delete(mfaSessionToken);
  sessions.set(accessToken, {
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    expiresAt,
  });

  res.json({
    success: true,
    accessToken,
    expiresAt,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const PORT = process.env.API_GATEWAY_PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API Gateway listening on port ${PORT}`);
  });
}

module.exports = app;
