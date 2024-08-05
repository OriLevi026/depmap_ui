// src/components/Analysis.js
import React, { useState, useEffect } from 'react';
import './analysis.css';
import reload_icon from '../icons/icons8-reload-100.png';
import analyze_icon from '../icons/icons8-start-100.png';
import axios from 'axios';
import Papa from 'papaparse';

const Analysis = ({ selectedLabel, loading, error, handleViewAnalysis }) => {
  const [actionStatuses, setActionStatuses] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActionStatuses = async () => {
      if (selectedLabel) {
        setIsLoading(true);
        try {
          const response = await axios.get(`http://127.0.0.1:5000/get_action_progress/${selectedLabel}`);
          setActionStatuses(response.data);
          console.log("action_status", response.data);
        } catch (err) {
          console.error('Error fetching action statuses:', err);
          setActionStatuses(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchActionStatuses();
  }, [selectedLabel]);

    
  const handleReset = async (action) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/reset_action', { action, label: selectedLabel });
      if (response.data.success) {
        alert(`Successfully reset action: ${action}`);
        setIsLoading(true);
        const refreshResponse = await axios.get(`http://127.0.0.1:5000/get_action_progress/${selectedLabel}`);
        setActionStatuses(refreshResponse.data);
        setIsLoading(false);
      } else {
        alert(`Failed to reset action: ${action}`);
      }
    } catch (error) {
      console.error('Error resetting action:', error);
    }
  };

  const handleStartAnalysis = async (action) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/start_analysis', { action, label: selectedLabel });
      if (response.data.status === 'started') {
        alert(`Successfully started analysis: ${action}`);
        pollAnalysisStatus(action);
      } else {
        alert(`Failed to start analysis: ${action}`);
      }
    } catch (error) {
      console.error('Error starting analysis:', error);
    }
  };

  const pollAnalysisStatus = async (action) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/get_action_progress/${selectedLabel}`);
        const updatedStatuses = response.data;

        if (updatedStatuses[action].status !== 0) {
          clearInterval(interval);
        }

        setActionStatuses(updatedStatuses);
      } catch (error) {
        console.error('Error polling analysis status:', error);
        clearInterval(interval);
      }
    }, 3000);
  };

  const handleView = async (action) => {
    try {
        const response = await axios.get(`http://127.0.0.1:5000/get_index/${selectedLabel}`);
        console.log("response", response.data);
        
        // Parse the CSV response to JSON
        const parsedData = Papa.parse(response.data, {
            header: true, // Use the first row as the header
            skipEmptyLines: true
        }).data;

        console.log("Parsed Data", parsedData);

        handleViewAnalysis(parsedData); // Pass the parsed data to the Viewer
    } catch (error) {
        console.error('Error viewing action:', error);
    } 
};

  const formatActionText = (action) => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  };

  if (!selectedLabel || selectedLabel === ' ') {
    return <div>Please select a label to view analysis.</div>;
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div>Loading action statuses...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!actionStatuses || Object.keys(actionStatuses).length === 0) {
    return <div>No action statuses available for this label.</div>;
  }

  return (
    <div className="analysis-section">
      <div className="analysis-list">
        {Object.entries(actionStatuses).map(([action, statusInfo]) => {
          const progressPercent = Math.round(statusInfo.status * 100);
          const gradientColor = `linear-gradient(90deg, rgba(87, 234, 82, 0.822) ${progressPercent}%, rgba(234, 82, 82, 0.525) ${progressPercent}%)`;
          const actionText = formatActionText(action);

          return (
            <div key={action} className="analysis-item">
              <div className="action-text">
                <p>{actionText}</p>
              </div>
              <div className="progress-row">
                <button
                  className="analysis-status"
                  style={{ background: gradientColor }}
                  onClick={() => statusInfo.status === 0 ? handleStartAnalysis(action) : handleView(action)}
                >
                  <b>{progressPercent}%</b>
                </button>
                {statusInfo.status === 0 ? (
                  <button
                    className="reset-button"
                    onClick={() => handleStartAnalysis(action)}
                  >
                    <img src={analyze_icon} alt="analyze" className="analyze-icon" />
                  </button>
                ) : (
                  <button
                    className="reset-button"
                    onClick={() => handleReset(action)}
                  >
                    <img src={reload_icon} alt="reset" className="reset-icon" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Analysis;
