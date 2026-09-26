import React, { useState, useRef, useEffect, useCallback } from 'react';
import { uploadHeadshot, createJob, streamThumbnails } from './api';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import GeneratorWorkspace from './components/GeneratorWorkspace';
import ThumbnailGallery from './components/ThumbnailGallery';
import EmptyState from './components/EmptyState';
import ThumbnailPreviewModal from './components/ThumbnailPreviewModal';
import HelpModal from './components/HelpModal';
import Toast from './components/Toast';
import Footer from './components/Footer';
import './App.css';

function App() {
  // Input State
  const [prompt, setPrompt] = useState('');
  const [headshot, setHeadshot] = useState(null);
  const [numThumbnails, setNumThumbnails] = useState(3);

  // Generation & Status State
  const [loading, setLoading] = useState(false);
  const [generationState, setGenerationState] = useState({
    step: 0,
    message: '',
    readyCount: 0,
    failedCount: 0,
    jobId: null
  });
  const [thumbnails, setThumbnails] = useState([]);
  const [errors, setErrors] = useState({});

  // UI Modals & Toasts
  const [activePreview, setActivePreview] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Refs
  const eventSourceRef = useRef(null);
  const workspaceRef = useRef(null);

  // Toast Helper
  const addToast = useCallback((type, message, duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Clear field errors when user types or changes files
  const handlePromptChange = (val) => {
    setPrompt(val);
    if (errors.prompt) {
      setErrors((prev) => ({ ...prev, prompt: null }));
    }
  };

  const handleHeadshotChange = (file) => {
    setHeadshot(file);
    if (errors.headshot) {
      setErrors((prev) => ({ ...prev, headshot: null }));
    }
  };

  const scrollToSection = (sectionId) => {
    if (sectionId === 'create') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'gallery') {
      const element = document.getElementById('gallery');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Main Generation Flow
  const handleGenerate = async () => {
    const newErrors = {};
    if (!prompt.trim()) {
      newErrors.prompt = 'Please provide a topic or description for your thumbnail.';
    }
    if (!headshot) {
      newErrors.headshot = 'Please upload a creator headshot to feature in the thumbnail.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('error', 'Please complete the required brief and headshot fields.');
      return;
    }

    // Close any previous SSE connection to prevent leaks
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setLoading(true);
    setErrors({});
    setThumbnails([]);
    setGenerationState({
      step: 0,
      message: 'Uploading headshot asset...',
      readyCount: 0,
      failedCount: 0,
      jobId: null
    });

    try {
      // Step 1: Upload headshot
      const uploadResult = await uploadHeadshot(headshot);
      const headshotUrl = uploadResult.url;

      if (!headshotUrl) {
        throw new Error('Upload succeeded but no asset URL was returned.');
      }

      // Step 2: Create generation job
      setGenerationState((prev) => ({
        ...prev,
        step: 1,
        message: 'Initializing AI thumbnail pipeline...'
      }));

      const jobResult = await createJob(prompt.trim(), headshotUrl, numThumbnails);
      const jobId = jobResult.job_id;

      if (!jobId) {
        throw new Error('Job creation succeeded but no job ID was returned.');
      }

      setGenerationState((prev) => ({
        ...prev,
        step: 2,
        jobId,
        message: 'Generating unique visual concepts with AI...'
      }));

      // Step 3: Stream SSE updates
      const es = await streamThumbnails(jobId, {
        onThumbnailReady: (data) => {
          setThumbnails((prev) => {
            const exists = prev.some(
              (t) => (t.thumbnail_id || t.id) === (data.thumbnail_id || data.id)
            );
            if (exists) return prev;
            return [...prev, { ...data, status: 'uploaded' }];
          });

          setGenerationState((prev) => ({
            ...prev,
            readyCount: prev.readyCount + 1,
            message: `Synthesizing concepts... (${prev.readyCount + 1} ready)`
          }));
        },

        onThumbnailFailed: (data) => {
          console.warn('Thumbnail generation failed for an item:', data);
          setThumbnails((prev) => [
            ...prev,
            {
              thumbnail_id: data.thumbnail_id || Date.now(),
              style_name: data.style_name || 'Standard Concept',
              status: 'failed',
              error_message: data.error_message || 'Generation failed'
            }
          ]);

          setGenerationState((prev) => ({
            ...prev,
            failedCount: prev.failedCount + 1
          }));

          addToast('warning', 'One variation failed to synthesize, but remaining will continue.');
        },

        onJobComplete: () => {
          setGenerationState((prev) => ({
            ...prev,
            step: 3,
            message: 'All thumbnail variations ready!'
          }));
          setLoading(false);
          addToast('success', 'Your YouTube thumbnails are ready!');

          setTimeout(() => {
            const galleryEl = document.getElementById('gallery');
            if (galleryEl) {
              galleryEl.scrollIntoView({ behavior: 'smooth' });
            }
          }, 300);

          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
        },

        onError: (err) => {
          console.error('SSE Stream error:', err);
          setLoading(false);
          addToast('error', 'Connection to thumbnail generation service was interrupted.');
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
        }
      });

      eventSourceRef.current = es;

    } catch (err) {
      console.error('Thumbnail Generation Error:', err);
      setLoading(false);
      const friendlyMessage = err.message?.includes('Failed to fetch')
        ? 'Unable to connect to the thumbnail service. Please ensure the backend server is running.'
        : (err.message || 'An unexpected error occurred during generation.');
      addToast('error', friendlyMessage);
    }
  };

  const handleClearResults = () => {
    if (loading) return;
    setThumbnails([]);
    setGenerationState({
      step: 0,
      message: '',
      readyCount: 0,
      failedCount: 0,
      jobId: null
    });
    addToast('info', 'Workspace cleared.');
  };

  return (
    <div className="app-shell">
      {/* Toast Notification Container */}
      <div className="toast-container" aria-live="assertive">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>

      {/* Top Navbar */}
      <Navbar
        onScrollToSection={scrollToSection}
        onOpenHelp={() => setHelpOpen(true)}
        thumbnailCount={thumbnails.length}
      />

      {/* Main Page Content */}
      <main className="main-content">
        <div className="content-container">
          {/* Hero Section */}
          <Hero />

          {/* Creation Workspace */}
          <GeneratorWorkspace
            prompt={prompt}
            onPromptChange={handlePromptChange}
            headshot={headshot}
            onHeadshotChange={handleHeadshotChange}
            numThumbnails={numThumbnails}
            onNumThumbnailsChange={setNumThumbnails}
            onGenerate={handleGenerate}
            loading={loading}
            generationState={generationState}
            errors={errors}
            workspaceRef={workspaceRef}
          />

          {/* Results Gallery or Empty State */}
          <div>
            {thumbnails.length > 0 || loading ? (
              <ThumbnailGallery
                thumbnails={thumbnails}
                loading={loading}
                targetCount={numThumbnails}
                onPreview={(t) => setActivePreview(t)}
                onClear={handleClearResults}
                onToast={addToast}
              />
            ) : (
              <EmptyState onFocusPrompt={() => scrollToSection('create')} />
            )}
          </div>
        </div>
      </main>

      {/* Lightbox Preview Modal */}
      {activePreview && (
        <ThumbnailPreviewModal
          thumbnail={activePreview}
          onClose={() => setActivePreview(null)}
          onToast={addToast}
        />
      )}

      {/* Best Practices Help Modal */}
      <HelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />

      {/* Application Footer */}
      <Footer onOpenHelp={() => setHelpOpen(true)} />
    </div>
  );
}

export default App;
