const ethers = require('ethers');

let candidates = {};
let candidateCount = 0;

function registerCandidate(name, affiliation) {
  candidateCount++;
  const candidateId = candidateCount;

  if (candidates[candidateId]) {
    throw new Error('Candidato já registrado.');
  }

  candidates[candidateId] = {
    id: candidateId,
    name: name,
    affiliation: affiliation,
    votes: 0,
    exists: true
  };

  console.log(`Candidato registrado com sucesso: ${name}, Afiliado a: ${affiliation}`);
}

function getCandidates() {
  return Object.values(candidates);
}

module.exports = {
  registerCandidate,
  getCandidates
};