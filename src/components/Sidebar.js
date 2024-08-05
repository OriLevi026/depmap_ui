import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Repo from './Repo';
import Workloads from './Workloads';
import Analysis from './Analysis';
import Actions from './Actions';
import './sidebar.css';

const api = 'http://localhost:5000';


const CollapsibleSection = ({ title, isOpen, toggleSection, children }) => {
  return (
    <div className="collapsible-section">
      <div className="collapsible-header" onClick={toggleSection}>
        <h3>{title}</h3>
        <span className="toggle-icon">{isOpen ? '-' : '+'}</span>
      </div>
      {isOpen && <div className="collapsible-content">{children}</div>}
    </div>
  );
};

const Sidebar = ({ handleViewAction, handleAddAction, handleViewAnalysis }) => {
  const [selectedLabel, setSelectedLabel] = useState('');
  const [existingLabels, setExistingLabels] = useState([]);
  const [analysisProgress, setAnalysisProgress] = useState({});
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSection, setOpenSection] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const labelsResponse = await axios.get(`${api}/get_existing_labels`);
        console.log("get_existing_labels", labelsResponse.data);
        setExistingLabels(labelsResponse.data);

        const actionsResponse = await axios.get(`${api}/get_actions`);
        console.log("get_actions", actionsResponse.data);

        // Ensure that actionsResponse.data is an array
        if (Array.isArray(actionsResponse.data)) {
          setActions(actionsResponse.data);
        } else {
          // Handle the case where data is an object
          setActions(Object.values(actionsResponse.data));
        }

        if (selectedLabel) {
          const actionStatusResponse = await axios.get(`${api}/get_action_progress/${selectedLabel}`);
          console.log("action_progress", actionStatusResponse.data);
          setAnalysisProgress(actionStatusResponse.data);
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedLabel]);

  const handleLabelSelection = async (label) => {
    setSelectedLabel(label);
    setOpenSection('Analysis'); // Automatically open the Analysis section
    try {
      const actionStatusResponse = await axios.get(`${api}/get_action_progress/${label}`);
      console.log("action_progress", actionStatusResponse.data);
      setAnalysisProgress(actionStatusResponse.data);
    } catch (err) {
      setError('Failed to fetch analysis data');
    }
  };

  return (
    <div className="sidebar">
      <CollapsibleSection
        title="Repo"
        isOpen={openSection === 'Repo'}
        toggleSection={() => setOpenSection(openSection === 'Repo' ? null : 'Repo')}
      >
        <Repo setExistingLabels={setExistingLabels} />
      </CollapsibleSection>
      <CollapsibleSection
        title="Workloads"
        isOpen={openSection === 'Workloads'}
        toggleSection={() => setOpenSection(openSection === 'Workloads' ? null : 'Workloads')}
      >
        <Workloads 
          existingLabels={existingLabels} 
          setExistingLabels={setExistingLabels} 
          setSelectedLabel={handleLabelSelection} // Use the updated handler
        />
      </CollapsibleSection>
      <CollapsibleSection
        title={`Analysis ${selectedLabel}`}
        isOpen={openSection === 'Analysis'}
        toggleSection={() => setOpenSection(openSection === 'Analysis' ? null : 'Analysis')}
      >
        <Analysis 
          selectedLabel={selectedLabel} 
          analysisProgress={analysisProgress} 
          loading={loading} 
          error={error} 
          handleViewAnalysis={handleViewAnalysis} 
        />
      </CollapsibleSection>
      <CollapsibleSection
        title="Actions"
        isOpen={openSection === 'Actions'}
        toggleSection={() => setOpenSection(openSection === 'Actions' ? null : 'Actions')}
      >
        <Actions 
          actions={actions} 
          handleViewAction={handleViewAction} 
          handleAddAction={handleAddAction}
        />
      </CollapsibleSection>
    </div>
  );
};

export default Sidebar;
