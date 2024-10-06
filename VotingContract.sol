// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./StarknetMessaging.sol";

contract VotingContract {
    struct Candidate {
        string name;
        string affiliation;
        uint256 votes;
        bool exists;
    }

    mapping(uint256 => Candidate) public candidates;
    uint256 public candidateCount;

    mapping(address => bool) public hasVoted;

    event CandidateRegistered(uint256 candidateId, string name, string affiliation);
    event VoteCast(address voter, uint256 candidateId);
    event VoteTransfer(uint256 candidateId, uint256 transferredVotes);

    StarknetMessaging starknetMessaging;

    constructor(address _starknetMessagingAddress) {
        starknetMessaging = StarknetMessaging(_starknetMessagingAddress);
    }

    function registerCandidate(string memory _name, string memory _affiliation) public {
        candidateCount++;
        candidates[candidateCount] = Candidate(_name, _affiliation, 0, true);
        emit CandidateRegistered(candidateCount, _name, _affiliation);
    }

    function castVote(uint256 _candidateId, bytes memory proof, bytes32 merkleRoot, bytes32 nullifierHash) public {
        require(!hasVoted[msg.sender], "Voter has already voted.");
        require(candidates[_candidateId].exists, "Candidate does not exist.");
        require(starknetMessaging.verifyZkStarkProof(proof, merkleRoot, nullifierHash), "Invalid zk-STARK proof.");

        candidates[_candidateId].votes++;
        hasVoted[msg.sender] = true;
        emit VoteCast(msg.sender, _candidateId);
    }

    function transferVotes(uint256 _fromCandidateId, uint256 _toCandidateId, uint256 _votes) public {
        require(candidates[_fromCandidateId].exists, "Source candidate does not exist.");
        require(candidates[_toCandidateId].exists, "Destination candidate does not exist.");
        require(candidates[_fromCandidateId].votes >= _votes, "Not enough votes to transfer.");

        candidates[_fromCandidateId].votes -= _votes;
        candidates[_toCandidateId].votes += _votes;
        emit VoteTransfer(_toCandidateId, _votes);
    }

    function getCandidate(uint256 _candidateId) public view returns (string memory name, string memory affiliation, uint256 votes) {
        require(candidates[_candidateId].exists, "Candidate does not exist.");
        Candidate memory candidate = candidates[_candidateId];
        return (candidate.name, candidate.affiliation, candidate.votes);
    }

    function getTotalVotes(uint256 _candidateId) public view returns (uint256) {
        require(candidates[_candidateId].exists, "Candidate does not exist.");
        return candidates[_candidateId].votes;
    }
}