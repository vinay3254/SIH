import { NextResponse } from 'next/server';

const USERS = [
  {
    id: 'user-001',
    email: 'sa.reyes@lea-cyberunit.gov',
    passwordHash: 'Nightshade#2026!',
    name: 'SA Reyes, Marcus',
    role: 'Analyst',
  },
  {
    id: 'user-002',
    email: 'ssv.okonkwo@lea-cyberunit.gov',
    passwordHash: 'Meridian#2026!',
    name: 'SSV Okonkwo, Adaeze',
    role: 'Supervisor',
  },
  {
    id: 'user-003',
    email: 'admin.petrov@lea-cyberunit.gov',
    passwordHash: 'TorAdmin#2026!',
    name: 'Admin Petrov, Dmitri',
    role: 'Admin',
  },
];

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const user = USERS.find(
      (u) =>
        (u.email.toLowerCase() === username?.toLowerCase() || u.name.toLowerCase() === username?.toLowerCase()) &&
        u.passwordHash === password
    );

    if (!user) {
      return NextResponse.json({ error: 'Invalid agency credentials or inactive account' }, { status: 401 });
    }

    const mfaSessionToken = `mfa_${Math.random().toString(36).substring(2, 15)}`;
    return NextResponse.json({
      success: true,
      mfaRequired: true,
      mfaSessionToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
