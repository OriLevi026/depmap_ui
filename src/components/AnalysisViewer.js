import React, { useMemo, useState } from 'react';
import Papa from 'papaparse';
import './analysisViewer.css';

const AnalysisViewer = ({ data }) => {
  const [showBreakingChange, setShowBreakingChange] = useState(false);
  const [showDeprecated, setShowDeprecated] = useState(false);
  const [selectedFile, setSelectedFile] = useState('All Files');

  const handleDownloadCSV = () => {
    if (!data || data.length === 0) {
      console.error('No data to download');
      return;
    }

    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'analysis_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    let filtered = data;
    if (showBreakingChange) {
      filtered = filtered.filter((item) => item['Potential Breaking Change'] === 'True');
    }
    if (showDeprecated) {
      filtered = filtered.filter((item) => item['Deprecated'] === 'True');
    }
    if (selectedFile !== 'All Files') {
      filtered = filtered.filter((item) => item['File'] === selectedFile);
    }
    return filtered;
  }, [data, showBreakingChange, showDeprecated, selectedFile]);

  const headers = useMemo(() => (filteredData.length > 0 ? Object.keys(filteredData[0]) : []), [filteredData]);

  return (
    <div className="analysis-viewer">
      <div className="viewer-container">
        <div className="viewer-header">
          <h3>Data Viewer</h3>
          <button className="download-button" onClick={handleDownloadCSV}>
            Download CSV
          </button>
        </div>
        <div className="viewer-filters">
          <label>
            <input
              type="checkbox"
              checked={showBreakingChange}
              onChange={() => setShowBreakingChange(!showBreakingChange)}
            />
            Show Potential Breaking Change
          </label>
          <label>
            <input
              type="checkbox"
              checked={showDeprecated}
              onChange={() => setShowDeprecated(!showDeprecated)}
            />
            Show Deprecated
          </label>
          <label>
            File:
            <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
              <option value="All Files">All Files</option>
              {Array.from(new Set(data.map((item) => item['File']))).map((file, index) => (
                <option key={index} value={file}>
                  {file}
                </option>
              ))}
            </select>
          </label>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header, colIndex) => (
                  <td
                    key={colIndex}
                    className={`
                      ${header === 'Notes' || header === 'File' ? 'notes-cell' : ''} 
                      ${header === 'Current' || header === 'Latest' ? 'version-cell' : ''} 
                      ${row[header] === 'True' ? 'true-cell' : ''}
                    `}
                  >
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalysisViewer;
