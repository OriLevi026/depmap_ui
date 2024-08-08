// src/App.js
import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Viewer from './components/Viewer';
import './App.css';

import useViewerStore from './store';
import axios from 'axios';

const api = 'http://localhost:5000';

function App() {
  const { setViewerMode, setViewerContent, setLoading, setError } = useViewerStore();

  useEffect(() => {
    const fetchActions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${api}/actions`);
        setViewerContent(Object.values(response.data)); // Convert object to array if needed
        setLoading(false);
      } catch (error) {
        setError('Error fetching actions');
        setLoading(false);
      }
    };

    fetchActions();
  }, [setLoading, setViewerContent, setError]);

  const handleViewAction = (data) => {
    setViewerMode('view_action');
    setViewerContent(data);
  };

  const handleAddAction = () => {
    setViewerMode('add_action');
    setViewerContent(null); // No initial content for add action form
  };

  const onSubmitAction = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newAction = {
      name: formData.get('name'),
      includedFiles: formData.get('includedFiles').split(','),
      prompt: formData.get('prompt'),
      tool: formData.get('tool'),
      schema: JSON.parse(formData.get('schema')),
    };
    
    try {
      await axios.post(`${api}/actions`, newAction);
      alert('Action added successfully!');
      setViewerMode('view_action');
      setViewerContent(newAction);
    } catch (error) {
      alert('Error adding action');
      console.error('Error adding action:', error);
    }
  };

  return (
    <div className="App">
      <Sidebar 
        handleViewAction={handleViewAction} 
        handleAddAction={handleAddAction} 
      />
      <div className="main-content">
        <Viewer onSubmitAction={onSubmitAction} />
      </div>
    </div>
  );
}

export default App;
