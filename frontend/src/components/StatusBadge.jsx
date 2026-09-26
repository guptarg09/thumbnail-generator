import React from 'react';

export default function StatusBadge({ status, label, pulsing = false }) {
  const normalized = (status || '').toLowerCase();
  
  let type = 'default';
  let displayLabel = label;

  if (normalized.includes('operational') || normalized === 'ready' || normalized === 'uploaded' || normalized === 'completed' || normalized === 'success') {
    type = 'success';
    displayLabel = displayLabel || (normalized === 'operational' ? 'System Operational' : 'Ready');
  } else if (normalized.includes('progress') || normalized === 'generating' || normalized === 'loading' || normalized === 'processing') {
    type = 'warning';
    displayLabel = displayLabel || 'Generating';
    pulsing = true;
  } else if (normalized.includes('failed') || normalized === 'error') {
    type = 'error';
    displayLabel = displayLabel || 'Failed';
  } else if (normalized.includes('info') || normalized === 'pending') {
    type = 'info';
    displayLabel = displayLabel || 'Pending';
  } else {
    displayLabel = displayLabel || status || 'Unknown';
  }

  return (
    <span className={`status-badge status-badge--${type}`}>
      <span className={`status-dot ${pulsing ? 'status-dot--pulsing' : ''}`} />
      <span className="status-label">{displayLabel}</span>
    </span>
  );
}
