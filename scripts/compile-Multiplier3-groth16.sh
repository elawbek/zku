#!/bin/bash

cd circuits
rm -rf Multiplier3Test-groth16 
mkdir Multiplier3Test-groth16

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling Multiplier3Test.circom..."

# compile circuit

circom Multiplier3Test.circom --r1cs --wasm --sym -o Multiplier3Test-groth16
snarkjs r1cs info Multiplier3Test-groth16/Multiplier3Test.r1cs

# Start a new zkey and make a contribution

snarkjs groth16 setup Multiplier3Test-groth16/Multiplier3Test.r1cs powersOfTau28_hez_final_10.ptau Multiplier3Test-groth16/circuit_0000.zkey
snarkjs zkey contribute Multiplier3Test-groth16/circuit_0000.zkey Multiplier3Test-groth16/circuit_final.zkey --name="1st Contributor Name" -v -e="random text"
snarkjs zkey export verificationkey Multiplier3Test-groth16/circuit_final.zkey Multiplier3Test-groth16/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier Multiplier3Test-groth16/circuit_final.zkey ../contracts/Multiplier3Groth16Verifier.sol

cd ..

npx ts-node scripts/ts/multiplier3-groth16.ts 