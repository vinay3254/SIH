const crypto = require('crypto');

class AuditChain {
  constructor() {
    this.chain = [];
    this.genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
  }

  appendEntry({ actor_id, action, resource_type, resource_id, case_id = null, details = {} }) {
    const prev_hash = this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : this.genesisHash;
    const timestamp = new Date().toISOString();
    const entryId = `audit-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const payload = JSON.stringify({
      id: entryId,
      actor_id,
      action,
      resource_type,
      resource_id,
      case_id,
      timestamp,
      prev_hash,
      details,
    });

    const hash = crypto.createHash('sha256').update(prev_hash + payload).digest('hex');

    const entry = {
      id: entryId,
      actor_id,
      action,
      resource_type,
      resource_id,
      case_id,
      timestamp,
      prev_hash,
      hash,
      details,
    };

    this.chain.push(entry);
    return entry;
  }

  verifyChain() {
    for (let i = 0; i < this.chain.length; i++) {
      const entry = this.chain[i];
      const expectedPrevHash = i === 0 ? this.genesisHash : this.chain[i - 1].hash;

      if (entry.prev_hash !== expectedPrevHash) {
        return { valid: false, brokenAtIndex: i, error: 'Previous hash mismatch (chain broken)' };
      }

      const payload = JSON.stringify({
        id: entry.id,
        actor_id: entry.actor_id,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        case_id: entry.case_id,
        timestamp: entry.timestamp,
        prev_hash: entry.prev_hash,
        details: entry.details,
      });

      const computedHash = crypto.createHash('sha256').update(entry.prev_hash + payload).digest('hex');
      if (computedHash !== entry.hash) {
        return { valid: false, brokenAtIndex: i, error: 'Hash tamper detected on entry payload' };
      }
    }
    return { valid: true, totalEntries: this.chain.length };
  }

  getEntries(filter = {}) {
    return this.chain.filter((e) => {
      if (filter.case_id && e.case_id !== filter.case_id) return false;
      if (filter.actor_id && e.actor_id !== filter.actor_id) return false;
      if (filter.resource_type && e.resource_type !== filter.resource_type) return false;
      return true;
    });
  }
}

module.exports = AuditChain;
