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
    
    // Simulate 3 seconds loading time
    setTimeout(() => {
      setIsLoading(false);
      setLoadingAction(null); // Reset the loading action after view
    }, 3000);
  };

  return (
    <div>
      <h3>Available Actions</h3>
      <div className="actions-list">
        {actions.length > 0 ? (
          actions.map((action, index) => (
            <div key={index} className="action-card">
              <span className="action-name">{action}</span>
              <button
                className="show-action-button"
                onClick={() => handleActionClick(action)}
                disabled={isLoading && loadingAction === action} // Disable button during loading
              >
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
