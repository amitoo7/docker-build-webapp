import React, { useState } from 'react';
import axios from 'axios';

const BuildForm = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [logs, setLogs] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [commitID, setCommitID] = useState('');

  const handleBuild = async () => {
    setLogs([]); // Clear old logs
    setIsBuilding(true);
    setCommitID(''); // Clear old commit ID
    const response = await axios.post('http://192.168.1.6:8080/api/build', { repoUrl });
    const { buildId, commitId } = response.data;
    setCommitID(commitId.trim()); // Trim any newline or extra spaces
    const ws = new WebSocket(`ws://192.168.1.6:8080/api/logs/${buildId}`);

    ws.onmessage = (event) => {
      if (event.data === "BUILD_COMPLETE") {
        setIsBuilding(false); // Change button back to "Build"
        ws.close();
      } else {
        setLogs((prevLogs) => [...prevLogs, event.data]);
      }
    };

    ws.onclose = () => {
      setIsBuilding(false); // Change button back to "Build"
    };
  };

  return (
    <div className="p-4 max-w-lg mx-auto mt-10 bg-white rounded shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Docker Build Webapp</h1>
      <input
        type="text"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        placeholder="Repository URL"
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />
      <button
        onClick={handleBuild}
        className={`w-full p-2 rounded text-white ${isBuilding ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'}`}
        disabled={isBuilding}
      >
        {isBuilding ? 'Building...' : 'Build'}
      </button>
      {commitID && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Last Commit ID</h2>
          <p className="text-sm font-mono">{commitID}</p>
        </div>
      )}
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Build Logs</h2>
        <div className="h-64 overflow-y-auto p-2 bg-black text-white border border-gray-300 rounded">
          {logs.map((log, index) => (
            <p key={index} className="text-sm font-mono">{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuildForm;
