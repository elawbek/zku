#!/bin/bash

cd circuits
rm -rf Multiplier3Test-plonk 
mkdir Multiplier3Test-plonk

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling Multiplier3Test.circom..."

# compile circuit

circom Multiplier3Test.circom --r1cs --wasm --sym -o Multiplier3Test-plonk
snarkjs r1cs info Multiplier3Test-plonk/Multiplier3Test.r1cs

# Start a new zkey and make a contribution
snarkjs plonk setup Multiplier3Test-plonk/Multiplier3Test.r1cs powersOfTau28_hez_final_10.ptau Multiplier3Test-plonk/circuit_final.zkey 
snarkjs zkey export verificationkey Multiplier3Test-plonk/circuit_final.zkey Multiplier3Test-plonk/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier Multiplier3Test-plonk/circuit_final.zkey ../contracts/Multiplier3PlonkVerifier.sol

cd ..

npx ts-node scripts/ts/multiplier3-plonk.ts 