// src/components/Workloads.js
import React from 'react';
import './workloads.css';
import delete_icon from '../icons/icons8-delete-90.png';
import axios from 'axios';

const Workloads = ({ existingLabels, setSelectedLabel }) => {
  // Safely access the labels array, defaulting to an empty array if it doesn't exist
  const labelsArray = existingLabels.labels || [];

  // Function to handle deletion of a workload
  const handleDelete = async (label) => {
    console.log('Deleting workload:', label);
    try {
      // Send DELETE request to remove analysis and label
      const analysis_response = await axios.delete(`http://127.0.0.1:5000/analysis/results/${label}/deprecated_using_web_search`);
      if (analysis_response.status === 200) {
        console.log('Analysis results deleted successfully:', analysis_response.data);
        const label_response = await axios.delete(`http://127.0.0.1:5000/labels/${label}`);
        if (label_response.status === 200) {
          // Remove the label from the local state if deletion is successful
          const updatedLabels = labelsArray.filter((item) => item !== label);
          setSelectedLabel(updatedLabels);
          // set analysis progress to null
          setSelectedLabel(null);
          alert(`Workload "${label}" deleted successfully.`);
        } else {
          alert('Failed to delete workload.');
        }
      }
    } catch (error) {
      console.error('Error deleting workload:', error);
      alert('An error occurred while trying to delete the workload.');
    }
  };

  // Function to handle selecting a workload
  const handleSelect = (label) => {
    setSelectedLabel(label);
    // Trigger any additional logic for handling the selected label here
  };

  return (
    <div className="workloads-section">
      <ul className="workloads-list">
        {labelsArray.map((label) => (
          <li
            key={label}
            className="workload-item"
            onClick={() => handleSelect(label)} // Make the workload item clickable
          >
            <span>{label}</span>
            <img
              src={delete_icon}
              alt="Delete"
              className="delete-icon"
              onClick={(e) => {
                e.stopPropagation(); // Prevent the select action when clicking the delete icon
                handleDelete(label);
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Workloads;
