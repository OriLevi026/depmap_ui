// src/components/Workloads.js
import React from 'react';

const Workloads = ({ existingLabels, setExistingLabels }) => {
  const [selectedLabel, setSelectedLabel] = useState('');

  const handleDelete = () => {
    if (selectedLabel) {
      // Simulate depmapper.delete_label function
      console.log(`Deleting label: ${selectedLabel}`);
      setExistingLabels(existingLabels.filter(label => label !== selectedLabel));
    } else {
      alert('Please select a label to delete.');
    }
  };

  return (
    <div className="workloads-section">
      <h3>Workloads</h3>
      <select value={selectedLabel} onChange={(e) => setSelectedLabel(e.target.value)}>
        <option value="">Select a label</option>
        {existingLabels.map(label => (
          <option key={label} value={label}>{label}</option>
        ))}
      </select>
      <button onClick={handleDelete} disabled={!selectedLabel}>Delete selected workload</button>
    </div>
  );
};

export default Workloads;
