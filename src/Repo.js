// src/components/Repo.js
import React, { useState } from 'react';

const Repo = ({ setExistingLabels }) => {
  const [inputType, setInputType] = useState('GH Repo URL');
  const [inputValue, setInputValue] = useState('');
  const [label, setLabel] = useState('');

  const handleClone = () => {
    if (label && inputValue) {
      // Simulate depmapper.clone_repository function
      console.log(`Cloning repository with label: ${label}`);
      setExistingLabels(prevLabels => [...prevLabels, label]);
    } else {
      alert('Please provide input before cloning.');
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (inputType === 'GH Repo URL') {
      const labelName = e.target.value.split('/').pop().replace('-', '').toLowerCase();
      setLabel(labelName);
    }
  };

  return (
    <div className="repo-section">
      <h3>Repo</h3>
      <div>
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
      <input
        type="text"
        placeholder={inputType === 'GH Repo URL' ? 'Enter GitHub Repo URL' : 'Upload Text File'}
        value={inputValue}
        onChange={handleInputChange}
      />
      <button onClick={handleClone} disabled={!label}>Clone</button>
    </div>
  );
};

export default Repo;
