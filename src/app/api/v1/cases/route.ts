import { NextResponse } from 'next/server';

const cases = [
  {
    id: 'case-2024-0089',
    name: 'Operation Nightshade',
    status: 'active',
    analyst: 'SA Reyes, Marcus',
    assignedAnalysts: ['SA Reyes, Marcus'],
    onionAddresses: ['zqktlwiuavvvqqt4ybvgvi7tyo4hjl5xgfuvpdf6otjiycgwqbym26id.onion'],
    evidenceCount: 147,
    jobCount: 3,
    lastJobStatus: 'running',
    topConfidence: 0.87,
    candidateCount: 4,
    createdAt: '2026-07-14',
    priority: 'Critical',
    classification: 'Secret',
    description: 'Investigation into active illicit TOR marketplace Operation Nightshade.',
    supervisorApproval: 'APPR-2026-0447',
    legalAuthority: 'Warrant #WR-2026-00234',
  },
  {
    id: 'case-2024-0091',
    name: 'Project Phantom Ledger',
    status: 'active',
    analyst: 'SA Chen, Wei',
    assignedAnalysts: ['SA Chen, Wei'],
    onionAddresses: ['phantom239487192837491287349182739418273948127394182.onion'],
    evidenceCount: 89,
    jobCount: 2,
    lastJobStatus: 'completed',
    topConfidence: 0.74,
    candidateCount: 7,
    createdAt: '2026-07-18',
    priority: 'High',
    classification: 'Confidential',
    description: 'Cryptocurrency laundering ring operating hidden financial services.',
    supervisorApproval: 'APPR-2026-0512',
    legalAuthority: '18 U.S.C. § 2703',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const analyst = searchParams.get('analyst');
  const search = searchParams.get('search');
  const priority = searchParams.get('priority');

  let filtered = [...cases];

  if (status && status !== 'all') {
    filtered = filtered.filter((c) => c.status === status);
  }
  if (analyst && analyst !== 'all') {
    filtered = filtered.filter((c) => c.analyst.includes(analyst));
  }
  if (priority && priority !== 'all') {
    filtered = filtered.filter((c) => c.priority === priority);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.onionAddresses.some((addr) => addr.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({ total: filtered.length, cases: filtered });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseName, description, onionAddresses, assignedAnalyst, priority, classification, supervisorApproval, legalAuthority, caseNotes } = body;

    if (!caseName || !description || !onionAddresses || !assignedAnalyst || !supervisorApproval || !legalAuthority) {
      return NextResponse.json({ error: 'Missing required case creation metadata' }, { status: 400 });
    }

    const newId = `case-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const newCase = {
      id: newId,
      name: caseName,
      status: 'active',
      analyst: assignedAnalyst,
      assignedAnalysts: [assignedAnalyst],
      onionAddresses: onionAddresses.map((o: any) => (typeof o === 'string' ? o : o.address)),
      evidenceCount: 0,
      jobCount: 0,
      lastJobStatus: 'queued',
      topConfidence: 0.0,
      candidateCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      priority,
      classification,
      description,
      supervisorApproval,
      legalAuthority,
      caseNotes,
    };

    cases.unshift(newCase);
    return NextResponse.json({ success: true, case: newCase }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}
