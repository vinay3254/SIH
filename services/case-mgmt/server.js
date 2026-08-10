const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());

// In-memory case & evidence data store with baseline dataset
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

const evidenceList = [];

// GET /healthz
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', service: 'case-mgmt-service', timestamp: new Date().toISOString() });
});

// GET /api/v1/cases — list & filter cases
app.get('/api/v1/cases', (req, res) => {
  const { status, analyst, search, priority } = req.query;
  let filtered = [...cases];

  if (status && status !== 'all') {
    filtered = filtered.filter((c) => c.status === status);
  }
  if (analyst && analyst !== 'all') {
    filtered = filtered.filter((c) => c.analyst.includes(analyst) || c.assignedAnalysts.includes(analyst));
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

  res.json({ total: filtered.length, cases: filtered });
});

// GET /api/v1/cases/:id — retrieve single case
app.get('/api/v1/cases/:id', (req, res) => {
  const caseItem = cases.find((c) => c.id === req.params.id);
  if (!caseItem) return res.status(404).json({ error: 'Case not found' });
  res.json(caseItem);
});

// POST /api/v1/cases — create case
app.post('/api/v1/cases', (req, res) => {
  const { caseName, description, onionAddresses, assignedAnalyst, priority, classification, supervisorApproval, legalAuthority, caseNotes } = req.body;

  if (!caseName || !description || !onionAddresses || !assignedAnalyst || !supervisorApproval || !legalAuthority) {
    return res.status(400).json({ error: 'Missing required case creation metadata' });
  }

  const newId = `case-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
  const newCase = {
    id: newId,
    name: caseName,
    status: 'active',
    analyst: assignedAnalyst,
    assignedAnalysts: [assignedAnalyst],
    onionAddresses: onionAddresses.map((o) => (typeof o === 'string' ? o : o.address)),
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
  res.status(201).json({ success: true, case: newCase });
});

// POST /api/v1/cases/:id/evidence — ingest evidence file metadata & hash
app.post('/api/v1/cases/:id/evidence', (req, res) => {
  const { id } = req.params;
  const { filename, size, mimeType, fileContent } = req.body;

  const targetCase = cases.find((c) => c.id === id);
  if (!targetCase) return res.status(404).json({ error: 'Case not found' });

  const hash = crypto
    .createHash('sha256')
    .update(fileContent || `${filename}-${Date.now()}`)
    .digest('hex');

  const evidenceItem = {
    id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    caseId: id,
    filename,
    size: size || 1024,
    mimeType: mimeType || 'application/octet-stream',
    hash,
    storagePath: `minio://evidence-bucket/${id}/${filename}`,
    uploadedBy: 'SA Reyes, Marcus',
    uploadedAt: new Date().toISOString(),
    encrypted: true,
  };

  evidenceList.push(evidenceItem);
  targetCase.evidenceCount += 1;

  res.status(201).json({ success: true, evidence: evidenceItem });
});

const PORT = process.env.CASE_SERVICE_PORT || 5002;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Case Management Service listening on port ${PORT}`);
  });
}

module.exports = app;
