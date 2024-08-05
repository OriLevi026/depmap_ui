import React, { useMemo, useState } from 'react';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';
import useViewerStore from '../store';
import './viewer.css';
import AnalysisViewer from './AnalysisViewer';

const Viewer = ({ onSubmitAction }) => {
  const { viewerMode, viewerContent } = useViewerStore();
  const [isLoading, setIsLoading] = useState(false);

  const renderViewAction = useMemo(() => {
    if (!viewerContent || typeof viewerContent !== 'object') {
      return <div>No valid JSON content available.</div>;
    }

    return (
      <div className="json-viewer">
        <JSONPretty data={viewerContent}></JSONPretty>
      </div>
    );
  }, [viewerContent]);

  const renderAddActionForm = () => {
    return (
      <form className="add-action-form" onSubmit={onSubmitAction}>
        <div className="form-group">
          <label htmlFor="name">Action Name</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div className="form-group">
          <label htmlFor="includedFiles">Included Files</label>
          <input type="text" id="includedFiles" name="includedFiles" placeholder="Comma-separated list of files" required />
        </div>
        <div className="form-group">
          <label htmlFor="prompt">Prompt</label>
          <textarea id="prompt" name="prompt" required></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="tool">Tool</label>
          <input type="text" id="tool" name="tool" required />
        </div>
        <div className="form-group">
          <label htmlFor="schema">Schema (JSON format)</label>
          <textarea id="schema" name="schema" required></textarea>
        </div>
        <button type="submit" className="submit-button">Submit</button>
      </form>
    );
  };

  const renderContent = () => {
    switch (viewerMode) {
      case 'analysis_viewer':
        return <AnalysisViewer data={viewerContent} />;
      case 'view_action':
        return renderViewAction;
      case 'add_action':
        return renderAddActionForm();
      default:
        return <div className="no-data">Select an option to display</div>;
    }
  };

  return (
    <div className="viewer">
      {isLoading ? <div className="loading-spinner">Loading...</div> : renderContent()}
    </div>
  );
};

export default Viewer;
