const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// GET /healthz
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', service: 'graph-service', timestamp: new Date().toISOString() });
});

// GET /api/v1/graph/:caseId — retrieve entity relationship graph
app.get('/api/v1/graph/:caseId', (req, res) => {
  const { caseId } = req.params;
  const { confidence_threshold = 0.5 } = req.query;

  const nodes = [
    { id: 'node-onion-01', label: 'zqktlwiu...onion', type: 'onion_address', caseId },
    { id: 'node-guard-01', label: '198.51.100.42 (Guard Node Alpha)', type: 'guard_node', caseId },
    { id: 'node-exit-01', label: '203.0.113.88 (Exit Relay Beta)', type: 'exit_relay', caseId },
    { id: 'node-host-01', label: 'Host Provider (Frankfurt Datacenter)', type: 'hosting_provider', caseId },
  ];

  const edges = [
    { id: 'edge-01', source: 'node-onion-01', target: 'node-guard-01', type: 'timing_correlation', confidence: 0.87 },
    { id: 'edge-02', source: 'node-guard-01', target: 'node-host-01', type: 'shared_infrastructure', confidence: 0.82 },
    { id: 'edge-03', source: 'node-onion-01', target: 'node-exit-01', type: 'descriptor_metadata', confidence: 0.74 },
  ];

  const filteredEdges = edges.filter((e) => e.confidence >= Number(confidence_threshold));

  res.json({
    caseId,
    confidenceThreshold: Number(confidence_threshold),
    nodes,
    edges: filteredEdges,
  });
});

const PORT = process.env.GRAPH_SERVICE_PORT || 5005;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Graph Service listening on port ${PORT}`);
  });
}

module.exports = app;
