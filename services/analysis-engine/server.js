const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const jobs = [
  {
    id: 'job-001',
    case_id: 'case-2024-0089',
    type: 'combined',
    status: 'completed',
    model_version: 'v2.4.1-timing-fingerprint',
    created_by: 'SA Reyes, Marcus',
    created_at: '2026-08-09T10:00:00Z',
    completed_at: '2026-08-09T10:04:12Z',
  },
];

const candidates = [
  {
    id: 'cand-001',
    job_id: 'job-001',
    entity_ref: '198.51.100.42 (Guard Node Alpha - Frankfurt)',
    confidence_score: 0.87,
    contributing_signals: [
      {
        signal_type: 'timing_correlation',
        weight: 0.5,
        sub_score: 0.92,
        raw_feature_vector: [0.91, 0.94, 0.89, 0.95],
      },
      {
        signal_type: 'traffic_shape_fingerprint',
        weight: 0.3,
        sub_score: 0.85,
        raw_feature_vector: [512, 1420, 512, 1420],
      },
      {
        signal_type: 'descriptor_metadata_analysis',
        weight: 0.2,
        sub_score: 0.78,
        raw_feature_vector: [1723142400, 1723228800],
      },
    ],
    model_version: 'v2.4.1-timing-fingerprint',
    created_at: '2026-08-09T10:04:12Z',
  },
  {
    id: 'cand-002',
    job_id: 'job-001',
    entity_ref: '203.0.113.88 (Exit Relay Beta - Amsterdam)',
    confidence_score: 0.74,
    contributing_signals: [
      {
        signal_type: 'timing_correlation',
        weight: 0.5,
        sub_score: 0.76,
        raw_feature_vector: [0.72, 0.78, 0.75, 0.79],
      },
      {
        signal_type: 'traffic_shape_fingerprint',
        weight: 0.3,
        sub_score: 0.73,
        raw_feature_vector: [512, 1024, 512, 1024],
      },
    ],
    model_version: 'v2.4.1-timing-fingerprint',
    created_at: '2026-08-09T10:04:12Z',
  },
];

// GET /healthz
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', service: 'analysis-engine', timestamp: new Date().toISOString() });
});

// POST /api/v1/analysis/correlate — trigger correlation analysis job
app.post('/api/v1/analysis/correlate', (req, res) => {
  const { case_id, type = 'combined' } = req.body;
  if (!case_id) return res.status(400).json({ error: 'case_id required' });

  const jobId = `job-${Date.now()}`;
  const newJob = {
    id: jobId,
    case_id,
    type,
    status: 'running',
    model_version: 'v2.4.1-timing-fingerprint',
    created_by: 'SA Reyes, Marcus',
    created_at: new Date().toISOString(),
    completed_at: null,
  };

  jobs.unshift(newJob);

  // Async simulation of multi-signal analysis worker
  setTimeout(() => {
    newJob.status = 'completed';
    newJob.completed_at = new Date().toISOString();

    const newCandidate = {
      id: `cand-${Date.now()}`,
      job_id: jobId,
      entity_ref: '198.51.100.119 (Target Node - Zurich)',
      confidence_score: 0.81,
      contributing_signals: [
        {
          signal_type: 'timing_correlation',
          weight: 0.5,
          sub_score: 0.84,
          raw_feature_vector: [0.82, 0.85, 0.86, 0.83],
        },
        {
          signal_type: 'traffic_shape_fingerprint',
          weight: 0.3,
          sub_score: 0.79,
          raw_feature_vector: [512, 1420, 1024],
        },
      ],
      model_version: 'v2.4.1-timing-fingerprint',
      created_at: new Date().toISOString(),
    };

    candidates.unshift(newCandidate);
  }, 3000);

  res.status(202).json({ success: true, jobId, job: newJob });
});

// GET /api/v1/analysis/:jobId/status — check job status
app.get('/api/v1/analysis/:jobId/status', (req, res) => {
  const job = jobs.find((j) => j.id === req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// GET /api/v1/analysis/:jobId/results — fetch candidates with confidence scoring feature vectors
app.get('/api/v1/analysis/:jobId/results', (req, res) => {
  const jobCandidates = candidates.filter((c) => c.job_id === req.params.jobId);
  res.json({ jobId: req.params.jobId, totalCandidates: jobCandidates.length, candidates: jobCandidates });
});

// GET /api/v1/analysis/jobs/activity — activity chart stats
app.get('/api/v1/analysis/jobs/activity', (req, res) => {
  res.json([
    { day: 'Jul 27', jobs: 4 },
    { day: 'Jul 28', jobs: 7 },
    { day: 'Jul 29', jobs: 3 },
    { day: 'Jul 30', jobs: 9 },
    { day: 'Jul 31', jobs: 5 },
    { day: 'Aug 01', jobs: 11 },
    { day: 'Aug 02', jobs: 6 },
    { day: 'Aug 03', jobs: 8 },
    { day: 'Aug 04', jobs: 2 },
    { day: 'Aug 05', jobs: 13 },
    { day: 'Aug 06', jobs: 7 },
    { day: 'Aug 07', jobs: 10 },
    { day: 'Aug 08', jobs: 4 },
    { day: 'Aug 09', jobs: 8 },
  ]);
});

const PORT = process.env.ANALYSIS_SERVICE_PORT || 5004;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Analysis Engine Service listening on port ${PORT}`);
  });
}

module.exports = app;
