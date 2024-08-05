// src/components/Workloads.js
import React from 'react';
import './workloads.css';

const Workloads = ({ existingLabels, setSelectedLabel }) => {
  return (
    <div className="workloads-section">
      <select
        onChange={(e) => setSelectedLabel(e.target.value)}
        className="workloads-select"
      >
        <option value="">Select a label</option>
        {existingLabels.map((label) => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Workloads;
