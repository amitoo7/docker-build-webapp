import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BuildLogs from './BuildLogs';

const BuildForm = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [logs, setLogs] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [commitID, setCommitID] = useState('');
  const [lastCommitID, setLastCommitID] = useState(''); // Separate state for last build commit ID

  useEffect(() => {
    const fetchLastBuild = async () => {
      try {
        const response = await axios.get('http://192.168.1.7:8080/api/last-build');
        const commitID  = response.data.commitId;
        console.log("Last commit id: ", commitID)
        setLastCommitID(commitID);
      } catch (error) {
        console.error('Error fetching last build details:', error);
      }
    };

    fetchLastBuild();
  }, []);

  const handleBuild = async () => {
    if (!repoUrl) {
      alert('Repository URL is required');
      return;
    }

    setLogs([]); // Clear old logs
    setIsBuilding(true);
    setCommitID(''); // Clear old commit ID
    const response = await axios.post('http://192.168.1.7:8080/api/build', { repoUrl });
    const { buildId, commitId } = response.data;
    setCommitID(commitId); // No need to trim here since it's already trimmed in backend
    const ws = new WebSocket(`ws://192.168.1.7:8080/api/logs/${buildId}`);

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
        required
      />
      <button
        onClick={handleBuild}
        className={`w-full p-2 rounded text-white ${isBuilding ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'}`}
        disabled={isBuilding}
      >
        {isBuilding ? 'Building...' : 'Build'}
      </button>
      {lastCommitID && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Last Commit ID</h2>
          <p className="text-sm font-mono">{lastCommitID}</p>
        </div>
      )}
      <BuildLogs logs={logs} commitID={commitID} />
    </div>
  );
};

export default BuildForm;
