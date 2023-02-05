import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const { groth16, plonk } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

import {
  Multiplier2PlonkVerifier,
  Multiplier2PlonkVerifier__factory,
  Multiplier3Groth16Verifier,
  Multiplier3Groth16Verifier__factory,
  Multiplier3PlonkVerifier,
  Multiplier3PlonkVerifier__factory,
} from "../typechain-types";

describe("Multiplier2 with PLONK", function () {
  this.timeout(100000000);
  let m2verifier: Multiplier2PlonkVerifier;
  let signer: SignerWithAddress;

  beforeEach(async function () {
    [signer] = await ethers.getSigners();
    m2verifier = await new Multiplier2PlonkVerifier__factory(signer).deploy();
  });

  it("Circuit should multiply two numbers correctly", async function () {
    const circuit = await wasm_tester("circuits/Multiplier2Test.circom");

    const INPUT = {
      a: 10,
      b: 100,
    };

    const witness = await circuit.calculateWitness(INPUT, true);

    // console.log(witness);

    // public part of witness
    expect(witness[0]).to.eq(1n); // helper for QAP
    expect(witness[1]).to.eq(1000n); // a * b
  });

  it("Should return true for correct proof", async function () {
    const { proof, publicSignals } = await plonk.fullProve(
      { a: "1222", b: "3" },
      "circuits/Multiplier2Test/Multiplier2Test_js/Multiplier2Test.wasm",
      "circuits/Multiplier2Test/circuit_final.zkey"
    );

    console.log("1222 x 3 =", publicSignals[0]);

    const calldata = await plonk.exportSolidityCallData(proof, publicSignals);

    const argv = calldata.replace(/["[\]\s]/g, "").split(",");

    const calldataProof = argv.shift();
    const pubSignals = argv.map((x: string) => BigNumber.from(x));

    expect(await m2verifier.verifyProof(calldataProof, pubSignals)).to.be.true;
  });
});

describe("Multiplier3 with Groth16", function () {
  this.timeout(100000000);
  let m3verifier: Multiplier3Groth16Verifier;
  let signer: SignerWithAddress;

  beforeEach(async function () {
    [signer] = await ethers.getSigners();
    m3verifier = await new Multiplier3Groth16Verifier__factory(signer).deploy();
  });

  it("Circuit should multiply three numbers correctly", async function () {
    const circuit = await wasm_tester("circuits/Multiplier3Test.circom");

    const INPUT = {
      a: 22,
      b: 13,
      c: 10,
    };

    const witness = await circuit.calculateWitness(INPUT, true);

    // console.log(witness);

    // public part of witness
    expect(witness[0]).to.eq(1n); // helper for QAP
    expect(witness[1]).to.eq(2860n); // a * b * c
  });

  it("Should return true for correct proof", async function () {
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "22", b: "13", c: "10" },
      "circuits/Multiplier3Test-groth16/Multiplier3Test_js/Multiplier3Test.wasm",
      "circuits/Multiplier3Test-groth16/circuit_final.zkey"
    );

    console.log("22 x 13 x 10 =", publicSignals[0]);

    const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

    const argv: BigNumber[] = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x: string) => BigNumber.from(x));

    expect(
      await m3verifier.verifyProof(
        [argv[0], argv[1]],
        [
          [argv[2], argv[3]],
          [argv[4], argv[5]],
        ],
        [argv[6], argv[7]],
        [argv[8]]
      )
    ).to.be.true;
  });
});

describe("Multiplier3 with PLONK", function () {
  this.timeout(100000000);
  let m3verifier: Multiplier3PlonkVerifier;
  let signer: SignerWithAddress;

  beforeEach(async function () {
    [signer] = await ethers.getSigners();
    m3verifier = await new Multiplier3PlonkVerifier__factory(signer).deploy();
  });

  it("Circuit should multiply two numbers correctly", async function () {
    const circuit = await wasm_tester("circuits/Multiplier3Test.circom");

    const INPUT = {
      a: 10,
      b: 100,
      c: 1000,
    };

    const witness = await circuit.calculateWitness(INPUT, true);

    // console.log(witness);

    // public part of witness
    expect(witness[0]).to.eq(1n); // helper for QAP
    expect(witness[1]).to.eq(1000000n); // a * b * c
  });

  it("Should return true for correct proof", async function () {
    const { proof, publicSignals } = await plonk.fullProve(
      { a: "10", b: "100", c: "1000" },
      "circuits/Multiplier3Test-plonk/Multiplier3Test_js/Multiplier3Test.wasm",
      "circuits/Multiplier3Test-plonk/circuit_final.zkey"
    );

    console.log("10 x 100 x 1000 =", publicSignals[0]);

    const calldata = await plonk.exportSolidityCallData(proof, publicSignals);

    const argv = calldata.replace(/["[\]\s]/g, "").split(",");

    const calldataProof = argv.shift();
    const pubSignals = argv.map((x: string) => BigNumber.from(x));

    expect(await m3verifier.verifyProof(calldataProof, pubSignals)).to.be.true;
  });
});
