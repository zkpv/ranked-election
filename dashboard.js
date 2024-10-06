import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

const Dashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/candidates');
        setCandidates(response.data);
        calculateTotalVotes(response.data);
      } catch (error) {
        console.error('Error fetching candidates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const calculateTotalVotes = (candidatesData) => {
    const total = candidatesData.reduce((sum, candidate) => sum + candidate.votes, 0);
    setTotalVotes(total);
  };

  const handleVerifyProof = async (candidateId) => {
    try {
      const proof = ethers.utils.formatBytes32String('valid');
      const merkleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('merkleRoot'));
      const nullifierHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('nullifierHash'));

      const response = await axios.post('/api/verify', {
        proof,
        merkleRoot,
        nullifierHash,
        candidateId,
      });

      if (response.data.valid) {
        alert('Proof verified successfully!');
      } else {
        alert('Invalid proof.');
      }
    } catch (error) {
      console.error('Error verifying proof:', error);
    }
  };

  return (
    <div>
      <h1>Results Dashboard</h1>
      {loading ? (
        <p>Loading candidates...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Votes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>{candidate.name}</td>
                <td>{candidate.votes}</td>
                <td>
                  <button onClick={() => handleVerifyProof(candidate.id)}>Verify Proof</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div>Total Votes: {totalVotes}</div>
    </div>
  );
};

export default Dashboard;