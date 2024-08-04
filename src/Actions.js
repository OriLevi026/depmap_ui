// src/components/Actions.js
import React, { useState } from 'react';

const Actions = () => {
  const [selectedAction, setSelectedAction] = useState('');
  const actions = {
    action1: 'Action 1',
    action2: 'Action 2',
    // Add more actions here
  };

  return (
    <div className="actions-section">
      <h3>Actions</h3>
      <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
        <option value="">Select Action</option>
        {Object.keys(actions).map(key => (
          <option key={key} value={key}>{actions[key]}</option>
        ))}
      </select>
      <button>Show JSON</button>
      <button>Show Markdown</button>
      <button>Add Action</button>
    </div>
  );
};

export default Actions;
