import React from 'react';
import { Loader2, CheckCircle2, Clock, AlertTriangle, Sparkles } from 'lucide-react';

export default function GenerationProgress({ 
  currentStep, 
  statusMessage, 
  readyCount, 
  totalCount, 
  failedCount = 0 
}) {
  const steps = [
    { id: 'upload', label: 'Brief & Headshot uploaded' },
    { id: 'job', label: 'Generation job initialized' },
    { id: 'processing', label: 'Synthesizing visual variations' },
    { id: 'finalizing', label: 'Finalizing HD assets' }
  ];

  const getStepStatus = (index) => {
    // 0: upload, 1: job, 2: processing, 3: finalizing
    if (currentStep > index) return 'completed';
    if (currentStep === index) return 'active';
    return 'pending';
  };

  const progressPercent = totalCount > 0 
    ? Math.min(100, Math.round(((readyCount + failedCount) / totalCount) * 100))
    : (currentStep >= 2 ? 35 : 15);

  return (
    <div className="progress-container" aria-live="polite">
      <div className="progress-header">
        <div className="progress-badge">
          <Loader2 size={15} className="spinner-icon" />
          <span>Real-time Generation Pipeline</span>
        </div>
        <span className="progress-count">
          {readyCount} of {totalCount} ready
        </span>
      </div>

      <h3 className="progress-title">Creating your thumbnails</h3>
      <p className="progress-subtitle">
        {statusMessage || 'Your request is being processed. This may take a few moments.'}
      </p>

      {/* Progress Bar */}
      <div className="progress-bar-track">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${Math.max(8, progressPercent)}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="progress-steps-list">
        {steps.map((step, idx) => {
          const status = getStepStatus(idx);
          return (
            <div key={step.id} className={`progress-step-item progress-step-item--${status}`}>
              <div className="step-marker">
                {status === 'completed' && <CheckCircle2 size={16} className="step-icon step-icon--completed" />}
                {status === 'active' && <Loader2 size={16} className="step-icon step-icon--active spinner-icon" />}
                {status === 'pending' && <div className="step-dot" />}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          );
        })}
      </div>

      {failedCount > 0 && (
        <div className="progress-warning">
          <AlertTriangle size={15} />
          <span>{failedCount} variation failed to generate, others will continue.</span>
        </div>
      )}
    </div>
  );
}
