import { readFileSync, writeFileSync } from "fs";

const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/;

const verifierRegexGroth16 = /contract Verifier/;

const content = readFileSync("./contracts/Multiplier3Groth16Verifier.sol", {
  encoding: "utf-8",
});
let bumped = content.replace(solidityRegex, "pragma solidity ^0.8.0");
bumped = bumped.replace(
  verifierRegexGroth16,
  "contract Multiplier3Groth16Verifier"
);

writeFileSync("./contracts/Multiplier3Groth16Verifier.sol", bumped);
