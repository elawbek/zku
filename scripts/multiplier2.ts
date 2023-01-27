import { readFileSync, writeFileSync } from "fs";

const solidityRegexPlonk = /pragma solidity >=0\.7\.0 <0\.9\.0/;

const verifierRegexPlonk = /contract PlonkVerifier/;

const content = readFileSync("./contracts/Multiplier2PlonkVerifier.sol", {
  encoding: "utf-8",
});
let bumped = content.replace(solidityRegexPlonk, "pragma solidity ^0.8.0");
bumped = bumped.replace(
  verifierRegexPlonk,
  "contract Multiplier2PlonkVerifier"
);

writeFileSync("./contracts/Multiplier2PlonkVerifier.sol", bumped);

// [assignment] add your own scripts below to modify the other verifier contracts you will build during the assignment
