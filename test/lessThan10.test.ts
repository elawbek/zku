import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const { plonk } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

import {
  LessThan10PlonkVerifier,
  LessThan10PlonkVerifier__factory,
} from "../typechain-types";

describe("LessThan10 with PLONK", function () {
  this.timeout(100000000);
  let lt10verifier: LessThan10PlonkVerifier;
  let signer: SignerWithAddress;

  beforeEach(async function () {
    [signer] = await ethers.getSigners();
    lt10verifier = await new LessThan10PlonkVerifier__factory(signer).deploy();
  });

  it("Circuit should correctly compare input", async function () {
    const circuit = await wasm_tester("circuits/LessThan10Test.circom");

    let input = {
      in: 9,
    };

    let witness = await circuit.calculateWitness(input, true);

    // console.log(witness);

    // public part of witness
    expect(witness[0]).to.eq(1n); // helper for QAP
    expect(witness[1]).to.eq(1n); // result of circuit

    input = {
      in: 11,
    };

    witness = await circuit.calculateWitness(input, true);

    // console.log(witness);

    // public part of witness
    expect(witness[0]).to.eq(1n); // helper for QAP
    expect(witness[1]).to.eq(0n); // result of circuit
  });

  it("Should return true for correct proof", async function () {
    const { proof, publicSignals } = await plonk.fullProve(
      { in: "4" },
      "circuits/LessThan10Test/LessThan10Test_js/LessThan10Test.wasm",
      "circuits/LessThan10Test/circuit_final.zkey"
    );

    console.log(publicSignals);

    console.log(`4 < 10 = ${+publicSignals[0] === 1 ? true : false}`);

    const calldata = await plonk.exportSolidityCallData(proof, publicSignals);

    const argv = calldata.replace(/["[\]\s]/g, "").split(",");

    const calldataProof = argv.shift();
    const pubSignals = argv.map((x: string) => BigNumber.from(x));

    expect(await lt10verifier.verifyProof(calldataProof, pubSignals)).to.be
      .true;
  });
});
