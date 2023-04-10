#!/bin/bash

cd circuits
rm -rf RangeProofTest 
mkdir RangeProofTest

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling RangeProofTest.circom..."

# compile circuit

circom RangeProofTest.circom --r1cs --wasm --sym -o RangeProofTest
snarkjs r1cs info RangeProofTest/RangeProofTest.r1cs

# Start a new zkey and make a contribution
snarkjs plonk setup RangeProofTest/RangeProofTest.r1cs powersOfTau28_hez_final_10.ptau RangeProofTest/circuit_final.zkey 
snarkjs zkey export verificationkey RangeProofTest/circuit_final.zkey RangeProofTest/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier RangeProofTest/circuit_final.zkey ../contracts/RangeProofPlonkVerifier.sol

cd ..

npx ts-node scripts/ts/plonk.ts RangeProof