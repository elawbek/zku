import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const { plonk } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

import {
  SudokuPlonkVerifier,
  SudokuPlonkVerifier__factory,
} from "../typechain-types";

describe("Sudoku with PLONK", function () {
  this.timeout(100000000);
  let sudokuVerifier: SudokuPlonkVerifier;
  let signer: SignerWithAddress;

  beforeEach(async function () {
    [signer] = await ethers.getSigners();
    sudokuVerifier = await new SudokuPlonkVerifier__factory(signer).deploy();
  });

  it("Circuit should correctly evaluate inputs", async function () {
    const circuit = await wasm_tester("circuits/Sudoku.circom");

    // if the solution is wrong, there is no way to create a proof
    const input = {
      puzzle: [
        [0, 0, 0, 2, 6, 0, 7, 0, 1],
        [6, 8, 0, 0, 7, 0, 0, 9, 0],
        [1, 9, 0, 0, 0, 4, 5, 0, 0],
        [8, 2, 0, 1, 0, 0, 0, 4, 0],
        [0, 0, 4, 6, 0, 2, 9, 0, 0],
        [0, 5, 0, 0, 0, 3, 0, 2, 8],
        [0, 0, 9, 3, 0, 0, 0, 7, 4],
        [0, 4, 0, 0, 5, 0, 0, 3, 6],
        [7, 0, 3, 0, 1, 8, 0, 0, 0],
      ],
      solution: [
        [4, 3, 5, 2, 6, 9, 7, 8, 1],
        [6, 8, 2, 5, 7, 1, 4, 9, 3],
        [1, 9, 7, 8, 3, 4, 5, 6, 2],
        [8, 2, 6, 1, 9, 5, 3, 4, 7],
        [3, 7, 4, 6, 8, 2, 9, 1, 5],
        [9, 5, 1, 7, 4, 3, 6, 2, 8],
        [5, 1, 9, 3, 2, 6, 8, 7, 4],
        [2, 4, 8, 9, 5, 7, 1, 3, 6],
        [7, 6, 3, 4, 1, 8, 2, 5, 9],
      ],
    };

    const witness = await circuit.calculateWitness(input, true);
    const helper = [
      0, 0, 0, 2, 6, 0, 7, 0, 1, 6, 8, 0, 0, 7, 0, 0, 9, 0, 1, 9, 0, 0, 0, 4, 5,
      0, 0, 8, 2, 0, 1, 0, 0, 0, 4, 0, 0, 0, 4, 6, 0, 2, 9, 0, 0, 0, 5, 0, 0, 0,
      3, 0, 2, 8, 0, 0, 9, 3, 0, 0, 0, 7, 4, 0, 4, 0, 0, 5, 0, 0, 3, 6, 7, 0, 3,
      0, 1, 8, 0, 0, 0,
    ];

    // public inputs
    for (let i = 2; i < 83; ++i) {
      expect(witness[i].toString()).to.eq(helper[i - 2].toString());
    }
  });

  it("Should return true for correct proof", async function () {
    const { proof, publicSignals } = await plonk.fullProve(
      {
        puzzle: [
          [0, 0, 0, 6, 0, 0, 4, 0, 0],
          [7, 0, 0, 0, 0, 3, 6, 0, 0],
          [0, 0, 0, 0, 9, 1, 0, 8, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 5, 0, 1, 8, 0, 0, 0, 3],
          [0, 0, 0, 3, 0, 6, 0, 4, 5],
          [0, 4, 0, 2, 0, 0, 0, 6, 0],
          [9, 0, 3, 0, 0, 0, 0, 0, 0],
          [0, 2, 0, 0, 0, 0, 1, 0, 0],
        ],
        solution: [
          [5, 8, 1, 6, 7, 2, 4, 3, 9],
          [7, 9, 2, 8, 4, 3, 6, 5, 1],
          [3, 6, 4, 5, 9, 1, 7, 8, 2],
          [4, 3, 8, 9, 5, 7, 2, 1, 6],
          [2, 5, 6, 1, 8, 4, 9, 7, 3],
          [1, 7, 9, 3, 2, 6, 8, 4, 5],
          [8, 4, 5, 2, 1, 9, 3, 6, 7],
          [9, 1, 3, 7, 6, 8, 5, 2, 4],
          [6, 2, 7, 4, 3, 5, 1, 9, 8],
        ],
      },
      "circuits/Sudoku/Sudoku_js/Sudoku.wasm",
      "circuits/Sudoku/circuit_final.zkey"
    );

    const calldata = await plonk.exportSolidityCallData(proof, publicSignals);

    const argv = calldata.replace(/["[\]\s]/g, "").split(",");

    const calldataProof = argv.shift();
    const pubSignals = argv.map((x: string) => BigNumber.from(x));

    expect(await sudokuVerifier.verifyProof(calldataProof, pubSignals)).to.be
      .true;
  });
});
