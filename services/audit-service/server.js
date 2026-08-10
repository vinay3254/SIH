const express = require('express');
const cors = require('cors');
const AuditChain = require('./AuditChain');

const app = express();
app.use(express.json());
app.use(cors());

const auditStore = new AuditChain();

// Seed initial audit entries for baseline operations
auditStore.appendEntry({
  actor_id: 'sa.reyes@lea-cyberunit.gov',
  action: 'case.created',
  resource_type: 'Case',
  resource_id: 'case-2024-0089',
  case_id: 'case-2024-0089',
  details: { name: 'Operation Nightshade', priority: 'Critical' },
});

auditStore.appendEntry({
  actor_id: 'sa.reyes@lea-cyberunit.gov',
  action: 'evidence.uploaded',
  resource_type: 'Evidence',
  resource_id: 'ev-001',
  case_id: 'case-2024-0089',
  details: { filename: 'nightshade-tor-capture-01.pcap', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
});

// GET /healthz
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', service: 'audit-service', timestamp: new Date().toISOString() });
});

// POST /api/v1/audit/entries — append audit log entry
app.post('/api/v1/audit/entries', (req, res) => {
  const { actor_id, action, resource_type, resource_id, case_id, details } = req.body;
  if (!actor_id || !action || !resource_type || !resource_id) {
    return res.status(400).json({ error: 'Missing required audit entry fields' });
  }

  const entry = auditStore.appendEntry({ actor_id, action, resource_type, resource_id, case_id, details });
  res.status(201).json({ success: true, entry });
});

// GET /api/v1/audit/entries — retrieve audit log entries with filtering
app.get('/api/v1/audit/entries', (req, res) => {
  const { case_id, actor_id, resource_type } = req.query;
  const entries = auditStore.getEntries({ case_id, actor_id, resource_type });
  const verification = auditStore.verifyChain();
  res.json({ entries, verification });
});

// GET /api/v1/audit/verify — run tamper detection over the hash chain
app.get('/api/v1/audit/verify', (req, res) => {
  const result = auditStore.verifyChain();
  res.json(result);
});

// GET /api/v1/audit/export/:caseId — evidentiary export report
app.get('/api/v1/audit/export/:caseId', (req, res) => {
  const { caseId } = req.params;
  const entries = auditStore.getEntries({ case_id: caseId });
  const verification = auditStore.verifyChain();

  res.json({
    case_id: caseId,
    exported_at: new Date().toISOString(),
    verification,
    total_records: entries.length,
    entries,
  });
});

const PORT = process.env.AUDIT_SERVICE_PORT || 5001;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Audit Service listening on port ${PORT}`);
  });
}

module.exports = app;
