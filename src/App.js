// src/App.js
import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Viewer from './components/Viewer';
import './App.css';

import useStore from './store';
import axios from 'axios';

function App() {
  const { setViewerMode, setViewerContent, setLoading, setError } = useStore();

  useEffect(() => {
    const fetchActions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:5000/get_actions');
        setViewerContent(Object.values(response.data)); // Convert object to array if needed
        setLoading(false);
      } catch (error) {
        setError('Error fetching actions');
        setLoading(false);
      }
    };

    fetchActions();
  }, [setLoading, setViewerContent, setError]);

  const handleViewAnalysis = (data) => {
    setViewerMode('analysis_viewer');
    setViewerContent(data);
  };

  const handleViewAction = async (action) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:5000/show_action/${action}`);
      setViewerMode('view_action');
      setViewerContent(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching action');
      setLoading(false);
    }
  };

  const handleAddAction = () => {
    setViewerMode('add_action');
    setViewerContent(null); // No initial content for add action form
  };


  return (
    <div className="App">
      <Sidebar 
        handleViewAnalysis={handleViewAnalysis} 
        handleViewAction={handleViewAction} 
        handleAddAction={handleAddAction} 
      />
      <div className="main-content">
        <Viewer />
      </div>
    </div>
  );
}

export default App;
