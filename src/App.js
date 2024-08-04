// src/App.js
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [existingLabels, setExistingLabels] = useState([]);

  return (
    <div className="App">
      <Sidebar existingLabels={existingLabels} setExistingLabels={setExistingLabels} />
      <div className="main-content">
        {/* Add your main content here */}
      </div>
    </div>
  );
}

export default App;
