#!/bin/bash

cd circuits
rm -rf MultiplierNTest 
mkdir MultiplierNTest

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling MultiplierNTest.circom..."

# compile circuit

circom MultiplierNTest.circom --r1cs --wasm --sym -o MultiplierNTest
snarkjs r1cs info MultiplierNTest/MultiplierNTest.r1cs

# Start a new zkey and make a contribution
snarkjs plonk setup MultiplierNTest/MultiplierNTest.r1cs powersOfTau28_hez_final_10.ptau MultiplierNTest/circuit_final.zkey 
snarkjs zkey export verificationkey MultiplierNTest/circuit_final.zkey MultiplierNTest/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier MultiplierNTest/circuit_final.zkey ../contracts/MultiplierNPlonkVerifier.sol

cd ..

npx ts-node scripts/ts/plonk.ts MultiplierN