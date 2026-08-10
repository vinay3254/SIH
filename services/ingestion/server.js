const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const trafficEvents = [];

// GET /healthz
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', service: 'ingestion-service', timestamp: new Date().toISOString() });
});

// POST /api/v1/ingest/traffic-capture — ingest normalized traffic capture event
app.post('/api/v1/ingest/traffic-capture', (req, res) => {
  const { source, timestamp, packet_size, direction, node_id, session_id, case_id } = req.body;

  if (!source || !timestamp || !packet_size || !direction || !case_id) {
    return res.status(400).json({ error: 'Invalid traffic ingest schema payload' });
  }

  const event = {
    id: `trf-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    source,
    timestamp: timestamp || new Date().toISOString(),
    packet_size: Number(packet_size),
    direction,
    node_id: node_id || 'TOR-GUARD-01',
    session_id: session_id || `sess-${Math.floor(Math.random() * 100000)}`,
    case_id,
    ingested_at: new Date().toISOString(),
  };

  trafficEvents.push(event);
  res.status(202).json({ success: true, message: 'Event queued for correlation engine', event });
});

// GET /api/v1/ingest/traffic-capture — query ingested events for a case
app.get('/api/v1/ingest/traffic-capture', (req, res) => {
  const { case_id } = req.query;
  const filtered = case_id ? trafficEvents.filter((e) => e.case_id === case_id) : trafficEvents;
  res.json({ total: filtered.length, events: filtered });
});

const PORT = process.env.INGESTION_SERVICE_PORT || 5003;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Ingestion Service listening on port ${PORT}`);
  });
}

module.exports = app;
