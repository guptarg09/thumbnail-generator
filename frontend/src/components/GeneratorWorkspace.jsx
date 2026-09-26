import React from 'react';
import PromptInput from './PromptInput';
import HeadshotUploader from './HeadshotUploader';
import GenerationSettings from './GenerationSettings';
import GenerationSummary from './GenerationSummary';
import GenerateButton from './GenerateButton';
import GenerationProgress from './GenerationProgress';

export default function GeneratorWorkspace({
  prompt,
  onPromptChange,
  headshot,
  onHeadshotChange,
  numThumbnails,
  onNumThumbnailsChange,
  onGenerate,
  loading,
  generationState,
  errors,
  workspaceRef
}) {
  const isSubmitDisabled = !prompt.trim() || !headshot;

  const getDisabledReason = () => {
    if (!prompt.trim() && !headshot) return 'Please enter a prompt and upload a headshot.';
    if (!prompt.trim()) return 'Please describe what your thumbnail should be about.';
    if (!headshot) return 'Please upload a headshot image.';
    return null;
  };

  return (
    <section className="workspace-container" ref={workspaceRef} id="create">
      <div className="workspace-card">
        {/* If loading, show top generation progress header banner */}
        {loading && (
          <div className="workspace-progress-banner">
            <GenerationProgress
              currentStep={generationState.step}
              statusMessage={generationState.message}
              readyCount={generationState.readyCount}
              totalCount={numThumbnails}
              failedCount={generationState.failedCount}
            />
          </div>
        )}

        <div className="workspace-grid">
          {/* LEFT COLUMN: Thumbnail Brief */}
          <div className="workspace-column workspace-column--left">
            <div className="column-header">
              <span className="column-number">01</span>
              <div>
                <h2 className="column-title">Thumbnail Brief</h2>
                <p className="column-description">Provide your vision and creator assets</p>
              </div>
            </div>

            <div className="workspace-form-fields">
              <PromptInput
                prompt={prompt}
                onChange={onPromptChange}
                disabled={loading}
                error={errors.prompt}
              />

              <HeadshotUploader
                headshot={headshot}
                onHeadshotChange={onHeadshotChange}
                disabled={loading}
                error={errors.headshot}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Generation Settings & Summary */}
          <div className="workspace-column workspace-column--right">
            <div className="column-header">
              <span className="column-number">02</span>
              <div>
                <h2 className="column-title">Generation Settings</h2>
                <p className="column-description">Configure variations & review brief</p>
              </div>
            </div>

            <div className="workspace-settings-group">
              <GenerationSettings
                numThumbnails={numThumbnails}
                onChange={onNumThumbnailsChange}
                disabled={loading}
              />

              <GenerationSummary
                prompt={prompt}
                headshot={headshot}
                numThumbnails={numThumbnails}
              />

              <GenerateButton
                onClick={onGenerate}
                loading={loading}
                disabled={isSubmitDisabled}
                disabledReason={getDisabledReason()}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
