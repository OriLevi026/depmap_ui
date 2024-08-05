// src/components/Repo.js
import React, { useState } from 'react';
import axios from 'axios';
import './repo.css';

const Repo = ({ setExistingLabels }) => {
  const [inputType, setInputType] = useState('GH Repo URL');
  const [inputValue, setInputValue] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClone = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/clone_repository', {
        input_type: inputType,
        input_value: inputValue,
        label: label,
      });

      console.log(response.data);
      setExistingLabels((prevLabels) => [...prevLabels, label]);
      setLoading(false);
    } catch (error) {
      console.error('There was an error cloning the repository:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (inputType === 'GH Repo URL') {
      const labelName = e.target.value.split('/').pop().replace('-', '').toLowerCase();
      setLabel(labelName);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setInputValue(event.target.result);
      setLabel(file.name.split('.')[0]);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="repo-section">
      <div className="input-type-selection">
        <input
          type="radio"
          id="gh_repo_url"
          name="inputType"
          value="GH Repo URL"
          checked={inputType === 'GH Repo URL'}
          onChange={() => setInputType('GH Repo URL')}
        />
        <label htmlFor="gh_repo_url">GH Repo URL</label>
        <input
          type="radio"
          id="text_file"
          name="inputType"
          value="Text File"
          checked={inputType === 'Text File'}
          onChange={() => setInputType('Text File')}
        />
        <label htmlFor="text_file">Text File</label>
      </div>

      {inputType === 'GH Repo URL' ? (
        <input
          type="text"
          placeholder="Enter GitHub Repo URL"
          value={inputValue}
          onChange={handleInputChange}
          className="repo-input"
        />
      ) : (
        <div
          className="drag-drop-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <p>Drag & drop a text file here, or click to select a file</p>
          <input
            type="file"
            accept=".txt"
            onChange={(e) => handleDrop(e)}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {loading ? (
        <div className="loading-animation">
          <div className="spinner"></div>
          <p>Cloning repository...</p>
        </div>
      ) : (
        <button onClick={handleClone} disabled={!label}>
          Clone
        </button>
      )}
    </div>
  );
};

export default Repo;
