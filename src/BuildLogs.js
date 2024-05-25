import React, { useState } from 'react';

const BuildLogs = ({ logs, commitID }) => {
  const [showLogs, setShowLogs] = useState(false);

  const toggleLogsVisibility = () => {
    setShowLogs(!showLogs);
  };

  return (
    <div className="mt-4">
      {commitID && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Current Commit ID</h2>
          <p className="text-sm font-mono">{commitID}</p>
        </div>
      )}
      <h2 className="text-xl font-semibold mb-2">Build Logs</h2>
      <button
        onClick={toggleLogsVisibility}
        className="mb-2 px-4 py-2 bg-gray-500 text-white rounded"
      >
        {showLogs ? 'Hide Logs' : 'Show Logs'}
      </button>
      {showLogs && (
        <div className="h-64 overflow-y-auto p-2 bg-black text-white border border-gray-300 rounded">
          {logs.map((log, index) => (
            <p key={index} className="text-sm font-mono">{log}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuildLogs;
