#!/bin/bash

cd circuits
rm -rf Multiplier2Test 
mkdir Multiplier2Test

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling Multiplier2Test.circom..."

# compile circuit

circom Multiplier2Test.circom --r1cs --wasm --sym -o Multiplier2Test
snarkjs r1cs info Multiplier2Test/Multiplier2Test.r1cs

# Start a new zkey and make a contribution
snarkjs plonk setup Multiplier2Test/Multiplier2Test.r1cs powersOfTau28_hez_final_10.ptau Multiplier2Test/circuit_final.zkey 
snarkjs zkey export verificationkey Multiplier2Test/circuit_final.zkey Multiplier2Test/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier Multiplier2Test/circuit_final.zkey ../contracts/Multiplier2PlonkVerifier.sol

cd ..

npx ts-node scripts/ts/multiplier2.ts 