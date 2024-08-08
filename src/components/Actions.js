// src/components/Actions.js
import React, { useState } from 'react';
import './actions.css';
import showIcon from '../icons/icons8-json-100.png';

const Actions = ({ actions, handleViewAction, handleAddAction }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null); // Track which action is being loaded

  const handleActionClick = (action) => {
    handleViewAction(action);
    setIsLoading(true);
    setLoadingAction(action);
    
    // Simulate loading time (or replace with real data fetching logic)
    setTimeout(() => {
      setIsLoading(false);
      setLoadingAction(null); // Reset the loading action after view
    }, 3000);
  };

  return (
    <div>
      <div className="actions-list">
        {Object.entries(actions).length > 0 ? (
          Object.entries(actions).map(([key, action], index) => (
            <div key={index} className="action-card">
              <button
                className="show-action-button"
                onClick={() => handleActionClick(action)}
                disabled={isLoading && loadingAction === action} // Disable button during loading
              >
              <span className="action-name">{(action.PK.split('#')[1]).replaceAll('_',' ').toUpperCase() || `Action ${index + 1}`}</span>
                {isLoading && loadingAction === action ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <img src={showIcon} alt="show" className="show-icon" />
                )}
              </button>
            </div>
          ))
        ) : (
          <div>No actions available</div>
        )}
      </div>
      <button className="add-action-button" onClick={handleAddAction}>
        Add New Action
      </button>
    </div>
  );
};

export default Actions;
