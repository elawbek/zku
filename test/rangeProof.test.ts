import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const { plonk } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

import {
  RangeProofPlonkVerifier,
  RangeProofPlonkVerifier__factory,
} from "../typechain-types";

describe("RangeProof with PLONK", function () {
  this.timeout(100000000);
  let RPverifier: RangeProofPlonkVerifier;
  let signer: SignerWithAddress;

  beforeEach(async function () {
    [signer] = await ethers.getSigners();
    RPverifier = await new RangeProofPlonkVerifier__factory(signer).deploy();
  });

  it("Circuit should correctly compare input", async function () {
    const circuit = await wasm_tester("circuits/RangeProofTest.circom");

    let input = {
      in: 9,
      range: [5, 25],
    };

    let witness = await circuit.calculateWitness(input, true);

    // console.log(witness);

    // public part of witness
    expect(witness[0]).to.eq(1n); // helper for QAP
    expect(witness[1]).to.eq(1n); // result of circuit
    expect(witness[2]).to.eq(5n); // range[0]
    expect(witness[3]).to.eq(25n); // range[1]

    input = {
      in: 26,
      range: [5, 25],
    };

    witness = await circuit.calculateWitness(input, true);

    // console.log(witness);

    // public part of witness
    expect(witness[0]).to.eq(1n); // helper for QAP
    expect(witness[1]).to.eq(0n); // result of circuit
    expect(witness[2]).to.eq(5n); // range[0]
    expect(witness[3]).to.eq(25n); // range[1]
  });

  it("Should return true for correct proof", async function () {
    const { proof, publicSignals } = await plonk.fullProve(
      { in: "24", range: ["2", "100"] },
      "circuits/RangeProofTest/RangeProofTest_js/RangeProofTest.wasm",
      "circuits/RangeProofTest/circuit_final.zkey"
    );

    console.log(`2 <= 24 <= 100 = ${+publicSignals[0] === 1 ? true : false}`);

    const calldata = await plonk.exportSolidityCallData(proof, publicSignals);

    const argv = calldata.replace(/["[\]\s]/g, "").split(",");

    const calldataProof = argv.shift();
    const pubSignals = argv.map((x: string) => BigNumber.from(x));

    expect(await RPverifier.verifyProof(calldataProof, pubSignals)).to.be.true;
  });
});
