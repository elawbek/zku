import { readFileSync, writeFileSync } from "fs";

const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/;

const verifierRegexGroth16 = /contract Verifier/;

const content = readFileSync(
  `./contracts/${process.argv[2]}Groth16Verifier.sol`,
  {
    encoding: "utf-8",
  }
);
let bumped = content.replace(solidityRegex, "pragma solidity ^0.8.0");
bumped = bumped.replace(
  verifierRegexGroth16,
  `contract ${process.argv[2]}Groth16Verifier`
);

writeFileSync(`./contracts/${process.argv[2]}Groth16Verifier.sol`, bumped);
