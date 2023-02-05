#!/bin/bash

cd circuits
rm -rf LessThan10Test 
mkdir LessThan10Test

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling LessThan10Test.circom..."

# compile circuit

circom LessThan10Test.circom --r1cs --wasm --sym -o LessThan10Test
snarkjs r1cs info LessThan10Test/LessThan10Test.r1cs

# Start a new zkey and make a contribution
snarkjs plonk setup LessThan10Test/LessThan10Test.r1cs powersOfTau28_hez_final_10.ptau LessThan10Test/circuit_final.zkey 
snarkjs zkey export verificationkey LessThan10Test/circuit_final.zkey LessThan10Test/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier LessThan10Test/circuit_final.zkey ../contracts/LessThan10PlonkVerifier.sol

cd ..

npx ts-node scripts/ts/lessThan10.ts 