const ethers = require('ethers');
const starknetMessaging = require('./StarknetMessaging');

let candidates = {};
let voters = {};
let nullifierHashes = new Set();

function registerCandidate(id, name, affiliation) {
  if (candidates[id]) {
    throw new Error('Candidato já registrado.');
  }
  candidates[id] = {
    name: name,
    affiliation: affiliation,
    votes: 0,
  };
}

function registerVoter(address) {
  if (voters[address]) {
    throw new Error('Votante já registrado.');
  }
  voters[address] = {
    hasVoted: false,
  };
}

function castVote(voterAddress, candidateId, proof, root, nullifierHash) {
  if (voters[voterAddress].hasVoted) {
    throw new Error('Votante já votou.');
  }

  if (nullifierHashes.has(nullifierHash)) {
    throw new Error('Voto duplicado detectado.');
  }

  if (!verifyZkStarkProof(proof, root, nullifierHash)) {
    throw new Error('Prova ZK-STARK inválida.');
  }

  if (!candidates[candidateId]) {
    throw new Error('Candidato não encontrado.');
  }

  candidates[candidateId].votes += 1;
  voters[voterAddress].hasVoted = true;
  nullifierHashes.add(nullifierHash);

  console.log(`Voto computado para o candidato: ${candidateId}`);
}

function verifyZkStarkProof(proof, merkleRoot, nullifierHash) {
  return ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(
    ['bytes', 'bytes32', 'bytes32'], [proof, merkleRoot, nullifierHash]
  )) === ethers.utils.keccak256(ethers.utils.toUtf8Bytes('valid'));
}

function transferVotes(fromCandidateId, toCandidateId, transferredVotes) {
  if (!candidates[fromCandidateId] || !candidates[toCandidateId]) {
    throw new Error('Candidato não encontrado.');
  }

  if (candidates[fromCandidateId].votes < transferredVotes) {
    throw new Error('Votos insuficientes para transferir.');
  }

  candidates[fromCandidateId].votes -= transferredVotes;
  candidates[toCandidateId].votes += transferredVotes;

  console.log(`Transferidos ${transferredVotes} votos do candidato ${fromCandidateId} para o candidato ${toCandidateId}`);
}

module.exports = {
  registerCandidate,
  registerVoter,
  castVote,
  transferVotes,
};