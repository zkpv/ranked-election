// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract zkSTARKVotingVerifier {
    event ProofVerified(address indexed verifier, bool valid);

    function verifyProof(
        bytes memory proof,
        bytes32 merkleRoot,
        bytes32 nullifierHash
    ) public returns (bool) {
        bool isValid = keccak256(abi.encode(proof, merkleRoot, nullifierHash)) == keccak256(abi.encodePacked("valid"));
        emit ProofVerified(msg.sender, isValid);
        return isValid;
    }
}