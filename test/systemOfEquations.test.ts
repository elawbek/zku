import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const { plonk } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

import {
  SystemOfEquationsPlonkVerifier,
  SystemOfEquationsPlonkVerifier__factory,
} from "../typechain-types";

describe("SystemOfEquations with PLONK", function () {
  this.timeout(100000000);
  let soeVerifier: SystemOfEquationsPlonkVerifier;
  let signer: SignerWithAddress;

  beforeEach(async function () {
    [signer] = await ethers.getSigners();
    soeVerifier = await new SystemOfEquationsPlonkVerifier__factory(
      signer
    ).deploy();
  });

  it("Circuit should correctly evaluate inputs", async function () {
    const circuit = await wasm_tester("circuits/SystemOfEquations.circom");

    const input = {
      x: [15, 17, 19],
      A: [
        [1, 1, 1],
        [1, 2, 3],
        [2, -1, 1],
      ],
      b: [51, 106, 32],
    };

    const witness = await circuit.calculateWitness(input, true);

    // console.log(witness[1]); // answer of circuit

    const helper = [
      1n,
      1n,
      1n,
      1n,
      2n,
      3n,
      2n,
      21888242871839275222246405745257275088548364400416034343698204186575808495616n,
      1n,
      51n,
      106n,
      32n,
    ];

    // public inputs
    for (let i = 2; i < 12; ++i) {
      expect(witness[i].toString()).to.eq(helper[i - 2].toString());
    }
  });

  it("Should return true for correct proof", async function () {
    const { proof, publicSignals } = await plonk.fullProve(
      {
        x: [15, 17, 19],
        A: [
          [1, 1, 1],
          [1, 2, 3],
          [
            2,
            21888242871839275222246405745257275088548364400416034343698204186575808495616n, // -1
            1,
          ],
        ],
        b: [51, 106, 32],
      },
      "circuits/SystemOfEquations/SystemOfEquations_js/SystemOfEquations.wasm",
      "circuits/SystemOfEquations/circuit_final.zkey"
    );

    const calldata = await plonk.exportSolidityCallData(proof, publicSignals);

    const argv = calldata.replace(/["[\]\s]/g, "").split(",");

    const calldataProof = argv.shift();
    const pubSignals = argv.map((x: string) => BigNumber.from(x));

    expect(await soeVerifier.verifyProof(calldataProof, pubSignals)).to.be.true;
  });
});
