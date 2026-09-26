import { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Sparkles, 
  RotateCw, 
  AlertCircle, 
  Layers, 
  Calendar
} from 'lucide-react';
import { fetchHistory } from '../api';
import ThumbnailCard from './ThumbnailCard';
import StatusBadge from './StatusBadge';

export default function History({ onNavigateToCreate, onPreview, onToast }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistory();
      setHistory(data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError(err.message || 'Unable to load your generation history.');
      if (onToast) {
        onToast('error', err.message || 'Failed to load history.');
      }
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    let active = true;
    fetchHistory()
      .then((data) => {
        if (active) {
          setHistory(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Unable to load your generation history.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(date);
    } catch {
      return dateString || 'Recent';
    }
  };

  return (
    <div className="history-page">
      {/* Header section */}
      <div className="history-header">
        <div className="history-header-text">
          <div className="history-eyebrow">
            <Clock size={14} />
            <span>GENERATION ARCHIVE</span>
          </div>
          <h2 className="history-title">Generation History</h2>
          <p className="history-subtitle">
            Browse and download all your previously generated YouTube thumbnails
          </p>
        </div>

        <div className="history-actions">
          <button
            type="button"
            className="history-refresh-btn"
            onClick={loadHistory}
            disabled={loading}
            title="Refresh history"
          >
            <RotateCw size={15} className={loading ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="history-create-btn"
            onClick={onNavigateToCreate}
          >
            <Sparkles size={15} />
            <span>New Generation</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="history-loading-container">
          <div className="history-loading-spinner">
            <RotateCw size={28} className="spin-icon" />
          </div>
          <p>Retrieving your saved thumbnails...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="history-error-card">
          <AlertCircle size={32} className="history-error-icon" />
          <h3 className="history-error-title">Failed to Load History</h3>
          <p className="history-error-desc">{error}</p>
          <button
            type="button"
            className="modal-btn modal-btn--primary"
            onClick={loadHistory}
          >
            <RotateCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && history.length === 0 && (
        <div className="history-empty-card">
          <div className="history-empty-icon-circle">
            <Layers size={32} />
          </div>
          <h3 className="history-empty-title">No thumbnail generations yet.</h3>
          <p className="history-empty-desc">
            You haven't generated any thumbnails yet. Create your first high-converting thumbnail with our AI pipeline!
          </p>
          <button
            type="button"
            className="history-empty-cta-btn"
            onClick={onNavigateToCreate}
          >
            <Sparkles size={16} />
            <span>Create Your First Thumbnail</span>
          </button>
        </div>
      )}

      {/* Loaded List of Jobs */}
      {!loading && !error && history.length > 0 && (
        <div className="history-jobs-list">
          {history.map((job) => {
            const hasThumbnails = job.thumbnails && job.thumbnails.length > 0;
            const completedCount = job.thumbnails?.filter(t => t.status === 'uploaded')?.length || 0;

            return (
              <div key={job.id} className="history-job-card">
                {/* Job Metadata Bar */}
                <div className="history-job-meta">
                  <div className="history-job-info-left">
                    <div className="history-job-date">
                      <Calendar size={14} className="history-date-icon" />
                      <span>{formatDate(job.created_at)}</span>
                    </div>

                    <div className="history-job-status-wrapper">
                      <StatusBadge 
                        status={job.status === 'completed' ? 'ready' : job.status} 
                        label={job.status === 'completed' ? 'Completed' : (job.status === 'failed' ? 'Failed' : 'Processing')}
                      />
                    </div>

                    <span className="history-job-count-badge">
                      {completedCount} / {job.num_thumbnails} Generated
                    </span>
                  </div>

                  {job.headshot_url && (
                    <div className="history-job-headshot-badge" title="Source headshot used">
                      <img 
                        src={job.headshot_url} 
                        alt="Source headshot" 
                        className="history-job-headshot-thumb"
                      />
                      <span>Reference Photo</span>
                    </div>
                  )}
                </div>

                {/* Prompt Description */}
                <div className="history-job-prompt-box">
                  <span className="history-prompt-label">Prompt Brief:</span>
                  <p className="history-prompt-text">{job.prompt || 'Untitled concept'}</p>
                </div>

                {/* Thumbnails Grid for this Job */}
                {hasThumbnails ? (
                  <div className="history-thumbnails-grid">
                    {job.thumbnails.map((thumb, idx) => (
                      <ThumbnailCard
                        key={thumb.id || idx}
                        thumbnail={{
                          ...thumb,
                          job_id: job.id
                        }}
                        index={idx}
                        onPreview={onPreview}
                        onToast={onToast}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="history-no-thumbs">
                    <span>No thumbnails generated for this run.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
