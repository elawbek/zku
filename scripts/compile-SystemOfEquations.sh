#!/bin/bash

cd circuits
rm -rf SystemOfEquations 
mkdir SystemOfEquations

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling SystemOfEquations.circom..."

# compile circuit

circom SystemOfEquations.circom --r1cs --wasm --sym -o SystemOfEquations
snarkjs r1cs info SystemOfEquations/SystemOfEquations.r1cs

# Start a new zkey and make a contribution
snarkjs plonk setup SystemOfEquations/SystemOfEquations.r1cs powersOfTau28_hez_final_10.ptau SystemOfEquations/circuit_final.zkey 
snarkjs zkey export verificationkey SystemOfEquations/circuit_final.zkey SystemOfEquations/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier SystemOfEquations/circuit_final.zkey ../contracts/SystemOfEquationsPlonkVerifier.sol

cd ..

npx ts-node scripts/ts/plonk.ts SystemOfEquations