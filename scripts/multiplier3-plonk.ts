import { readFileSync, writeFileSync } from "fs";

const solidityRegexPlonk = /pragma solidity >=0\.7\.0 <0\.9\.0/;

const verifierRegexPlonk = /contract PlonkVerifier/;

const content = readFileSync("./contracts/Multiplier3PlonkVerifier.sol", {
  encoding: "utf-8",
});
let bumped = content.replace(solidityRegexPlonk, "pragma solidity ^0.8.0");
bumped = bumped.replace(
  verifierRegexPlonk,
  "contract Multiplier3PlonkVerifier"
);

writeFileSync("./contracts/Multiplier3PlonkVerifier.sol", bumped);
