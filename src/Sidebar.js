// src/components/Sidebar.js
import React, { useState } from 'react';
import Repo from './Repo';
import Workloads from './Workloads';
import Actions from './Actions';

const Sidebar = ({ existingLabels, setExistingLabels }) => {
  return (
    <div className="sidebar">
      <Repo setExistingLabels={setExistingLabels} />
      <Workloads existingLabels={existingLabels} setExistingLabels={setExistingLabels} />
      <Actions />
    </div>
  );
};

export default Sidebar;
