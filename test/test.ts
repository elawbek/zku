import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const { plonk } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

import {
  Multiplier2PlonkVerifier,
  Multiplier2PlonkVerifier__factory,
} from "../typechain-types";

describe("Multiplier2", function () {
  this.timeout(100000000);
  let m2verifier: Multiplier2PlonkVerifier;
  let signer: SignerWithAddress;

  beforeEach(async function () {
    [signer] = await ethers.getSigners();
    m2verifier = await new Multiplier2PlonkVerifier__factory(signer).deploy();
  });

  it("Circuit should multiply two numbers correctly", async function () {
    const circuit = await wasm_tester("circuits/Multiplier2.circom");

    const INPUT = {
      a: 10,
      b: 100,
    };

    const witness = await circuit.calculateWitness(INPUT, true);

    // console.log(witness);

    expect(witness).to.deep.eq([1n, 1000n, 10n, 100n]);
  });

  it("Should return true for correct proof", async function () {
    //[assignment] Add comments to explain what each line is doing
    const { proof, publicSignals } = await plonk.fullProve(
      { a: "1222", b: "3" },
      "circuits/Multiplier2/Multiplier2_js/Multiplier2.wasm",
      "circuits/Multiplier2/circuit_final.zkey"
    );

    console.log("1222 x 3 =", publicSignals[0]);

    const calldata = await plonk.exportSolidityCallData(proof, publicSignals);

    const argv = calldata.replace(/["[\]\s]/g, "").split(",");

    const calldataProof = argv.shift();
    const pubSignals = argv.map((x: string) => ethers.BigNumber.from(x));

    expect(await m2verifier.verifyProof(calldataProof, pubSignals)).to.be.true;
  });
});
